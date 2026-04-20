import React, { useCallback } from "react";
import { differenceInMonths, isBefore, startOfDay } from "date-fns";
import { Filter, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { adminService } from "@/services/adminService";
import { TransactionFilters, getDefaultFilters } from "@/types/transaction";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "@phosphor-icons/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
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

interface TransactionFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: TransactionFilters;
  onApplyFilters: (filters: TransactionFilters) => void;
}

export function TransactionFilterSheet({
  open,
  onOpenChange,
  filters,
  onApplyFilters,
}: TransactionFilterSheetProps) {
  const [localFilters, setLocalFilters] =
    React.useState<TransactionFilters>(filters);
  const [dateError, setDateError] = React.useState<string | null>(null);
    const { locale } = useLanguageStore();
    const { t } = useTranslation(locale);

  React.useEffect(() => {
    if (open) {
      setLocalFilters(filters);
      setDateError(null);
    }
  }, [open, filters]);

  const fetchEvents = useCallback(
    async (search: string): Promise<AsyncComboboxOption[]> => {
      try {
        const response = await adminService.getAllEntities("events");
        if (!response || !Array.isArray(response)) return [];

        const filtered = search
          ? response.filter((event) =>
              event.title.toLowerCase().includes(search.toLowerCase()),
            )
          : response;

        return filtered.map((event) => ({
          value: event.id,
          label: event.title,
        }));
      } catch (error) {
        console.error("Failed to fetch events:", error);
        return [];
      }
    },
    [],
  );
  const fetchUser = useCallback(
    async (search: string): Promise<AsyncComboboxOption[]> => {
      try {
        const response = await adminService.getAllEntities("users");
        if (!response || !Array.isArray(response)) return [];

        const filtered = search
          ? response.filter((user) =>
              user.name.toLowerCase().includes(search.toLowerCase()),
            )
          : response;

        return filtered.map((user) => ({
          value: user.id,
          label: user.name,
        }));
      } catch (error) {
        console.error("Failed to fetch users:", error);
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
    setLocalFilters(updated);

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
    if (localFilters.payment_gateway !== "") count++;
    if (localFilters.event_id) count++;
    if (localFilters.user_id) count++;
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
            {t("transactions.transactionFilter.filterTransaction")}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Date Range */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("billings.filter.startDate")}</Label>
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
                        <span>{t("billings.filter.pickDate")}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={localFilters.start_date}
                      onSelect={(date) => {
                        if (date) {
                          const normalized = new Date(
                            format(date, "yyyy-MM-dd"),
                          );
                          handleDateChange("start_date", normalized);
                        } else {
                          handleDateChange("start_date", undefined);
                        }
                      }}
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
               <Label>{t("billings.filter.endDate")}</Label>
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
                       <span>{t("billings.filter.pickDate")}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={localFilters.end_date}
                      onSelect={(date) => {
                        if (date) {
                          const normalized = new Date(
                            format(date, "yyyy-MM-dd"),
                          );
                          handleDateChange("end_date", normalized);
                        } else {
                          handleDateChange("end_date", undefined);
                        }
                      }}
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
          </div>

          {/* Gateway */}
          <div className="space-y-2">
            <Label>{t("transactions.paymentGateway")}</Label>
            <Select
              value={localFilters.payment_gateway}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({ ...prev, payment_gateway: value }))
              }
            >
              <SelectTrigger className="w-full text-sm h-9 justify-between px-3! bg-white">
                <SelectValue
                  placeholder={t("transactions.selectPaymentGateway")}
                  className="text-black data-[placeholder]:text-black"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">{t("billings.method.cash")}</SelectItem>
                <SelectItem value="stripe">{t("billings.method.stripe")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Event ID */}
          <div className="space-y-2">
            <Label>{t("navigation.events")}</Label>
            <AsyncCombobox
              queryKey={["filter", "events"]}
              value={localFilters.event_id ?? ""}
              onValueChange={(val) =>
                setLocalFilters((prev) => ({ ...prev, event_id: val }))
              }
              fetchOptions={fetchEvents}
              placeholder={t("billings.addBillModal.selectEvent")}
              searchPlaceholder={t("billings.addBillModal.searchEvent")}
              emptyText={t("common.noResults")}
              className="w-full text-sm h-9 justify-between px-3!"
              debounceMs={300}
            />
          </div>

          {/* User */}
          <div className="space-y-2">
            <Label>{t("users.userRoles.user")}</Label>
            <AsyncCombobox
              queryKey={["filter", "users"]}
              value={localFilters.user_id ?? ""}
              onValueChange={(val) =>
                setLocalFilters((prev) => ({ ...prev, user_id: val }))
              }
              fetchOptions={fetchUser}
              placeholder={t("users.selectUser")}
              searchPlaceholder={t("users.searchUser")}
              emptyText={t("users.noUsersFound")}
              className="w-full text-sm h-9 justify-between px-3!"
              debounceMs={300}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>{t("organizer.status")}</Label>
            <Select
              value={localFilters.status}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="w-full text-sm h-9 justify-between px-3! bg-white">
                <SelectValue
                  placeholder={t("billings.filter.selectStatus")}
                  className="text-black data-[placeholder]:text-black"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">{t("status.pending")}</SelectItem>
                <SelectItem value="paid">{t("dashboard.dataDisplay.paid")}</SelectItem>
                <SelectItem value="completed">{t("status.completed")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="flex-row gap-2">
          <Button variant="outline" onClick={handleClear} className="flex-1">
            <X className="mr-2 h-4 w-4" />
            {t("common.clear")}
          </Button>
          <Button
            onClick={handleApply}
            disabled={!!dateError}
            className="flex-1 w-full sm:w-auto gap-2 bg-primary hover:bg-primary/80 text-primary-foreground shadow-sm transition-all ease-out duration-300 active:scale-95"
          >
            <Filter className="mr-2 h-4 w-4" />
            {t("billings.filter.applyFilters")}
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
