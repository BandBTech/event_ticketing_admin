import { api } from "../lib/apiClient";
import { API_ENDPOINTS } from "@/app/config/api";
import {AdminDashboardData, AdminDashboardResponse} from "@/types/dashboard"

export class DashboardService {

  static async getDashboard({ }): Promise<AdminDashboardData> {
    return await api.get(`${API_ENDPOINTS.GET_DASHBOARD_DATA}`, {
      requiresAuth: true,
    });
  }

}