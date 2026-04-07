export interface ReportResponse {
  pagination: {
    has_next: boolean;
    has_prev: boolean;
    limit: number;
    page: number;
    total: number;
    total_pages: number;
  };
  overview: Overview;
  summary_metrics: SummaryMetrics;
  events_statistics: EventsStatistics;
  sales_by_payment_gateway: PaymentGateway[];
  daily_sales: DailySale[] | undefined;
  customer_retention: CustomerRetention;
  customer_segments: CustomerSegment[];
  revenue_breakdown: RevenueBreakdownItem[];
  currency_breakdown: CurrencyBreakdownItem[];
  commission_history: CommissionHistoryItem[];
  repeat_customers: number;
  total_customers: number;
  registered_users: number;
  guest_purchases: number;
  average_order_value: number;
  total_gross_revenue: number;
  status: string;
  event_id: string;
  event_title: string;
  banner_image: string;
  start_date: string;
  end_date: string;
  capacity: number;
  tickets_sold: number;
  sold_percentage: number;
  revenue: number;
  commission: number;
  organizer_earnings: number;
  average_ticket_price: number;
  total_transactions: number;
  top_tier: TierPerformance | null;
  tier_performance: TierPerformance[];
}

export interface Overview {
  summary_metrics: {
    total_revenue: number;
    total_commission: number;
    organizer_share: number;
    total_tickets_sold: number;
    active_events: number;
    total_events: number;
    total_transactions: number;
    completed_transactions: number;
    pending_transactions: number;
    failed_transactions: number;
    average_order_value: number;
    conversion_rate: number;
  };
  top_performing_events: null;
  recent_transactions: null;
  revenue_trend: null;
  ticket_sales_trend: null;
  events_statistics: {
    total_events: number;
    draft_events: number;
    pending_events: number;
    approved_events: number;
    rejected_events: number;
    on_sale_events: number;
    live_events: number;
    completed_events: number;
    cancelled_events: number;
  };
}

type SummaryMetrics = {
  total_revenue: number;
  total_commission: number;
  organizer_share: number;
  total_tickets_sold: number;
  active_events: number;
  total_events: number;
  total_transactions: number;
  completed_transactions: number;
  pending_transactions: number;
  failed_transactions: number;
  average_order_value: number;
  conversion_rate: number;
  total_gross_revenue: number;
  net_revenue: number;
  total_refunds: number;
  total_organizer_share: number;
  pending_payouts: number;
  completed_payouts: number;
  average_ticket_price: number;
};

type EventsStatistics = {
  total_events: number;
  draft_events: number;
  pending_events: number;
  approved_events: number;
  rejected_events: number;
  on_sale_events: number;
  live_events: number;
  completed_events: number;
  cancelled_events: number;
};

// sales type interface

export type DailySale = {
  date: string;
  revenue: number;
  tickets_sold: number;
  transactions: number;
  average_order_value: number;
};

type PaymentGateway = {
  gateway_name: string;
  total_transactions: number;
  total_revenue: number;
  percentage_of_total: number;
  status: string;
};

export type ChartTab = "revenue" | "tickets" | "aov";

// type SummaryMetrics = {
//   total_revenue: number;
//   total_commission: number;
//   organizer_share: number;
//   total_tickets_sold: number;
//   active_events: number;
//   total_events: number;
//   total_transactions: number;
//   completed_transactions: number;
//   pending_transactions: number;
//   failed_transactions: number;
//   average_order_value: number;
//   conversion_rate: number;
// };

type SalesReportData = {
  summary_metrics: SummaryMetrics;
  daily_sales: DailySale[];
  sales_by_payment_gateway: PaymentGateway[];
};

// customer analytics type interface

type CustomerSegment = {
  segment_name: string;
  customer_count: number;
  total_spent: number;
  average_spent: number;
  percentage_of_total: number;
};

type CustomerRetention = {
  new_customers: number;
  returning_customers: number;
  retention_rate: number;
  churn_rate: number;
};

type CustomerAnalyticsData = {
  total_customers: number;
  registered_users: number;
  guest_purchases: number;
  repeat_customers: number;
  average_order_value: number;
  customer_segments: CustomerSegment[];
  customer_retention: CustomerRetention;
};

// Financial Type Interface
type FinancialSummaryMetrics = {
  total_gross_revenue: number;
  total_commission: number;
  total_organizer_share: number;
  total_refunds: number;
  net_revenue: number;
  pending_payouts: number;
  completed_payouts: number;
  average_ticket_price: number;
  total_transactions: number;
};

type RevenueBreakdownItem = {
  event_id: string;
  event_title: string;
  gross_revenue: number;
  commission: number;
  organizer_share: number;
  refunds: number;
  net_revenue: number;
  transaction_count: number;
};

type CommissionHistoryItem = {
  transaction_id: string;
  event_id: string;
  event_title: string;
  revenue: number;
  commission_rate: number;
  commission_amount: number;
  created_at: string;
};

type CurrencyBreakdownItem = {
  currency: string;
  gross_revenue: number;
  commission: number;
  organizer_share: number;
  transaction_count: number;
  percentage_of_total: number;
};

type RevenueReportData = {
  summary_metrics: FinancialSummaryMetrics;
  revenue_breakdown: RevenueBreakdownItem[];
  commission_history: CommissionHistoryItem[];
  payout_history: null | unknown[];
  currency_breakdown: CurrencyBreakdownItem[];
};

type TierPerformance = {
  tier_id: string;
  tier_name: string;
  ticket_price: number;
  ticket_capacity: number;
  tickets_sold: number;
  sold_percentage: number;
  revenue: number;
};

type EventPerformanceData = {
  event_id: string;
  event_title: string;
  banner_image: string;
  status: string;
  start_date: string;
  end_date: string;
  capacity: number;
  tickets_sold: number;
  sold_percentage: number;
  revenue: number;
  commission: number;
  organizer_earnings: number;
  average_ticket_price: number;
  total_transactions: number;
  top_tier: TierPerformance | null;
  tier_performance: TierPerformance[];
};

export type RevenueReportProps = {
  data: ReportResponse | undefined;
};

export type ReportPageProps = {
  data: ReportResponse | undefined;
};

export type SalesReportProps = {
  data: ReportResponse | undefined;
};

export type CustomerAnalyticsProps = {
  data: ReportResponse | undefined;
};

export type EventPerformanceProps = {
  data: ReportResponse | undefined;
  isEventIdSelected: boolean
};
