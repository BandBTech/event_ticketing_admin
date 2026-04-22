"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { X, CaretDown } from "@phosphor-icons/react";

export interface EventStatusSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const EVENT_STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "approved", label: "Approved" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
  // { value: "draft", label: "Draft" },
  { value: "live", label: "Live" },
  { value: "hold", label: "On Hold" },
  { value: "on_sale", label: "On Sale" },
  { value: "rejected", label: "Rejected" },
  { value: "sales_end", label: "Sales Ended" },
  { value: "sales_upcoming", label: "Sales Upcoming" },
  { value: "scheduled", label: "Scheduled" },
] as const;

export function EventStatusSelect({
  value,
  onChange,
  className,
}: EventStatusSelectProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className="w-[180px] bg-background justify-between group/trigger"
          hideIcon={true}
        >
          <SelectValue placeholder={t("events.allStatus")} />
          <div className="flex items-center gap-1 ml-2 -mr-1 shrink-0">
            {value && value !== "all" ? (
              <div
                role="button"
                className="p-1 hover:bg-muted rounded-full transition-colors opacity-60 hover:opacity-100"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onChange("all");
                }}
              >
                <X className="h-3 w-3" weight="bold" />
              </div>
            ) : (
              <CaretDown className="h-4 w-4 opacity-50" />
            )}
          </div>
        </SelectTrigger>
        <SelectContent>
          {EVENT_STATUS_OPTIONS.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.value === "all"
                ? t("events.allStatus")
                : t(`status.${status.value}`, status.label)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
