"use client";

import * as React from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
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
  disabled?: boolean; // ✅ Already present
}

interface AsyncComboboxProps {
  value?: string;
  onValueChange?: (value: string, label?: string) => void;
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
  /** Currently selected option label (for display when value is set) */
  selectedLabel?: string;
  disabled?: boolean;
}

export function AsyncCombobox({
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
  queryKey,
  fetchOptions,
  debounceMs = 300,
  staleTime = 5 * 60 * 1000,
  selectedLabel,
  ...props
}: AsyncComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

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

  const displayLabel = React.useMemo(() => {
    if (!value || value === "all") return placeholder;
    const option = options.find((opt) => opt.value === value);
    if (option) return option.label;
    if (selectedLabel) return selectedLabel;
    return placeholder;
  }, [value, options, placeholder, selectedLabel]);

  // Show loading in list when initially loading OR when refetching with no cached data
  const showListLoading = isLoading || (isFetching && options.length === 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-8 w-full cursor-pointer text-xs font-normal gap-1.5 pl-2! pr-1! shadow-xs overflow-hidden",
            className,
          )}
        >
          <span className="truncate flex-1 text-left">{displayLabel}</span>
          {isFetching && showListLoading ? (
            <Loader2 className="h-3 w-3 animate-spin opacity-50 shrink-0" />
          ) : (
            <ChevronDown className="opacity-50 h-4 w-4 shrink-0" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        onWheel={(e) => {
          e.stopPropagation();
        }}
        onTouchMove={(e) => {
          e.stopPropagation();
        }}
        className="w-[415px] p-0"
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
            ) : options.length === 0 ? (
              <CommandEmpty>{emptyText}</CommandEmpty>
            ) : (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    // ✅ ADD: Disable the item if option.disabled is true
                    disabled={option.disabled}
                    // ✅ ADD: Apply disabled styles
                    className={cn(
                      "cursor-pointer w-full",
                      option.disabled && "opacity-50 cursor-not-allowed",
                    )}
                    onSelect={(currentValue) => {
                      // ✅ ADD: Prevent selection if disabled
                      if (option.disabled) {
                        return;
                      }

                      const selectedOption = options.find(
                        (o) => o.value === currentValue,
                      );
                      onValueChange?.(
                        currentValue === value ? "" : currentValue,
                        selectedOption?.label,
                      );
                      setOpen(false);
                    }}
                  >
                    {option.label}

                    {/* ✅ ADD: Show "Already added" text for disabled items */}
                    {option.disabled && (
                      <span className="ml-auto text-xs text-muted-foreground italic">
                        Already added
                      </span>
                    )}

                    {/* ✅ MODIFY: Only show checkmark for non-disabled selected items */}
                    {!option.disabled && (
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0",
                        )}
                      />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
