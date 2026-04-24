export interface Company {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  logo: File | null;
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

export interface CompanyInfo {
  name: string;
  description?: string;
  logo_url?: string;
  logo: File | null;
  email: string;
  phone?: string;
  address?: string;
  website_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  youtube_url?: string;
}
