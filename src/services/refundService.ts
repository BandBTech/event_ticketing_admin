import { api } from "../lib/apiClient";
import { API_ENDPOINTS } from "@/app/config/api";
import { RefundResponse, RefundData, RefundStatusChange } from "@/types/refunds";

export class RefundService {
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

  static async getRefunds(filters?: {
    page?: number;
    limit?: number;
    sort?: string;
    filter?: string;
    status?: string;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
  }): Promise<RefundResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.filter) params.append("filter", filters.filter);
      if (filters.status) params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);
      if (filters.sort_by) params.append("sort_by", filters.sort_by);
      if (filters.sort_order) params.append("sort_order", filters.sort_order);
    }

    const query = params.toString();

    const result = await api.get<RefundResponse>(
      `${API_ENDPOINTS.GET_ALL_REFUNDS}${query ? `?${query}` : ""}`,
      {
        requiresAuth: true,
      },
    );

    return result;
  }

  static async getRefundbyId(refundId: string | undefined): Promise<RefundData> {
    const params = new URLSearchParams();
    const query = params.toString();

    const result = await api.get<RefundData>(
      `${API_ENDPOINTS.GET_ALL_REFUNDS}/${refundId}`,
      {
        requiresAuth: true,
      },
    );

    return result;
  }

    /**
     * Get event status change history
     */
    static async getRefundHistory(
      eventId: string,
    ): Promise<RefundStatusChange[]> {
      return await api.get<RefundStatusChange[]>(
        `/admin/payments/refunds/${eventId}/status-history`,
        { requiresAuth: true },
      );
    }

  static async rejectRefund(payload: {
    refundId: string;
    additionalProp1: string;
  }): Promise<RefundResponse> {
    return await api.post<RefundResponse>(
      API_ENDPOINTS.REJECT_REFUND(payload.refundId),
      {
        additionalProp1: payload.additionalProp1,
      },
      {
        requiresAuth: true,
      },
    );
  }

  static async approveRefund(payload: {
    refundId: string;
  }): Promise<RefundResponse> {
    return await api.post<RefundResponse>(
      API_ENDPOINTS.APPROVE_REFUND(payload.refundId),
      {},
      {
        requiresAuth: true,
      },
    );
  }

  static async retryRefund(payload: {
    refundId: string;
  }): Promise<RefundResponse> {
    return await api.post<RefundResponse>(
      API_ENDPOINTS.RETRY_REFUND(payload.refundId),
      {},
      {
        requiresAuth: true,
      },
    );
  }
}
