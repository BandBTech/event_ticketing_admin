export interface PayoutRequestsResponse {
  pagination: Pagination;
  requests: PayoutRequest[];
}

export interface Pagination {
  has_next: boolean;
  has_prev: boolean;
  limit: number;
  page: number;
  total: number;
  total_pages: number;
}

export interface PayoutRequest {
  id: string;
  request_number: string;
  organizer_id: string;
  event_id: string;
  bill_id: string;
  organizer: {
    id: string;
    name: string;
    email: string;
  };
  event: EventInfo;
  amount: number;
  status: "pending" | "approved" | "rejected" | string;
  request_type: "event_payout" | string;
  created_at: string;
  updated_at: string;
}

export interface EventInfo {
  id: string;
  title: string;
  banner_image: string;
  symbol: string;
  status: "live" | "completed" | "cancelled" | string;
}
