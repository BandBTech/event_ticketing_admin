import { api } from "../lib/apiClient";
import { API_ENDPOINTS } from "@/app/config/api";
import {
  RefundResponse,
  RefundData,
  RefundStatusChange,
  TicketCancellationResponse,
} from "@/types/refunds";

export class RefundService {
  /**
   * Create new refund from admin
   */
static async createRefund(data: {
    reason: string;
    ticketID: string;
  }): Promise<TicketCancellationResponse> {
    return await api.post<TicketCancellationResponse>(
      API_ENDPOINTS.CREATE_REFUND,
      {
        reason: data.reason,
        ticketID: data.ticketID,
      },
      {
        requiresAuth: true,
      },
    );
  }

  static async getRefunds(filters?: {
    page?: number;
    limit?: number;
    sort?: string;
    filter?: string;
    status?: string;
    transaction_id?: string;
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
      if (filters.transaction_id) params.append("transaction_id", filters.transaction_id);
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

  static async getRefundbyId(
    refundId: string | undefined,
  ): Promise<RefundData> {
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
    reason: string;
  }): Promise<RefundResponse> {
    return await api.post<RefundResponse>(
      API_ENDPOINTS.REJECT_REFUND(payload.refundId),
      {
        reason: payload.reason,
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
