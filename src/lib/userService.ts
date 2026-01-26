import { api } from "./apiClient";
import { API_ENDPOINTS } from "@/app/config/api";
import { ApiResponse as UserApiResponse, UserData } from "@/types/user";

export class UserService {
  /**
   * Create new organizer from admin
   */
  static async createOrganizer({
    email,
    password,
    first_name,
    last_name,
    phone,
    country_code,
  }: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone: string;
    country_code?: string;
  }): Promise<void> {
    await api.post<void>(
      API_ENDPOINTS.CREATE_ORGANIZERS,
      {
        email,
        password,
        first_name,
        last_name,
        phone,
        country_code,
      },
      {
        requiresAuth: true,
      },
    );
  }

  static async getUsers(filters?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    account_status?: string;
    sort?: string;
  }): Promise<UserApiResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.status) params.append("status", filters.status);
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
}
