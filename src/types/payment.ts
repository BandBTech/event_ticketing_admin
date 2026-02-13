export interface PaymentGatewayConfig {
  api_key: string;
  api_secret: string;
  webhook_secret: string;
  display_name: string;
  gateway_name: string;
  is_enabled: boolean;
  is_test_mode: boolean;
}

export interface PaymentGatewayListResponse {
  limit: number;
  page: number;
  total: number;
  organizers: PaymentGatewayConfig[];
}
