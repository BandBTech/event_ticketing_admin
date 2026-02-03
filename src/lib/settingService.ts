import { api } from "./apiClient";
import { API_ENDPOINTS } from "@/app/config/api";
import { Company, CompanyInfo } from "@/types/settings";

function updateCompanyFormData(data: CompanyInfo): FormData {
  const formData = new FormData();

  const appendIfDefined = (key: string, value?: string) => {
    if (value !== undefined) {
      formData.append(key, value);
    }
  };

  appendIfDefined("name", data.name);
  appendIfDefined("description", data.description);
  appendIfDefined("email", data.email);
  appendIfDefined("phone", data.phone);
  appendIfDefined("address", data.address);
  appendIfDefined("website_url", data.website_url);
  appendIfDefined("facebook_url", data.facebook_url);
  appendIfDefined("instagram_url", data.instagram_url);
  appendIfDefined("linkedin_url", data.linkedin_url);
  appendIfDefined("twitter_url", data.twitter_url);
  appendIfDefined("youtube_url", data.youtube_url);

  if (data.logo instanceof File) {
    formData.append("logo", data.logo);
  }

  return formData;
}

export class SettingService {

  static async getCompany({ }): Promise<Company> {
    return await api.get(`${API_ENDPOINTS.GET_COMPANY}`, {
      requiresAuth: true,
    });
  }

  static async updateCompany(payload: CompanyInfo): Promise<Company> {
    const formData = updateCompanyFormData(payload);

    return await api.putFormData(`${API_ENDPOINTS.UPDATE_COMPANY}`, formData, {
      requiresAuth: true,
    });
  }
}
