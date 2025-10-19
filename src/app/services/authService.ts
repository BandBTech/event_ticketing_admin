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
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiClient(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Example for future signup
interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export async function signup(payload: SignupPayload): Promise<LoginResponse> {
  return apiClient('https://sandbox.timroticket.com/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// FORGOT PASSWORD
export async function forgotPassword(payload: ForgotPasswordPayload) {
  return apiClient('https://sandbox.timroticket.com/api/v1/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// RESET PASSWORD
export async function resetPassword(payload: ResetPasswordPayload) {
  return apiClient('https://sandbox.timroticket.com/api/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// VERIFY OTP
export async function verifyOtp(payload: VerifyOtpPayload) {
  return apiClient('https://sandbox.timroticket.com/api/v1/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}





