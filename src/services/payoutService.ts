import { api } from "../lib/apiClient";
import { API_ENDPOINTS } from "@/app/config/api";
import {PayoutRequestsResponse} from "@/types/payout"

interface ApprovePayoutResponse {
  success: boolean;
  message: string;
}

interface RejectPayoutResponse {
  success: boolean;
  message: string;
}

export class PayoutService {
  /**
   * Create new transaction from admin
   */
  // static async createPayout(data: Transaction): Promise<void> {
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

  static async getPayouts(filters?: {
    page?: number;
    limit?: number;
    sort?: string;
    status?: string;
    search?: string;
  }): Promise<PayoutRequestsResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.status) params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);
      if (filters.sort) params.append("sort", filters.sort);
    }

    const query = params.toString();

    const result = await api.get<PayoutRequestsResponse>(
      `${API_ENDPOINTS.GET_ALL_PAYOUTS}${query ? `?${query}` : ""}`,
      {
        requiresAuth: true,
      },
    );

    return result;
  }
  

    static async approvePayout(payload: {
      payoutId: string;
      admin_notes: string;
      status: string;
    }): Promise<ApprovePayoutResponse> {
      return await api.put<ApprovePayoutResponse>(
        API_ENDPOINTS.APPROVE_PAYOUTS(payload.payoutId),
        {
          admin_notes: payload.admin_notes,
          status: payload.status,
        },
        {
          requiresAuth: true,
        }
      );
    }

      static async rejectPayout(payload: {
        payoutId: string;
        admin_remark: string;
        status: string;
      }): Promise<RejectPayoutResponse> {
        return await api.put<RejectPayoutResponse>(
          API_ENDPOINTS.REJECT_PAYOUTS(payload.payoutId),
          {
            admin_remark: payload.admin_remark,
            status: payload.status,
          },
          {
            requiresAuth: true,
          }
        );
      }
}
