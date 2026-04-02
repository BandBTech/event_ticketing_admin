export interface ApiResponse {
  data: UserData;
  error: UserApiError | null;
  message: string;
  request_id: string;
  success: boolean;
  timestamp: string;
  users: User[];
  has_more: boolean;
  total: number;
  limit: number;
  page: number;
  pagination: { total: number; limit: number; page: number; has_next: boolean; has_prev: boolean };
}

export interface UserData {
  has_more: boolean;
  limit: number;
  page: number;
  total: number;
  users: User;
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country_code: string;
  account_status: string;
  organizer_status: string;
  is_email_verified: boolean;
  admin_remark: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  approved_at: string;
  rejected_at: string;
  organizer_id: string;
  organizer_onboarding: UserOrganizerOnboarding;
  roles: UserRole[];
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country_code: string;
  account_status: string;
  organizer_status: string;
  is_email_verified: boolean;
  admin_remark: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  approved_at: string;
  rejected_at: string;
  organizer_id: string;
  organizer_onboarding: UserOrganizerOnboarding;
  roles: UserRole[];
}

export interface UserOrganizerOnboarding {
  id: string;
  organizer: string;
  organizer_id: string;
  business_name: string;
  business_description: string;
  business_logo_url: string;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  permissions: UserPermission[];
  users: string[];
}

export interface UserPermission {
  id: string;
  name: string;
  description: string;
  action: string;
  resource: string;
  roles: string[];
  created_at: string;
  updated_at: string;
}

export interface UserApiError {
  code: string;
  details: string;
  fields: string;
}
