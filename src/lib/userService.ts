import { api } from './apiClient';
import { API_ENDPOINTS } from '@/app/config/api';
import {
  ApiResponse as UserApiResponse,
  User,
  UserRole,
  UserPermission,
  UserData,
  UserApiError,
  UserOrganizerOnboarding,
} from "@/types/user";


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
  await api.post<void>(API_ENDPOINTS.CREATE_ORGANIZERS, {
    email,
    password,
    first_name,
    last_name,
    phone,
    country_code,
  },
  {
    requiresAuth: true,
  }

);
}


  static async getUsers(filters?: {
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<UserApiResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sort) params.append('sort', filters.sort);
    }

    const query = params.toString();
    return await api.get(`${API_ENDPOINTS.GET_USERS}${query ? `?${query}` : ''}`, {
      requiresAuth: true,
    });
  }

  static async getPendingOrganizers(): Promise<UserApiResponse> {
    return await api.get(API_ENDPOINTS.GET_PENDING_ORGANIZERS, {
      requiresAuth: true,
    });
  }

static async approveOrganizer(payload: {
  organizerId: string;
  admin_remark: string;
  status: string;
}): Promise<ApproveOrganizerResponse> {
  return await api.put<ApproveOrganizerResponse>(
    API_ENDPOINTS.APPROVE_ORGANIZERS(payload.organizerId),
    {
      admin_remark: payload.admin_remark,
      status: payload.status,
    },
    {
      requiresAuth: true,
    }
  );
}

  /**
   * Get organizer by ID
   * Since there's no dedicated GET endpoint, we fetch from the list
   */
  static async getOrganizerById(id: string): Promise<Organizer | null> {
    // Fetch with a high limit to increase chance of finding the organizer
    // Ideally the API should support GET /admin/organizers/{id}
    const response = await this.getOrganizers({ limit: 100 });
    return response.organizers.find((org) => org.id === id) || null;
  }

  /**
   * Update organizer/organization details
   */
  static async updateOrganizer(
    id: string,
    data: {
      name?: string;
      description?: string;
      phone?: string;
      email?: string;
      website?: string;
      address?: string;
    }
  ): Promise<void> {
    await api.put<void>(
      `${API_ENDPOINTS.GET_ORGANIZERS.replace('/organizers', '/organizer')}/${id}`,
      data,
      {
        requiresAuth: true,
      }
    );
  }

  /**
   * Delete organizer
   */
  static async deleteOrganizer(id: string): Promise<void> {
    await api.delete<void>(
      `${API_ENDPOINTS.GET_ORGANIZERS.replace('/organizers', '/organizer')}/${id}`,
      {
        requiresAuth: true,
      }
    );
  }
}
