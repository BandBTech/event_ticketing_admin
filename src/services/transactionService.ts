import { api } from "../lib/apiClient";
import { API_ENDPOINTS } from "@/app/config/api";
import { Transaction, TransactionListResponse } from "@/types/transaction";

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
  }): Promise<TransactionListResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.filter) params.append("filter", filters.filter);
      if (filters.sort) params.append("sort", filters.sort);
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
}
