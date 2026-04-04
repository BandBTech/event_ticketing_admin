import { formatCurrency } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";
import {
  ReportResponse,
  DailySale,
  SalesReportProps,
  ChartTab,
} from "@/types/reports";

const TAB_CONFIG: Record<
  ChartTab,
  { label: string; key: keyof DailySale; color: string }
> = {
  revenue: { label: "Revenue", key: "revenue", color: "#3b82f6" },
  tickets: { label: "Tickets sold", key: "tickets_sold", color: "#10b981" },
  aov: {
    label: "Avg. order value",
    key: "average_order_value",
    color: "#f59e0b",
  },
};

export function MetricCard({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string;
  value: string | number;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4">
      <div className="text-xs text-gray-700 mb-1.5">{label}</div>
      <div
        className={`text-2xl font-semibold ${valueColor ?? "text-gray-800"}`}
      >
        {value}
      </div>
      {sub && <div className="text-[11px] text-gray-700 mt-1">{sub}</div>}
    </div>
  );
}

export function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-50">
        <h2 className="text-sm font-semibold text-gray-500 tracking-wide uppercase">
          {title}
        </h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function RevenueBar({
  label,
  pct,
  color,
}: {
  label: string;
  pct: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-sm text-gray-500 w-24 text-right flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-sm font-medium text-gray-700 w-8 flex-shrink-0">
        {pct}%
      </span>
    </div>
  );
}

export function StatRow({
  label,
  value,
  badge,
}: {
  label: string;
  value: string | number;
  badge?: { bg: string; text: string };
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      {badge ? (
        <span
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg ${badge.bg} ${badge.text}`}
        >
          {value}
        </span>
      ) : (
        <span className="text-sm font-semibold text-gray-700">{value}</span>
      )}
    </div>
  );
}

export function DailyBarChart({
  data,
  tab,
}: {
  data: DailySale[] | undefined;
  tab: ChartTab;
}) {
  const { locale } = useLanguageStore();
  const cfg = TAB_CONFIG[tab];
  const values = (data ?? []).map((d) => Number(d[cfg.key]));
  const max = Math.max(...values);

  const fmt = (v: number) =>
    tab === "tickets"
      ? String(Math.round(v))
      : formatCurrency(Math.round(v), undefined, locale);

  return (
    <div className="flex items-end gap-1 h-44 w-full overflow-x-auto pb-1">
      {(data ?? []).map((d, i) => {
        const val = Number(d[cfg.key]);
        const pct = max > 0 ? (val / max) * 100 : 0;
        const dateLabel = new Date(d.date).toLocaleDateString(locale, {
          month: "short",
          day: "numeric",
        });
        return (
          <div
            key={d.date}
            className="flex flex-col items-center gap-1 flex-1 min-w-[28px] group relative"
            title={`${dateLabel}: ${fmt(val)}`}
          >
            <div
              className="w-full rounded-t-sm transition-all duration-500"
              style={{
                height: `${Math.max(pct, 2)}%`,
                background: cfg.color,
                opacity: 0.85,
              }}
            />
            <span className="text-[9px] text-gray-700 leading-none rotate-45 origin-left mt-0.5 hidden group-hover:block absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
              {dateLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function StatRowCAS({
  label,
  value,
  badge,
}: {
  label: string;
  value: string | number;
  badge: { bg: string; text: string };
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span
        className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg ${badge.bg} ${badge.text}`}
      >
        {value}
      </span>
    </div>
  );
}

export function RetentionDonut({
  retention,
  churn,
}: {
  retention: number;
  churn: number;
}) {
  const r = 44;
  const cx = 56;
  const cy = 56;
  const circ = 2 * Math.PI * r;
  const retDash = (retention / 100) * circ;

  return (
    <svg viewBox="0 0 112 112" className="w-32 h-32">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#f3f4f6"
        strokeWidth="10"
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#10b981"
        strokeWidth="10"
        strokeDasharray={`${retDash} ${circ - retDash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text
        x={cx}
        y={cy - 5}
        textAnchor="middle"
        fontSize="16"
        fontWeight="500"
        fill="#1f2937"
      >
        {retention}%
      </text>
      <text x={cx} y={cy + 13} textAnchor="middle" fontSize="9" fill="#9ca3af">
        retention
      </text>
    </svg>
  );
}
