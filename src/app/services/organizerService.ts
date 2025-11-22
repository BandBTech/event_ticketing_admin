import { API_ENDPOINTS } from "@/app/config/api";
import { apiClient } from "@/app/lib/apiClient";

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

export const getOrganizers = async (): Promise<APIResponse> => {
  return apiClient(API_ENDPOINTS.GET_ORGANIZERS, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiOWM3ZWViZDAtMjE5MS00YTIwLTkyYzYtMTU4OWM5ODJiMjEyIiwiZW1haWwiOiJhZG1pbkB0aW1yb3RpY2tldC5jb20iLCJyb2xlcyI6WyJhZG1pbiJdLCJpc3MiOiJ0aW1yby10aWNrZXQtc3RhZ2luZy1hcGkiLCJzdWIiOiI5YzdlZWJkMC0yMTkxLTRhMjAtOTJjNi0xNTg5Yzk4MmIyMTIiLCJhdWQiOlsidGltcm8tdGlja2V0LXN0YWdpbmctY2xpZW50cyJdLCJleHAiOjE3NjM5MzA3NDAsIm5iZiI6MTc2Mzg0NDM0MCwiaWF0IjoxNzYzODQ0MzQwLCJqdGkiOiI0OTMyNTU2ZS05YWI3LTRkMzItYmQ1Ny1hN2RjMGZkY2M3ODAifQ.i9hCa8fn5pXk_YvQaVqoOu7ouJfOcttFMvZ8Cuh2Fzk`,
    },
  });
};
