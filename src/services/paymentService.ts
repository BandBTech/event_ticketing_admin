import { api } from "../lib/apiClient";
import { API_ENDPOINTS } from "@/app/config/api";
import {
  PaymentGatewayConfig,
  PaymentGatewayListResponse,
} from "@/types/payment";

export class PaymentGatewayService {
  /**
   * Create new payment gateway from admin
   */
  static async createPaymentGateway(data: {
    api_key?: string | undefined;
    api_secret?: string | undefined;
    display_name: string;
    gateway_name: string;
    webhook_secret?: string | undefined;
    is_enabled?: boolean;
    is_test_mode?: boolean;
    password: string;
  }): Promise<void> {
    try {
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
          password: data.password,
        },
        { requiresAuth: true },
      );
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      throw new Error(
        error?.response?.data?.message ??
          error?.message ??
          "Something went wrong",
      );
    }
  }

  static async getPaymentGateways(): Promise<PaymentGatewayListResponse> {
    return await api.get<PaymentGatewayListResponse>(
      API_ENDPOINTS.GET_PAYMENT_GATEWAYS,
      {
        requiresAuth: true,
      },
    );
  }

  static async getPaymentById(id: string): Promise<PaymentGatewayListResponse> {
    const response = await api.get<PaymentGatewayListResponse>(
      API_ENDPOINTS.GET_BILL_BY_ID(id),
      {
        requiresAuth: true,
      },
    );
    return response;
  }

  /**
   * Create new payment gateway from admin
   */
  static async updatePaymentGateway(
    id: string,
    data: {
      api_key?: string;
      api_secret?: string;
      display_name: string;
      gateway_name: string;
      webhook_secret?: string;
      is_enabled?: boolean;
      is_test_mode?: boolean;
      password: string;
    },
  ): Promise<void> {
    try {
      await api.put<void>(
        API_ENDPOINTS.UPDATE_PAYMENT_BY_ID(id),
        {
          api_key: data.api_key,
          api_secret: data.api_secret,
          webhook_secret: data.webhook_secret,
          display_name: data.display_name,
          gateway_name: data.gateway_name,
          is_enabled: data.is_enabled,
          is_test_mode: data.is_test_mode,
          password: data.password,
        },
        { requiresAuth: true },
      );
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      throw new Error(
        error?.response?.data?.message ??
          error?.message ??
          "Something went wrong",
      );
    }
  }

  /**
   * Delete payment gateway
   */
  static async deletePaymentGateway(id: string): Promise<void> {
    await api.delete<string>(API_ENDPOINTS.DELETE_PAYMENT_BY_ID(id), {
      requiresAuth: true,
    });
  }
}
