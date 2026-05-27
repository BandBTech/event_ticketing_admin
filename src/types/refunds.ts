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

export interface TicketCancellationResponse {
  success: boolean;
  message: string;
  timestamp: string;
  request_id: string;
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
  symbol: string;
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
    gateway: string;
    status: string;
    created_at: string;
  };
  event: {
    id: string;
    title: string;
    banner_image: string;
    symbol: string;
  };
  organizer: {
    id: string;
    name: string;
  };
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
  affected_ticket_ids: string[];
  ticket_count: number;
  requested_at: string;
  created_at: string;
  updated_at: string;
  status_history?: StatusHistoryItem[];
}

export interface StatusHistoryItem {
  id: string;
  refund_id: string;
  old_status: string;
  new_status: string;
  changed_by_type: "system" | "admin" | "user";
  changed_by_id?: string;
  changed_by?: {
    id: string;
    name: string;
    email: string;
  };
  remarks: string;
  metadata?: Record<string, unknown>;
  changed_at: string;
}

export interface RefundStatusChange {
  id: string;
  refund_id: string;
  old_status: string;
  new_status: string;
  changed_by_type: "system" | "admin" | "user";
  changed_by_id?: string;
  changed_by?: {
    id: string;
    name: string;
    email: string;
  };
  remarks: string;
  metadata?: Record<string, unknown>; // optional
  changed_at?: string;                // optional
  created_at?: string;                // add this
}