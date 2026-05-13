import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export interface PayoutTab {
  value: string;
  label: string;
  link: string;
}

export function TransactionScreenTabs() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const normalizedPathname = pathname.replace(/\/$/, "");

  const tabs: PayoutTab[] = [
    {
      value: "transactions",
      label: t("pages.transactions", "Transactions"),
      link: "/transactions",
    },
    {
      value: "refunds",
      label: t("pages.refunds", "Refunds"),
      link: "/refunds",
    },
    {
      value: "payouts",
      label: t("pages.payouts", "Payouts"),
      link: "/payouts",
    },
    {
      value: "audit-logs",
      label: t("pages.auditlogs", "Audit Logs"),
      link: "/auditlogs",
    },
    // {
    //   value: "checkout-sessions",
    //   label: t("pages.checkoutsessions", "Checkout Sessions"),
    //   link: "/checkoutsessions",
    // },
  ];

  return (
    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Button
          key={tab.value}
          size="sm"
          variant={normalizedPathname === tab.link ? "default" : "outline"}
          onClick={() => {
            router.push(tab.link);
          }}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
