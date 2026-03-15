export interface ApiResponse {
  success: boolean;
  message: string;
  data: TransactionPaymentData;
  timestamp: string;
  request_id: string;
}

export interface TransactionPaymentData {
  transaction: Transaction;
  tickets: Ticket[];
  refunds: Refund[];
}

export interface Transaction {
  id: string;
  event_id: string;
  event: Event;
  tier_id: string;
  user_id: string;
  user: User;
  payment_gateway: PaymentGateway;
  amount: number;
  currency: string;
  quantity: number;
  status: TransactionStatus;
  gateway_txn_id: string;
  gateway_data: null | GatewayData;
  commission_rate: number;
  commission_amount: number;
  organizer_share: number;
  processed_at: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  banner_image: string;
  category: string;
  venue_name: string;
  address: string;
  location: string;
  start_date: string;
  end_date: string;
  timezone: string;
  capacity: number;
  available: number;
  price: number;
  commission_rate: number;
  status: EventStatus;
  sales_status: SalesStatus;
  is_featured: boolean;
  is_cancelled: boolean;
  organizer_id: string;
  admin_remark: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  country_code: string;
  is_email_verified: boolean;
  organizer_status: OrganizerStatus;
  account_status: AccountStatus;
  admin_remark: string;
  approved_at: null | string;
  rejected_at: null | string;
  organizer_id: null | string;
  created_by: null | string;
  roles: null | Role[];
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  user_id: string;
  user: User;
  event_id: string;
  event: Event;
  tier_id: string;
  tier: Tier;
  transaction_id: string;
  total_amount: number;
  payment_gateway: PaymentGateway;
  status: TicketStatus;
  is_guest_purchase: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tier {
  id: string;
  event_id: string;
  tier_template_id: string;
  tier_name: string;
  price: number;
  currency: string;
  quantity: number;
  available: number;
  sold: number;
  gst: number;
  sales_start: string;
  sales_end: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Refund {
  // Define based on actual refund structure
  id: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  created_at: string;
}

export interface GatewayData {
  // Define based on your payment gateway response structure
  payment_intent?: string;
  payment_method?: string;
  charge_id?: string;
  receipt_url?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

// Type Definitions
export type PaymentGateway =
  | "cash"
  | "stripe"
  | "paypal"
  | "bank_transfer"
  | string;
export type TransactionStatus =
  | "completed"
  | "pending"
  | "failed"
  | "refunded"
  | string;
export type EventStatus =
  | "on_sale"
  | "off_sale"
  | "sold_out"
  | "cancelled"
  | string;
export type SalesStatus = "active" | "inactive" | "ended" | string;
export type AccountStatus = "active" | "inactive" | "suspended" | string;
export type OrganizerStatus = "active" | "inactive" | "pending" | string;
export type TicketStatus =
  | "active"
  | "used"
  | "expired"
  | "refunded"
  | "cancelled"
  | string;
export type RefundStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed"
  | string;
