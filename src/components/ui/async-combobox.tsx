"use client";

import * as React from "react";
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/useDebounce";

export interface AsyncComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// --- Single-select props ---
interface SingleSelectProps {
  multiple?: false;
  value?: string;
  onValueChange?: (value: string, label?: string) => void;
  /** Currently selected option label (for display when value is set) */
  selectedLabel?: string;
  defaultOption?: AsyncComboboxOption;
}

// --- Multi-select props ---
interface MultiSelectProps {
  multiple: true;
  value?: string[];
  onValueChange?: (value: string[], labels?: string[]) => void;
  selectedLabel?: never;
  defaultOption?: never;
  /** Options that should always appear as selected & disabled (externally managed) */
  disabledValues?: string[];
  /** Max number of selectable items (optional) */
  maxSelections?: number;
}

// --- Common props ---
interface CommonProps {
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  /** Unique query key for React Query caching */
  queryKey: string[];
  /** Function to fetch options based on search term */
  fetchOptions: (search: string) => Promise<AsyncComboboxOption[]>;
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Cache time in ms (default 5 minutes) */
  staleTime?: number;
  disabled?: boolean;
}

type AsyncComboboxProps = CommonProps & (SingleSelectProps | MultiSelectProps);

export function AsyncCombobox(props: AsyncComboboxProps) {
  const {
    placeholder = "Select...",
    searchPlaceholder = "Search...",
    emptyText = "No results found.",
    className,
    queryKey,
    fetchOptions,
    debounceMs = 300,
    staleTime = 5 * 60 * 1000,
    disabled,
  } = props;

  const isMulti = props.multiple === true;

  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  // Track labels for selected multi-select values so we can display them
  // even when the option isn't in the current fetched page
  const [labelMap, setLabelMap] = React.useState<Map<string, string>>(
    new Map(),
  );

  const debouncedSearch = useDebounce(searchTerm, debounceMs);

  const {
    data: options = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [...queryKey, debouncedSearch],
    queryFn: () => fetchOptions(debouncedSearch),
    staleTime,
    gcTime: staleTime * 2,
    enabled: open,
    placeholderData: (previousData) => previousData,
  });

  React.useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open]);

  // Keep labelMap in sync with fetched options
  React.useEffect(() => {
    if (options.length === 0) return;
    setLabelMap((prev) => {
      const next = new Map(prev);
      let changed = false;
      for (const opt of options) {
        if (!next.has(opt.value)) {
          next.set(opt.value, opt.label);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [options]);

  // ─── Single-select helpers ───
  const singleValue = !isMulti
    ? (props.value as string | undefined)
    : undefined;
  const singleDefaultOption = !isMulti ? props.defaultOption : undefined;
  const singleSelectedLabel = !isMulti ? props.selectedLabel : undefined;

  const mergedOptions = React.useMemo(() => {
    if (!singleDefaultOption) return options;
    const exists = options.some((o) => o.value === singleDefaultOption.value);
    return exists ? options : [singleDefaultOption, ...options];
  }, [options, singleDefaultOption]);

  const singleDisplayLabel = React.useMemo(() => {
    if (!singleValue || singleValue === "all") return placeholder;
    const option = mergedOptions.find((opt) => opt.value === singleValue);
    if (option) return option.label;
    if (singleSelectedLabel) return singleSelectedLabel;
    if (singleDefaultOption?.value === singleValue)
      return singleDefaultOption.label;
    return placeholder;
  }, [
    singleValue,
    mergedOptions,
    placeholder,
    singleSelectedLabel,
    singleDefaultOption,
  ]);

  // ─── Multi-select helpers ───
  const multiValue = isMulti
    ? ((props.value as string[] | undefined) ?? [])
    : [];
  const disabledValues = isMulti ? (props.disabledValues ?? []) : [];
  const maxSelections = isMulti ? props.maxSelections : undefined;

  const selectedSet = React.useMemo(() => new Set(multiValue), [multiValue]);
  const disabledSet = React.useMemo(
    () => new Set(disabledValues),
    [disabledValues],
  );

  const isValueSelected = (val: string) => selectedSet.has(val);
  const isValueDisabled = (val: string) => disabledSet.has(val);
  const isMaxReached =
    maxSelections !== undefined && multiValue.length >= maxSelections;

  const handleMultiSelect = (optionValue: string, optionLabel: string) => {
    if (!isMulti) return;
    const onValueChange = props.onValueChange as
      | ((value: string[], labels?: string[]) => void)
      | undefined;

    // Update label map
    setLabelMap((prev) => {
      if (prev.has(optionValue)) return prev;
      const next = new Map(prev);
      next.set(optionValue, optionLabel);
      return next;
    });

    if (isValueSelected(optionValue)) {
      // Deselect
      const next = multiValue.filter((v) => v !== optionValue);
      const nextLabels = next.map((v) => labelMap.get(v) ?? v);
      onValueChange?.(next, nextLabels);
    } else {
      // Select (respect max)
      if (isMaxReached) return;
      const next = [...multiValue, optionValue];
      const nextLabels = next.map((v) =>
        v === optionValue ? optionLabel : (labelMap.get(v) ?? v),
      );
      onValueChange?.(next, nextLabels);
    }
  };

  const handleRemove = (val: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!isMulti) return;
    const onValueChange = props.onValueChange as
      | ((value: string[], labels?: string[]) => void)
      | undefined;
    const next = multiValue.filter((v) => v !== val);
    const nextLabels = next.map((v) => labelMap.get(v) ?? v);
    onValueChange?.(next, nextLabels);
  };

  const showListLoading =
    isLoading || (isFetching && mergedOptions.length === 0);

  // For multi-select, the list to iterate is just `options` (no defaultOption merging)
  const displayOptions = isMulti ? options : mergedOptions;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-auto min-h-8 w-full cursor-pointer text-xs font-normal gap-1.5 pl-2! pr-1! shadow-xs overflow-hidden",
            isMulti && multiValue.length > 0 && "py-1",
            className,
          )}
        >
          {isMulti && multiValue.length > 0 ? (
            <span className="flex flex-1 flex-wrap gap-1 overflow-hidden">
              {multiValue.map((val) => (
                <Badge
                  key={val}
                  variant="secondary"
                  className="text-xs font-normal gap-0.5 pr-0.5 max-w-[150px]"
                >
                  <span className="truncate">{labelMap.get(val) ?? val}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    className="ml-0.5 rounded-sm p-0.5 hover:bg-muted-foreground/20 cursor-pointer"
                    onClick={(e) => handleRemove(val, e)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleRemove(val);
                      }
                    }}
                  >
                    <X className="h-3 w-3" />
                  </span>
                </Badge>
              ))}
            </span>
          ) : (
            <span className="truncate flex-1 text-left">
              {isMulti ? placeholder : singleDisplayLabel}
            </span>
          )}
          {isFetching && showListLoading ? (
            <Loader2 className="h-3 w-3 animate-spin opacity-50 shrink-0" />
          ) : (
            <ChevronDown className="opacity-50 h-4 w-4 shrink-0" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            className="h-9"
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {showListLoading || isFetching ? (
              <div className="py-6 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : displayOptions.length === 0 ? (
              <CommandEmpty>{emptyText}</CommandEmpty>
            ) : (
              <CommandGroup>
                {displayOptions.map((option) => {
                  const isSelected = isMulti
                    ? isValueSelected(option.value)
                    : singleValue === option.value;
                  const isItemDisabled = isMulti
                    ? option.disabled ||
                      isValueDisabled(option.value) ||
                      (isMaxReached && !isSelected)
                    : option.disabled;

                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      disabled={isItemDisabled}
                      className={cn(
                        "cursor-pointer w-full flex justify-between",
                        isItemDisabled && "opacity-50 cursor-not-allowed",
                      )}
                      title={option.label}
                      onSelect={(currentValue) => {
                        if (isItemDisabled && !isSelected) return;

                        if (isMulti) {
                          handleMultiSelect(currentValue, option.label);
                          // Don't close popover in multi-select mode
                        } else {
                          const singleOnChange = props.onValueChange as
                            | ((value: string, label?: string) => void)
                            | undefined;
                          const selectedOption = mergedOptions.find(
                            (o) => o.value === currentValue,
                          );
                          singleOnChange?.(
                            currentValue === singleValue ? "" : currentValue,
                            selectedOption?.label,
                          );
                          setOpen(false);
                        }
                      }}
                    >
                      <span className="truncate">{option.label}</span>
                      {isMulti && (
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 shrink-0",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        />
                      )}

                      {isItemDisabled && isMulti && !isSelected && (
                        <span className="ml-auto text-xs text-muted-foreground italic">
                          Already added
                        </span>
                      )}

                      {!isMulti && option.disabled && (
                        <span className="ml-auto text-xs text-muted-foreground italic">
                          Already added
                        </span>
                      )}

                      {!isMulti && !option.disabled && (
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
