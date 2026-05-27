import { format, subDays } from "date-fns";
import { symbol } from "zod";

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
  event: {
    id: string;
    title: string;
    symbol: string;
  };
  organizer: {
    id: string;
    name: string;
  };
  actor: {
    id: string;
    name: string;
  };
  settlements: {
    total_amount: string;
    paid_amount: number;
    remaining_balance: number;
    gross_revenue: number;
    net_revenue: number;
    platform_commission: number;
    organizer_earnings: number;
  };
  event_title: string;
  organizer_id: string;
  organizer_name: string;
  admin_id: string;
  admin_name: string;
  total_revenue: number;
  total_commission: number;
  organizer_earnings: number;
  amount: number;
  paid_amount: number;
  remaining_amount: number;
  payment_method: string;
  payment_ref: string;
  status: string;
  bill_type: string;
  notes: string;
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
};

export type AddPaymentToBillPayload = {
  bill_id?: string;
  amount: number;
  payment_method: string;
  payment_ref: string;
  notes: string;
  payment_date?: Date | null;
  screenshot?: File;
};

export type UpdateBillPayload = {
  bill_id?: string;
  amount?: number;
  status: string;
  payment_ref: string;
  notes: string;
};

export interface BillingFilters {
  organizer_ids: string[];
  start_date: Date | undefined;
  end_date: Date | undefined;
  status: string;
  // dateRange: {
  //   from: Date | undefined;
  //   to: Date | undefined;
  // };
}

export interface PaymentHistory {
  id: number;
  event: {
    id: string;
    title: string;
    symbol: string;
  };
  amount: number;
  payment_method: string;
  method: string;
  payment_ref: string;
  payment_date: string;
  processed_by: string;
  notes: string;
  screenshot_url: string;
  created_at: string;
  paid_at: string;
}

export interface BillingHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  historyData?: PaymentHistory[];
  billId: string;
}

// export const getDefaultDateRange = () => ({
//   from: subDays(new Date(), 30),
//   to: new Date(),
// });

export const getDefaultFilters = (): BillingFilters => ({
  organizer_ids: [],
  start_date: undefined,
  end_date: undefined,
  status: "",
  // dateRange: getDefaultDateRange(),
});
