import { api } from "../lib/apiClient";
import { API_ENDPOINTS } from "@/app/config/api";
import { Transaction, TransactionListResponse } from "@/types/transaction";
import { AuditLogsListResponse } from "@/types/auditlogs";

export class AuditlogService {
  /**
   * Create new transaction from admin
   */
  // static async createAuditlog(data: Transaction): Promise<void> {
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

  static async getAuditlogs(filters?: {
    page?: number;
    limit?: number;
    sort?: string;
    filter?: string;
    search?: string;
    event_id?: string;
    user_id?: string;
    start_date?: Date | undefined;
    end_date?: Date | undefined;
  }): Promise<AuditLogsListResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.filter) params.append("filter", filters.filter);
      if (filters.search) params.append("search", filters.search);
      if (filters.event_id)
        params.append("event_id", filters.event_id.toString());
      if (filters.user_id) params.append("user_id", filters.user_id.toString());
      if (filters.start_date)
        params.append(
          "start_date",
          filters.start_date.toISOString().split("T")[0],
        );
      if (filters.end_date)
        params.append("end_date", filters.end_date.toISOString().split("T")[0]);
      if (filters.sort) params.append("sort", filters.sort);
    }

    const query = params.toString();

    const result = await api.get<AuditLogsListResponse>(
      `${API_ENDPOINTS.GET_ALL_AUDITLOGS}${query ? `?${query}` : ""}`,
      {
        requiresAuth: true,
      },
    );

    return result;
  }
}
