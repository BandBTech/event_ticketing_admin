import { boolean } from "zod";

export type TransactionStatus = "Completed" | "Pending" | "Failed" | "Refunded";
export type TransactionType = "Credit" | "Debit" | "Transfer" | "Withdrawal";

export interface Transaction {
  amount: number;
  commission_amount: number;
  commission_rate: number;
  created_at: string; // ISO 8601 date string
  currency: string;
  event_id: string;
  event_title: string;
  gateway_txn_id: string;
  has_payment_details: boolean;
  id: string; // UUID format
  organizer_share: number;
  payment_gateway: string;
  processed_at: string; // ISO 8601 date string
  status: string;
  ticket_count: number;
  user_id: string; // UUID format
  user_name: string;
}

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
