import React, { useCallback } from "react";
import { differenceInMonths, isBefore, startOfDay } from "date-fns";
import { Filter, X } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AsyncCombobox,
  AsyncComboboxOption,
} from "@/components/ui/async-combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminService } from "@/services/adminService";
import { BillingFilters, getDefaultFilters } from "@/types/billings";

interface BillingFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: BillingFilters;
  onApplyFilters: (filters: BillingFilters) => void;
}

export function BillingFilterSheet({
  open,
  onOpenChange,
  filters,
  onApplyFilters,
}: BillingFilterSheetProps) {
  const [localFilters, setLocalFilters] =
    React.useState<BillingFilters>(filters);
  const [dateError, setDateError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setLocalFilters(filters);
      setDateError(null);
    }
  }, [open, filters]);

  const fetchOrganizers = useCallback(
    async (search: string): Promise<AsyncComboboxOption[]> => {
      try {
        const response = await adminService.getAllEntities("organizers");
        if (!response || !Array.isArray(response)) return [];

        const filtered = search
          ? response.filter((org) =>
              `${org.name}`.toLowerCase().includes(search.toLowerCase()),
            )
          : response;

        return filtered.map((org) => ({ value: org.id, label: `${org.name}` }));
      } catch (error) {
        console.error("Failed to fetch organizers:", error);
        return [];
      }
    },
    [],
  );

  const handleDateChange = (
    field: "start_date" | "end_date",
    date: Date | undefined,
  ) => {
    const updated = { ...localFilters, [field]: date };
    setDateError(null);

    if (updated.start_date && updated.end_date) {
      if (
        isBefore(startOfDay(updated.end_date), startOfDay(updated.start_date))
      ) {
        setDateError("End date cannot be before start date");
        return;
      }
      if (differenceInMonths(updated.end_date, updated.start_date) > 3) {
        setDateError("Date range cannot exceed 3 months");
        toast.error("Date range cannot exceed 3 months");
        return;
      }
    }

    setLocalFilters(updated);
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onOpenChange(false);
  };

  const handleClear = () => {
    const defaultFilters = getDefaultFilters();
    setLocalFilters(defaultFilters);
    onApplyFilters(defaultFilters);
  };

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (localFilters.start_date) count++;
    if (localFilters.end_date) count++;
    if (localFilters.organizer_id) count++;
    if (localFilters.status !== "") count++;
    return count;
  }, [localFilters]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[450px] sm:max-w-[450px] flex flex-col bg-[#f5f7f8]"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Bills
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Date Range */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !localFilters.start_date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.start_date ? (
                        format(localFilters.start_date, "LLL dd, y")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={localFilters.start_date}
                      onSelect={(date) => handleDateChange("start_date", date)}
                      captionLayout="dropdown"
                      fromYear={2010}
                      toYear={new Date().getFullYear()}
                      toDate={new Date()}
                      disabled={{ after: new Date() }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !localFilters.end_date && "text-muted-foreground",
                        dateError && "text-destructive border-destructive",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.end_date ? (
                        format(localFilters.end_date, "LLL dd, y")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={localFilters.end_date}
                      onSelect={(date) => handleDateChange("end_date", date)}
                      captionLayout="dropdown"
                      fromYear={2010}
                      toYear={new Date().getFullYear()}
                      toDate={new Date()}
                      disabled={{ after: new Date() }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {dateError && (
                  <p className="text-xs text-destructive">{dateError}</p>
                )}
              </div>
            </div>
            {/* <p className="text-xs text-muted-foreground">
              Maximum range: 3 months
            </p> */}
          </div>

          {/* Organizer */}
          <div className="space-y-2">
            <Label>Organizer</Label>
            <AsyncCombobox
              queryKey={["filter", "organizers"]}
              value={localFilters.organizer_id ?? ""}
              onValueChange={(val) =>
                setLocalFilters((prev) => ({ ...prev, organizer_id: val }))
              }
              fetchOptions={fetchOrganizers}
              placeholder="Select organizer"
              searchPlaceholder="Search organizers..."
              emptyText="No organizers found"
              className="w-full text-sm h-9 justify-between px-3!"
              debounceMs={300}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={localFilters.status}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="w-full text-sm h-9 justify-between px-3! bg-white">
                <SelectValue
                  placeholder="Select status"
                  className="text-black data-[placeholder]:text-black"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="flex-row gap-2">
          <Button variant="outline" onClick={handleClear} className="flex-1">
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
          <Button
            onClick={handleApply}
            disabled={!!dateError}
            className="flex-1 w-full sm:w-auto gap-2 bg-primary hover:bg-primary/80 text-primary-foreground shadow-sm transition-all ease-out duration-300 active:scale-95"
          >
            <Filter className="mr-2 h-4 w-4" />
            Apply Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-amber-700 text-white text-xs px-1.5 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
