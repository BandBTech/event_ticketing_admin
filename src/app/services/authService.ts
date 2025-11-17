// services/authService.ts
import { apiClient } from '@/app/lib/apiClient';
import { API_ENDPOINTS } from '@/app/config/api';

interface LoginPayload {
  email: string;
  password: string;
}

interface ForgotPasswordPayload {
  email: string;
}

interface LoginResponse {
  token: string;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ResetPasswordPayload {
  confirm_password: string;
  email_token: string;
  new_password: string;
  reset_token: string;
}

interface VerifyOtpPayload {
  identifier: string;
  otp_code: string;
  otp_type: string;
}

interface ResendOtpPayload {
  identifier: string;
  otp_type: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiClient(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Example for future signup
interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_email_verified: boolean;
  roles: Role[];
  created_at: string;
  updated_at: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: UserData;
  timestamp: string;
  request_id: string;
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  return apiClient(API_ENDPOINTS.SIGNUP, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// FORGOT PASSWORD
export async function forgotPassword(payload: ForgotPasswordPayload) {
  return apiClient(API_ENDPOINTS.FORGOT_PASSWORD, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
// RESEND OTP
export async function resendOTP(payload: ResendOtpPayload) {
  return apiClient(API_ENDPOINTS.RESEND_OTP, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// RESET PASSWORD
export async function resetPassword(payload: ResetPasswordPayload) {
  return apiClient(API_ENDPOINTS.RESET_PASSWORD, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// VERIFY OTP
export async function verifyOtp(payload: VerifyOtpPayload) {
  return apiClient(API_ENDPOINTS.VERIFY_OTP, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
// GET PROFILE
export async function getProfile() {
  return apiClient(API_ENDPOINTS.GET_PROFILE, {
    method: 'GET',
  });
}





