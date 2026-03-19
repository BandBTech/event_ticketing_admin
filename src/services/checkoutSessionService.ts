import { api } from "../lib/apiClient";
import { API_ENDPOINTS } from "@/app/config/api";
import { CheckoutSessionsResponse, CheckoutSessionsData } from "@/types/checkoutsession";

export class CheckoutSessionService {

  static async getCheckoutSessions(filters?: {
    page?: number;
    limit?: number;
    sort?: string;
    status?: string;
    search?: string;
  }): Promise<CheckoutSessionsData> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.status) params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);
      if (filters.sort) params.append("sort", filters.sort);
    }

    const query = params.toString();

    const result = await api.get<CheckoutSessionsData>(
      `${API_ENDPOINTS.GET_CHECKOUT_SESSIONS}${query ? `?${query}` : ""}`,
      {
        requiresAuth: true,
      },
    );

    return result;
  }
}
