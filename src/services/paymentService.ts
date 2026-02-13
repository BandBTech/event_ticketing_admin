import { api } from "../lib/apiClient";
import { API_ENDPOINTS } from "@/app/config/api";
import {PaymentGatewayConfig, PaymentGatewayListResponse} from "@/types/payment";

export class PaymentGatewayService {
  /**
   * Create new payment gateway from admin
   */
  static async createPaymentGateway(data: {
    api_key: string;
    api_secret: string;
    webhook_secret: string;
    display_name: string;
    gateway_name: string;
    is_enabled: boolean;
    is_test_mode: boolean;
  }): Promise<void> {
    await api.post<void>(
      API_ENDPOINTS.CREATE_PAYMENT_GATEWAY,
      {
        api_key: data.api_key,
        api_secret: data.api_secret,
        webhook_secret: data.webhook_secret,
        display_name: data.display_name,
        gateway_name: data.gateway_name,
        is_enabled: data.is_enabled,
        is_test_mode: data.is_test_mode,
      },
      {
        requiresAuth: true,
      },
    );
  }

  static async getPaymentGateways(filters?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<PaymentGatewayListResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.type) params.append("type", filters.type);
    }

    const query = params.toString();

    const result = await api.get<PaymentGatewayListResponse>(
      `${API_ENDPOINTS.GET_PAYMENT_GATEWAYS}${query ? `?${query}` : ""}`,
      {
        requiresAuth: true,
      },
    );

    return result;
  }
}
