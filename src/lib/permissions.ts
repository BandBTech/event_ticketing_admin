/**
 * Permission constants for the Admin Panel.
 * These match the backend permission names and provide type safety.
 */

export const PERMISSIONS = {
  // Admin Full Access
  ADMIN_FULL: 'admin:full',

  // Organizers Management
  ORGANIZER_READ: 'read:organizer',
  ORGANIZER_APPROVE: 'approve:organizer',
  ORGANIZER_REJECT: 'reject:organizer',
  ORGANIZER_UPDATE: 'update:organizer',
  ORGANIZER_DELETE: 'delete:organizer',

  // Events Management
  EVENT_READ: 'read:event',
  EVENT_APPROVE: 'approve:event',
  EVENT_REJECT: 'reject:event',
  EVENT_FEATURED: 'featured:event',
  EVENT_DELETE: 'delete:event',

  // Users Management
  USER_READ: 'read:user',
  USER_CREATE: 'create:user',
  USER_UPDATE: 'update:user',
  USER_DELETE: 'delete:user',

  // Permissions & Roles
  PERMISSION_READ: 'read:permission',
  PERMISSION_MANAGE: 'manage:permission',
  ROLE_READ: 'read:role',
  ROLE_MANAGE: 'manage:role',

  // Payouts
  PAYOUT_READ: 'read:payout',
  PAYOUT_APPROVE: 'approve:payout',
  PAYOUT_REJECT: 'reject:payout',

  // Categories
  CATEGORY_READ: 'read:category',
  CATEGORY_CREATE: 'create:category',
  CATEGORY_UPDATE: 'update:category',
  CATEGORY_DELETE: 'delete:category',

  // Reports & Analytics
  REPORT_READ: 'read:report',
  ANALYTICS_READ: 'read:analytics',

  // Settings
  SETTINGS_READ: 'read:settings',
  SETTINGS_UPDATE: 'update:settings',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
