import { api } from "../lib/apiClient";
import { API_ENDPOINTS } from "@/app/config/api";
import { Transaction, TransactionListResponse } from "@/types/transaction";
import { format } from "date-fns";
import {
  ApiResponse as PaymentDetailApiResponse,
  TransactionPaymentData,
} from "@/types/paymenttransactiondetail";

export class TransactionService {
  /**
   * Create new transaction from admin
   */
  // static async createTransaction(data: Transaction): Promise<void> {
  //   await api.post<void>(
  //     API_ENDPOINTS.CREATE_TRANSACTION,
  //     {
  //       amount: data.amount,
  //       commission_amount: data.commission_amount,
  //       commission_rate: data.commission_rate,
  //     },
  //     {
  //       requiresAuth: true,
  //     },
  //   );
  // }

  static async getTransactions(filters?: {
    page?: number;
    limit?: number;
    sort?: string;
    filter?: string;
    search?: string;
    status?: string;
    event_id?: string;
    user_id?: string;
    guest_user_id?: string;
    start_date?: Date | undefined;
    end_date?: Date | undefined;
    payment_gateway?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
  }): Promise<TransactionListResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.filter) params.append("filter", filters.filter);
      if (filters.search) params.append("search", filters.search);
      if (filters.status) params.append("status", filters.status);
      if (filters.payment_gateway) params.append("payment_gateway", filters.payment_gateway);
      if (filters.event_id)
        params.append("event_id", filters.event_id.toString());
      if (filters.user_id)
        params.append("user_id", filters.user_id.toString());
      if (filters.guest_user_id)
        params.append("guest_user_id", filters.guest_user_id.toString());
      if (filters.start_date)
        params.append(
          "start_date",
          format(filters.start_date, "yyyy-MM-dd"),
        );
      if (filters.end_date)
        params.append("end_date", format(filters.end_date, "yyyy-MM-dd"));
      if (filters.sort_by) params.append("sort_by", filters.sort_by);
      if (filters.sort_order) params.append("sort_order", filters.sort_order);
    }

    const query = params.toString();

    const result = await api.get<TransactionListResponse>(
      `${API_ENDPOINTS.GET_TRANSACTIONS}${query ? `?${query}` : ""}`,
      {
        requiresAuth: true,
      },
    );

    return result;
  }

  static async getTransactionById(id: string): Promise<Transaction> {
    const response = await api.get<Transaction>(
      API_ENDPOINTS.GET_TRANSACTION_BY_ID(id),
      {
        requiresAuth: true,
      },
    );
    return response;
  }

  static async getTransactionPaymentDetailById(
    id: string,
  ): Promise<TransactionPaymentData> {
    const response = await api.get<TransactionPaymentData>(
      API_ENDPOINTS.GET_TRANSACTION_PAYMENT_DETAIL_BY_ID(id),
      {
        requiresAuth: true,
      },
    );
    return response;
  }
}
