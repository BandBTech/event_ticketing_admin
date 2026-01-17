/**
 * Permission and Role Types
 * For Admin Permissions & Roles Management
 */

// ==================== Permission Types ====================

export interface Permission {
  id: string;
  name: string;
  description: string;
  category?: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePermissionRequest {
  name: string;
  description: string;
  category?: string;
}

export interface UpdatePermissionRequest {
  name?: string;
  description?: string;
  category?: string;
}

// ==================== Role Types ====================

export interface Role {
  id: string;
  name: string;
  description: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== Request Types ====================

export interface AssignPermissionsRequest {
  permission_names: string[];
}
