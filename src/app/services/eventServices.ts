import { API_ENDPOINTS } from "@/app/config/api";
import { apiClient } from "@/app/lib/apiClient";

const access_token =
  typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

interface APIResponse {
  success: boolean;
  message: string;
  data: {
    limit: number;
    organizers: APIOrganizer[];
  };
}

interface APIOrganizer {
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
interface PendingOrganizersAPIResponse {
  success: boolean;
  message: string;
  data: {
    limit: number;
    organizers: PendingOrganizersAPIOrganizer[];
  };
}

interface PendingOrganizersAPIOrganizer {
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

export const getEvents = async (): Promise<APIResponse> => {
  return apiClient(API_ENDPOINTS.GET_EVENTS, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  });
};

export const getPendingEvents =
  async (): Promise<PendingOrganizersAPIResponse> => {
    return apiClient(API_ENDPOINTS.GET_PENDING_EVENTS, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  };
