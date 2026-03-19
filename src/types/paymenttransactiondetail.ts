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
  payment_intent: PaymentIntent;
}

export interface PaymentIntent {
  id: string
  status: PaymentIntentStatus
  payment_gateway: string
  payment_method: PaymentGateway
  created_at: string
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
  id: string
  name: string
  banner: string
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
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

export interface GatewayData {
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
export type PaymentIntentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed"
  | string;
