import { api } from "@/lib/apiClient";
import {
  Permission,
  Role,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  AssignPermissionsRequest,
} from "@/types/permissions";
import { BillingFilters } from "@/types/billings";

class AdminService {
  // ==================== System Initialization ====================

  /**
   * Initialize system permissions
   * Calls POST /api/v1/admin/permissions/initialize-system
   */
  async initializeSystemPermissions(): Promise<{ message: string }> {
    return await api.post<{ message: string }>(
      "/admin/permissions/initialize-system",
      {},
      {
        requiresAuth: true,
        showSuccessToast: true,
        showErrorToast: true,
      },
    );
  }

  // ==================== Permissions CRUD ====================

  /**
   * Get all system permissions
   */
  async getPermissions(): Promise<Permission[]> {
    return await api.get<Permission[]>("/admin/permissions", {
      requiresAuth: true,
    });
  }

  /**
   * Create a new custom permission
   */
  async createPermission(data: CreatePermissionRequest): Promise<Permission> {
    return await api.post<Permission>("/admin/permissions", data, {
      requiresAuth: true,
      showSuccessToast: true,
    });
  }

  /**
   * Update an existing permission
   */
  async updatePermission(
    id: string,
    data: UpdatePermissionRequest,
  ): Promise<Permission> {
    return await api.put<Permission>(`/admin/permissions/${id}`, data, {
      requiresAuth: true,
      showSuccessToast: true,
    });
  }

  /**
   * Delete a permission
   */
  async deletePermission(id: string): Promise<void> {
    await api.delete<void>(`/admin/permissions/${id}`, {
      requiresAuth: true,
      showSuccessToast: true,
    });
  }

  // ==================== Roles ====================

  /**
   * Get all system roles
   */
  async getRoles(): Promise<Role[]> {
    return await api.get<Role[]>("/admin/roles", {
      requiresAuth: true,
    });
  }

  // ==================== Role-Permission Mapping ====================

  /**
   * Get permissions assigned to a specific role
   */
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    return await api.get<Permission[]>(`/admin/roles/${roleId}/permissions`, {
      requiresAuth: true,
    });
  }

  /**
   * Assign permissions to a role
   */
  async assignRolePermissions(
    roleId: string,
    data: AssignPermissionsRequest,
  ): Promise<{ message: string }> {
    return await api.post<{ message: string }>(
      `/admin/roles/${roleId}/permissions`,
      data,
      {
        requiresAuth: true,
        showSuccessToast: true,
      },
    );
  }

  /**
   * Get all entities
   */
  async getAllEntities(type: string): Promise<BillingFilters> {
    return await api.get<BillingFilters>(`/admin/list-all?type=${type}`, {
      requiresAuth: true,
    });
  }

  /**
   * Get all entities
   */
  async getEventsBYOrganizerID(organizer_id: string, type: string): Promise<BillingFilters> {
    return await api.get<BillingFilters>(`/admin/list-all?type=${type}&organizer_id=${organizer_id}`, {
      requiresAuth: true,
    });
  }
}

export const adminService = new AdminService();
