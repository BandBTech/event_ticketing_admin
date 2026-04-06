export interface RefundResponse {
  pagination: {
    has_next: boolean;
    has_prev: boolean;
    limit: number;
    page: number;
    total: number;
    total_pages: number;
  };
  refunds: Refund[];
}

export interface Refund {
  id: string;
  refund_number: string;
  transaction_id: string;
  initiated_by: {
    id: string;
    name: string;
    email: string;
  };
  amount: number;
  currency: string;
  reason: string;
  refund_type: string;
  status: string;
  ticket_count: number;
  requested_at: string;
  created_at: string;
  updated_at: string;
}

export interface RefundData {
  id: string;
  refund_number: string;
  transaction: {
    id: string;
    amount: number;
    gateway: "stripe" | string;
    status: "completed" | "pending" | "failed" | string;
    created_at: string;
  };
  initiated_by: {
    id: string;
    name: string;
    email: string;
  };
  amount: number;
  currency: string;
  reason: string;
  refund_type: "customer_request" | string;
  status: "pending" | "completed" | "failed" | string;
  affected_ticket_ids: string[];
  ticket_count: number;
  requested_at: string;
  created_at: string;
  updated_at: string;
}
