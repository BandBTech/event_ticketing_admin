import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, CaretDown } from "@phosphor-icons/react";

// Filter Dropdown
export function StatusFilterSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  return (
    <div className="flex items-center gap-2">
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
          <SelectItem value="all">{t("events.allStatus")}</SelectItem>
          <SelectItem value="approved">{t("status.approved")}</SelectItem>
          <SelectItem value="cancelled">{t("status.cancelled")}</SelectItem>
          <SelectItem value="completed">{t("status.completed")}</SelectItem>
          <SelectItem value="hold">{t("status.hold", "On Hold")}</SelectItem>
          <SelectItem value="live">{t("status.live")}</SelectItem>
          <SelectItem value="on_sale">{t("status.on_sale", "On Sale")}</SelectItem>
          <SelectItem value="pending">{t("status.pending")}</SelectItem>
          <SelectItem value="rejected">{t("status.rejected")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
