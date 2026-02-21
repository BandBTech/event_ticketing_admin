import { api } from "../lib/apiClient";
import { API_ENDPOINTS } from "@/app/config/api";
import { Bill, PaymentBillResponse, PaymentBillData } from "@/types/billings";

export class BillingService {
  /**
   * Create new payment gateway from admin
   */
  static async createBills(data: {
    api_key: string | undefined;
    api_secret: string | undefined;
    display_name: string;
    gateway_name: string;
    webhook_secret: string | undefined;
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

  static async getAllBills(filters?: {
    page?: number;
    limit?: number;
  }): Promise<PaymentBillData> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
    }

    const query = params.toString();

    const result = await api.get<PaymentBillData>(
      `${API_ENDPOINTS.GET_ALL_BILLS}${query ? `?${query}` : ""}`,
      {
        requiresAuth: true,
      },
    );

    return result;
  }

  static async getBillsById(id: string): Promise<Bill> {
    const response = await api.get<Bill>(API_ENDPOINTS.GET_BILL_BY_ID(id), {
      requiresAuth: true,
    });
    return response;
  }
}
