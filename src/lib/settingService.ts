import { api } from "./apiClient";
import { API_ENDPOINTS } from "@/app/config/api";

interface Company {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  logo: File | string;
  email: string;
  phone: string;
  address: string;
  website_url: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url: string;
  created_at: string; 
  updated_at: string; 
}

interface CompanyInfo {
  name: string;
  description: string;
  logo_url: string;
  logo: File | string;
  email: string;
  phone: string;
  address: string;
  website_url: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url: string;
}

// Helper to create FormData from event object
function updateCompanyFormData(data: CompanyInfo): FormData {
  
  const formData = new FormData();
  if (data.name) formData.append('name', data.name);
  if (data.description) formData.append('description', data.description);

  // Handle logo (File or string)
  if (data.logo instanceof File) {
    formData.append('logo', data.logo);
  }

  if (data.email) formData.append('email', data.email);
  if (data.phone) formData.append('phone', data.phone);
  if (data.address) formData.append('address', data.address);
  if (data.website_url) formData.append('website_url', data.website_url);
  if (data.facebook_url) formData.append('facebook_url', data.facebook_url);
  if (data.instagram_url) formData.append('instagram_url', data.instagram_url);
  if (data.linkedin_url) formData.append('linkedin_url', data.linkedin_url);
  if (data.twitter_url) formData.append('twitter_url', data.twitter_url);
  if (data.youtube_url) formData.append('youtube_url', data.youtube_url);

  
  return formData;
}

export class SettingService {

  static async getCompany({}): Promise<Company> {
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
