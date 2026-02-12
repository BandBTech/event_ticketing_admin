import { api } from "../lib/apiClient";
import { API_ENDPOINTS } from "@/app/config/api";
import { ApiResponse as UserApiResponse, UserData, User } from "@/types/user";

export class UserService {
  static async getUsers(filters?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
    account_status?: string;
    sort?: string;
  }): Promise<UserApiResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.status) params.append("status", filters.status);
      if (filters.role) params.append("role", filters.role);
      if (filters.account_status)
        params.append("account_status", filters.account_status);
      if (filters.sort) params.append("sort", filters.sort);
    }

    const query = params.toString();
    return await api.get(
      `${API_ENDPOINTS.GET_USERS}${query ? `?${query}` : ""}`,
      {
        requiresAuth: true,
      },
    );
  }

  static async getUsersById({ id }: { id: string }): Promise<UserData> {
    return await api.get(`${API_ENDPOINTS.GET_USERS}/${id}`, {
      requiresAuth: true,
    });
  }

  /**
   * Toggle user status (active/inactive)
   * PUT /api/v1/admin/users/:id/status
   */
  static async toggleStatus(
    id: string,
    data: { status: string; admin_remark: string },
  ): Promise<User> {
    const response = await api.put<User>(
      `${API_ENDPOINTS.GET_USERS}/${id}/status`,
      data,
      { requiresAuth: true },
    );
    return response;
  }
}
