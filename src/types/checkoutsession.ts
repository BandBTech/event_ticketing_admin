export interface CheckoutSessionsResponse {
  success: boolean;
  message: string;
  data: {
    pagination: Pagination;
    sessions: CheckoutSession[];
  };
  timestamp: string;
  request_id: string;
}

export interface CheckoutSessionsData {
    pagination: Pagination;
    sessions: CheckoutSession[];
}

export interface Pagination {
  has_next: boolean;
  has_prev: boolean;
  limit: number;
  page: number;
  total: number;
  total_pages: number;
}

export interface CheckoutSession {
  id: string;
  ticket_id: string;
  user_id: string;
  checkout_token: string;
  payment_gateway: string; // "stripe" (can expand later)
  amount: number;
  currency: string;
  status: CheckoutStatus;
  gateway_data: GatewayData;
  stripe_session_id: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export type CheckoutStatus =
  | "pending"
  | "completed"
  | "failed"
  | "expired"; // future-safe

export interface GatewayData {
  cancel_url: string;
  payment_intent_id: string;
  session_id: string;
  success_url: string;
  ticket_ids?: string[]; // optional (only present in some)
  url: string;
}