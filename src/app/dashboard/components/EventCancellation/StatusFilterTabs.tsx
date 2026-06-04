import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";

export type CancellationStatus = "pending" | "approved" | "rejected";

export interface StatusTab {
  value: CancellationStatus;
  label: string;
}

interface StatusFilterTabsProps {
  activeStatus: CancellationStatus;
  onChange: (status: CancellationStatus) => void;
}

export function StatusFilterTabs({ activeStatus, onChange }: StatusFilterTabsProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

const tabs: StatusTab[] = [
  { value: "pending",  label: t("dashboard.status.pending", "Pending") },
  { value: "approved", label: t("dashboard.status.approved", "Approved") },
  { value: "rejected", label: t("dashboard.status.rejected", "Rejected") },
];

  return (
    <div className="px-2 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-2 pb-2">
      {tabs.map((tab) => (
        <Button
          key={tab.value}
          size="sm"
          variant={activeStatus === tab.value ? "default" : "outline"}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}