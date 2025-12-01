import { api } from './apiClient';
import { API_ENDPOINTS } from '@/app/config/api';

/**
 * Organizer Types
 */
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

interface ApproveOrganizerResponse {
  success: boolean;
  message: string;
}

export class OrganizerService {
  static async getOrganizers(): Promise<OrganizerListResponse> {
    return await api.get(API_ENDPOINTS.GET_ORGANIZERS, {
      requiresAuth: true,
    });
  }

  static async getPendingOrganizers(): Promise<OrganizerListResponse> {
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
}
