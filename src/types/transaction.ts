import { boolean } from "zod";

export type TransactionStatus = "completed" | "pending" | "failed" | "refunded";
export type TransactionType = "Credit" | "Debit" | "Transfer" | "Withdrawal";

export interface Transaction {
  amount: number;
  commission_amount: number;
  commission_rate: number;
  created_at: string; // ISO 8601 date string
  currency: string;
  event_id: string;
  event_title: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  event : {
  id: string;
  title: string;
  }
  gateway_txn_id: string;
  has_payment_details: boolean;
  id: string; // UUID format
  organizer_share: number;
  payment_gateway: string;
  updated_at: string; // ISO 8601 date string
  status: string;
  ticket_count: number;
  user_id: string; // UUID format
  user_name: string;
}

export interface TransactionFilters {
  organizer_id: string;
  start_date: Date | undefined;
  end_date: Date | undefined;
  status: string;
  payment_gateway: string;
  user_id: string;
  event_id: string;
  // dateRange: {
  //   from: Date | undefined;
  //   to: Date | undefined;
  // };
}

export const getDefaultFilters = (): TransactionFilters => ({
  organizer_id: "",
  start_date: undefined,
  end_date: undefined,
  status: "",
  payment_gateway: "",
  user_id: "",
  event_id: "",
  // dateRange: getDefaultDateRange(),
});

export interface TransactionListResponse {
  pagination: {
    has_next: boolean;
    has_prev: boolean;
    limit: number;
    page: number;
    total: number;
    total_pages: number;
  };
  transactions: Transaction[];
}
