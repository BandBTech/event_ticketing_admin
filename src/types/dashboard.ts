export interface AdminDashboardResponse {
  success: boolean;
  message: string;
  data: AdminDashboardData;
  timestamp: string;
  request_id: string;
}

export interface AdminDashboardData {
  events: EventsStats;
  organizers: OrganizersStats;
  payment_bills: PaymentBillsStats;
  revenue: RevenueStats;
  tickets: TicketsStats;
  transactions: TransactionsStats;
  upcoming_events_list: UpcomingEvent[];
  users: UsersStats;
}

export interface EventsStats {
  approved: number;
  cancelled: number;
  completed: number;
  draft: number;
  live: number;
  on_sale: number;
  pending: number;
  total: number;
  upcoming: number;
}

export interface OrganizersStats {
  approved: number;
  pending: number;
  rejected: number;
  total: number;
}

export interface PaymentBillsStats {
  paid: number;
  pending: number;
  total: number;
  total_due: number;
  total_paid_out: number;
}

export interface RevenueStats {
  organizer_earnings: number;
  total_commission: number;
  total_revenue: number;
}

export interface TicketsStats {
  active: number;
  cancelled: number;
  total_sold: number;
  used: number;
}

export interface TransactionsStats {
  completed: number;
  failed: number;
  pending: number;
  total: number;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  banner_image: string;
  category: string;
  start_date: string;
  end_date: string;
  status: EventStatus;
  sales_status: SalesStatus;
  is_featured: boolean;
  venue_name: string;
  created_at: string;
  updated_at: string;
}

type EventStatus = 
  | "approved"
  | "cancelled"
  | "completed"
  | "draft"
  | "live"
  | "on_sale"
  | "pending";

type SalesStatus = "active" | "inactive" | "suspended" | "cancelled";

export interface UsersStats {
  active: number;
  inactive: number;
  suspended: number;
  total: number;
}