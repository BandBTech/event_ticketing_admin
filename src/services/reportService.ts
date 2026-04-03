import { api } from "../lib/apiClient";
import { API_ENDPOINTS } from "@/app/config/api";
import { RefundResponse } from "@/types/refunds";
import { ReportResponse, Overview } from "@/types/reports"

export class ReportService {
  static async getReport(filters?: {
    type?: string;
  }): Promise<ReportResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.type) params.append("type", filters.type.toString());
    }

    const query = params.toString();

    const result = await api.get<ReportResponse>(
      `${API_ENDPOINTS.GET_REPORT}${query ? `?${query}` : ""}`,
      {
        requiresAuth: true,
      },
    );

    return result;
  }
}
