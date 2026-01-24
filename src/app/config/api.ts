export const API_BASE_URL = "https://sandbox.timroticket.com/api/v1";

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/admin/login`,
  SIGNUP: `${API_BASE_URL}/auth/register`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/reset-password-request`,
  VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  GET_PROFILE: `${API_BASE_URL}/auth/profile`,
  RESEND_OTP: `${API_BASE_URL}/auth/send-otp`,

  // Admin Permissions

  // Admin Management

  // Organizers
  GET_ORGANIZERS: `${API_BASE_URL}/admin/organizers`,
  CREATE_ORGANIZERS: `${API_BASE_URL}/admin/organizer`,
  GET_PENDING_ORGANIZERS: `${API_BASE_URL}/admin/organizers/pending`,
  APPROVE_ORGANIZERS: (id: string) =>
    `${API_BASE_URL}/admin/organizers/${id}/status`,

  // Events
  GET_EVENTS: `${API_BASE_URL}/admin/events`,
  GET_PENDING_EVENTS: `${API_BASE_URL}/admin/events/pending`,

  // Payouts
};
