import { api } from './apiClient';
import { API_ENDPOINTS } from '@/app/config/api';

export interface AllOrganizers {
  id: string;
  business_name: string;
  logo: string;
}

/**
 * Organizer Types
 */
export interface Organizer {
  id: string;
  email: string;
  phone: string;
  country_code: string;
  is_email_verified: boolean;
  organizer_status: string;
  account_status: string;
  roles: {
    id: string;
    name: string;
    description: string;
  }[];
  created_at: string;
  updated_at: string;
  name: string;
  logo: string;
  description: string;
  is_onboarding_complete: boolean;
}

export interface OrganizerListResponse {
  limit: number;
  page: number;
  total: number;
  organizers: Organizer[];
}

interface ApproveOrganizerResponse {
  success: boolean;
  message: string;
}

export class OrganizerService {

  /**
   * Create new organizer from admin
   */
  static async createOrganizer(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    country_code?: string;
  }): Promise<void> {
    await api.post<void>(
      API_ENDPOINTS.CREATE_ORGANIZERS,
      {
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        country_code: data.country_code,
      },
      {
        requiresAuth: true,
      }
    );
  }


  static async getOrganizers(filters: { all_approved: true } & {
    page?: number;
    limit?: number;
    sort?: string;
    search?: string;
    status?: string;
    account_status?: string;
  }): Promise<AllOrganizers[]>;
  static async getOrganizers(filters?: {
    page?: number;
    limit?: number;
    sort?: string;
    search?: string;
    status?: string;
    account_status?: string;
    all_approved?: false | undefined;
  }): Promise<OrganizerListResponse>;
  static async getOrganizers(filters?: {
    page?: number;
    limit?: number;
    sort?: string;
    search?: string;
    status?: string;
    account_status?: string;
    all_approved?: boolean;
  }): Promise<OrganizerListResponse | AllOrganizers[]> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.account_status) params.append('account_status', filters.account_status);
      if (filters.all_approved) params.append('all_approved', 'true');
    }

    const query = params.toString();
    const result = await api.get<OrganizerListResponse | AllOrganizers[]>(`${API_ENDPOINTS.GET_ORGANIZERS}${query ? `?${query}` : ''}`, {
      requiresAuth: true,
    });

    if (filters?.all_approved) {
      return (Array.isArray(result) ? result : (result?.organizers || [])) as AllOrganizers[];
    }

    return result;
  }

  static async getPendingOrganizers(): Promise<OrganizerListResponse> {
    return await api.get<OrganizerListResponse>(API_ENDPOINTS.GET_PENDING_ORGANIZERS, {
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
   */
  static async getOrganizerById(id: string): Promise<Organizer> {
    // Fetch with a high limit to increase chance of finding the organizer
    // Ideally the API should support GET /admin/organizers/{id}
    // const response = await this.getOrganizers({ limit: 100 });
    const response = await api.get<Organizer>(`${API_ENDPOINTS.GET_SINGLE_ORGANIZER(id)}`, {
      requiresAuth: true,
    });
    return response;
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
  /**
   * Update organizer status (Activate/Deactivate)
   */
  static async updateOrganizerStatus(
    id: string,
    status: 'active' | 'inactive',
    admin_remark: string
  ): Promise<void> {
    await api.put<void>(
      API_ENDPOINTS.UPDATE_ORGANIZER_ACCOUNT_STATUS(id),
      { status, admin_remark },
      {
        requiresAuth: true,
      }
    );
  }
}
