import { api } from "../lib/apiClient";
import { API_ENDPOINTS } from "@/app/config/api";
import { RefundResponse } from "@/types/refunds";
import { ReportResponse, Overview } from "@/types/reports"

export class ReportService {
static async getReport(filters?: {
  type?: string;
  event_id?: string;
}): Promise<ReportResponse> {
  const params = new URLSearchParams();

  if (filters?.type) {
    params.append("type", filters.type);

    // ✅ Only include event_id for event-performance
    if (filters.type === "event-performance" && filters.event_id) {
      params.append("event_id", filters.event_id);
    }
  }

  const query = params.toString();

  const result = await api.get<ReportResponse>(
    `${API_ENDPOINTS.GET_REPORT}${query ? `?${query}` : ""}`,
    {
      requiresAuth: true,
    }
  );

  return result;
}
}
