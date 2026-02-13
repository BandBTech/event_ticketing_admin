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
  GET_SINGLE_ORGANIZER: (id: string) =>
    `${API_BASE_URL}/admin/organizers/${id}`,
  CREATE_ORGANIZERS: `${API_BASE_URL}/admin/users/organizers`,
  GET_PENDING_ORGANIZERS: `${API_BASE_URL}/admin/organizers/pending`,
  APPROVE_ORGANIZERS: (id: string) =>
    `${API_BASE_URL}/admin/organizers/${id}/approval`,
  GET_ORGANIZER_DETAIL: (id: string) => `${API_BASE_URL}/admin/organizers/${id}`,


  // Events
  GET_EVENTS: `${API_BASE_URL}/admin/events`,
  GET_PENDING_EVENTS: `${API_BASE_URL}/admin/events/pending`,

  // Payouts

  //users
  GET_USERS: `${API_BASE_URL}/admin/users`,

  //settings
  GET_COMPANY: `${API_BASE_URL}/admin/company-info`,
  UPDATE_COMPANY: `${API_BASE_URL}/admin/company-info`,

  // User Management
  UPDATE_ORGANIZER_ACCOUNT_STATUS: (id: string) => `${API_BASE_URL}/admin/users/${id}/status`,

  //PAYMENT GATEWAYS
  GET_PAYMENT_GATEWAYS: `${API_BASE_URL}/admin/payment-gateways`,
  CREATE_PAYMENT_GATEWAY: `${API_BASE_URL}/admin/payment-gateways`,
};
