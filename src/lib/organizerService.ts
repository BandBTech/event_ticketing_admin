import { api } from './apiClient';
import { API_ENDPOINTS } from '@/app/config/api';

const accessToken =
  typeof window !== "undefined" ? localStorage.getItem("access_token") : null;  

/**
 * Organizer Types
 */
// Each role assigned to an organizer

interface Organizer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
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
}

interface OrganizerListResponse {
  limit: number;
  page: number;
  total: number;
  organizers: Organizer[];
}


export class OrganizerService {
  /**
   * Get all organizers
   */
  static async getOrganizers(): Promise<Promise<OrganizerListResponse>> {
    return await api.get(API_ENDPOINTS.GET_ORGANIZERS, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  /**
   * Get pending organizers
   */
  static async getPendingOrganizers(): Promise<OrganizerListResponse> {
    return await api.get(API_ENDPOINTS.GET_PENDING_ORGANIZERS, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  /**
   * Approve a pending organizer
   */
static async approveOrganizer(payload: {
  organizerId: string;
  admin_remark: string;
  status: string;
}): Promise<Response> {
  return await api.put(
    API_ENDPOINTS.APPROVE_ORGANIZERS(payload.organizerId),
    {
      admin_remark: payload.admin_remark,
      status: payload.status,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}


}
