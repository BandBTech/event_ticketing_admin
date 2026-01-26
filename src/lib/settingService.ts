import { api } from "./apiClient";
import { API_ENDPOINTS } from "@/app/config/api";

interface Company {
  id: string;
  name: string;
  description: string;
  logo_url: string;
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


export class SettingService {

  static async getCompany({}): Promise<Company> {
    return await api.get(`${API_ENDPOINTS.GET_COMPANY}`, {
      requiresAuth: true,
    });
  }


static async updateCompany(settings: CompanyInfo, logoFile?: File): Promise<CompanyInfo> {
  const formData = new FormData();
  
  // Append logo file if provided (matches -F 'logo=@Screenshot (588).png')
  if (logoFile) {
    formData.append('logo', logoFile);
  }
  
  // Append all text fields (matches -F 'address=dsdfsd')
  if (settings.name) formData.append('name', settings.name);
  if (settings.description) formData.append('description', settings.description);
  if (settings.email) formData.append('email', settings.email);
  if (settings.phone) formData.append('phone', settings.phone);
  if (settings.address) formData.append('address', settings.address);
  if (settings.website_url) formData.append('website_url', settings.website_url);
  if (settings.facebook_url) formData.append('facebook_url', settings.facebook_url);
  if (settings.twitter_url) formData.append('twitter_url', settings.twitter_url);
  if (settings.instagram_url) formData.append('instagram_url', settings.instagram_url);
  if (settings.linkedin_url) formData.append('linkedin_url', settings.linkedin_url);
  if (settings.youtube_url) formData.append('youtube_url', settings.youtube_url);

  return await api.put(
    API_ENDPOINTS.UPDATE_COMPANY,
    formData,
    {
      requiresAuth: true,
    }
  );
}
}
