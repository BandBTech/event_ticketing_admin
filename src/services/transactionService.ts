import { api } from "../lib/apiClient";
import { API_ENDPOINTS } from "@/app/config/api";
import {
  PaymentGatewayConfig,
  PaymentGatewayListResponse,
} from "@/types/payment";

type TransactionStatus = "Completed" | "Pending" | "Failed" | "Refunded";
type TransactionType = "Credit" | "Debit" | "Transfer" | "Withdrawal";

interface Transaction {
  id: number;
  transactionId: string;
  name: string;
  email: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  date: string;
}

export interface TransactionListResponse {
  limit: number;
  page: number;
  total: number;
  transactions: Transaction[];
  pagination: { total: number; limit: number; page: number; has_more: boolean };
}

export class TransactionService {
  /**
   * Create new transaction from admin
   */
  static async createTransaction(data: Transaction): Promise<void> {
    await api.post<void>(
      API_ENDPOINTS.CREATE_TRANSACTION,
      {
        id: data.id,
        transactionId: data.transactionId,
        name: data.name,
        email: data.email,
        amount: data.amount,
        type: data.type,
        status: data.status,
        date: data.date,
      },
      {
        requiresAuth: true,
      },
    );
  }

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
