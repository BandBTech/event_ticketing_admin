export interface PaymentBillResponse {
  success: boolean;
  message: string;
  data: PaymentBillData;
  timestamp: string;
  request_id: string;
}

export interface PaymentBillData {
  bills: Bill[];
  pagination: Pagination;
}

export interface Bill {
  id: string;
  bill_number: string;
  event_id: string;
  event_title: string;
  organizer_id: string;
  organizer_name: string;
  admin_id: string;
  admin_name: string;
  total_revenue: number;
  total_commission: number;
  organizer_earnings: number;
  billed_amount: number;
  paid_amount: number;
  remaining_amount: number;
  payment_method: string;
  payment_ref: string;
  status: string;
  bill_type: string;
  priority: string;
  due_date: string;
  notes: string;
  payment_screenshot_url: string;
  bill_date: string;
  paid_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  has_next: boolean;
  has_prev: boolean;
  limit: number;
  page: number;
  total: number;
  total_pages: number;
}

export type CreateBillPayload = {
  event_id: string;
  organizer_id: string;
  payment_method: string;
  screenshot?: File;
}
