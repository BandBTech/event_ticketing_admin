/**
 * Centralized TanStack Query Keys
 *
 * This file provides a type-safe factory pattern for all query keys used in the application.
 * Using centralized keys ensures:
 * - Consistent key references across queries and invalidations
 * - Type-safety to prevent typos
 * - Single source of truth for cache management
 * - Easy refactoring when keys need changes
 */

export const queryKeys = {
  /**
   * Admin events query keys
   */
  events: {
    /** Key for fetching admin events list with filters and pagination */
    all: (filters?: {
      page?: number;
      limit?: number;
      status?: string;
      organizerId?: string;
      search?: string;
    }) => ["adminEvents", filters] as const,
    /** Key for all events (used for invalidation) */
    list: ["adminEvents"] as const,
    /** Key for fetching a single event by ID */
    detail: (id: string) => ["event", id] as const,
    /** Key for fetching event status history */
    statusHistory: (id: string) => ["event", id, "statusHistory"] as const,
  },

  /**
   * Organizers query keys
   */
  organizers: {
    /** Key for fetching organizers list with pagination and filters */
    all: (filters?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      account_status?: string;
      all_approved?: boolean;
    }) => ["organizers", filters] as const,
    /** Key for all organizers (used for invalidation) */
    list: ["organizers"] as const,
    /** Key for fetching a single organizer by ID */
    detail: (id: string) => ["organizer", id] as const,
  },

  /**
   * Users query keys
   */
  users: {
    /** Key for fetching users list with pagination and filters */
    all: (
      page?: number,
      itemsPerPage?: number,
      search?: string,
      status?: string,
      accountStatus?: string,
    ) => ["users", page, itemsPerPage, search, status, accountStatus] as const,
    /** Key for all users (used for invalidation) */
    list: ["users"] as const,
    /** Key for fetching a single user by ID */
    detail: (id: string) => ["user", id] as const,
  },

  /**
   * Permissions query keys
   */
  permissions: {
    /** Key for fetching all permissions */
    all: ["permissions"] as const,
    /** Key for permission list (used for invalidation) */
    list: ["permissions"] as const,
  },

  /**
   * Roles query keys
   */
  roles: {
    /** Key for fetching all roles */
    all: ["roles"] as const,
    /** Key for role list (used for invalidation) */
    list: ["roles"] as const,
    /** Key for fetching permissions of a specific role */
    permissions: (roleId: string) => ["roles", roleId, "permissions"] as const,
  },

  /**
   * Dashboard query keys
   */
  dashboard: {
    /** Key for fetching pending organizers awaiting approval */
    pendingOrganizers: ["dashboard", "pendingOrganizers"] as const,
    /** Key for fetching pending events awaiting approval */
    pendingEvents: ["dashboard", "pendingEvents"] as const,
  },
} as const;
