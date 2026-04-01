import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "next/navigation";

export interface PayoutTab {
  value: string;
  label: string;
  link: string;
}

interface PayoutFilterTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function PayoutFilterTabs({
  activeTab,
  onTabChange,
}: PayoutFilterTabsProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const tabs: PayoutTab[] = [
    { value: "transactions", label: t("", "Transactions"), link: "/transactions" },
    { value: "refunds", label: t("", "Refunds"), link: "/refunds" },
    { value: "payouts", label: t("", "Payouts"), link: "/payouts" },
    { value: "audit-logs", label: t("", "Audit Logs"), link: "/auditlogs" },
    { value: "checkout-sessions", label: t("", "Checkout Sessions"), link: "/checkoutsessions" },
  ];

  return (
    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Button
          key={tab.value}
          size="sm"
          variant={activeTab === tab.value ? "default" : "outline"}
          onClick={() => {
            onTabChange(tab.value);
            router.push(tab.link);
          }}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
