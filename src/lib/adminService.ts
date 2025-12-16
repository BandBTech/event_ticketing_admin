import { api } from '@/lib/apiClient';

class AdminService {
  /**
   * Initialize system permissions
   * Calls POST /api/v1/admin/permissions/initialize-system
   */
  async initializeSystemPermissions(): Promise<{ message: string }> {
    return await api.post<{ message: string }>('/admin/permissions/initialize-system', {}, {
      requiresAuth: true,
      showSuccessToast: true,
      showErrorToast: true,
    });
  }
}

export const adminService = new AdminService();
