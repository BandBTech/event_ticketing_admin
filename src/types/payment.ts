export interface PaymentGatewayConfig {
  api_key: string;
  api_secret: string;
  webhook_secret: string;
  display_name: string;
  gateway_name: string;
  is_enabled: boolean;
  is_test_mode: boolean;
}

export interface CreatePaymentGatewayConfig {
  api_key?: string;
  api_secret?: string;
  webhook_secret?: string;
  display_name: string;
  gateway_name: string;
  is_enabled?: boolean;
  is_test_mode?: boolean;
  password: string;
}

export interface PaymentGatewayListResponse {
  pagination: { limit: number; page: number; total: number };
  gateways: PaymentGatewayConfig[];
}
