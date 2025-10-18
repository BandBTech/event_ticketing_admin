// services/authService.ts
import { apiClient } from '@/app/lib/apiClient';

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiClient('https://sandbox.timroticket.com/api/v1/auth/login', {
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
