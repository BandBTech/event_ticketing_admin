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
  sales_by_payment_gateway: PaymentGateway[]
  daily_sales: DailySale[] | undefined;
  customer_retention: CustomerRetention;
  customer_segments: CustomerSegment[];
  repeat_customers: number;
  total_customers: number;
  registered_users: number;
  guest_purchases: number;
  average_order_value: number;
  
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

export type ReportPageProps = {
  data: ReportResponse | undefined;
};

export type SalesReportProps = {
  data: ReportResponse | undefined;
};

export type CustomerAnalyticsProps = {
  data: ReportResponse | undefined;
};