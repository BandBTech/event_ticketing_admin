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
    all: (filters?: { page?: number; limit?: number; status?: string; organizerId?: string; search?: string }) =>
      ['adminEvents', filters] as const,
    /** Key for all events (used for invalidation) */
    list: ['adminEvents'] as const,
        /** Key for fetching a single event by ID */
        detail: (id: string) => ['event', id] as const,
    },

    /**
     * Organizers query keys
     */
    organizers: {
        /** Key for fetching organizers list with pagination */
        all: (page?: number, itemsPerPage?: number) =>
            ['organizers', page, itemsPerPage] as const,
        /** Key for all organizers (used for invalidation) */
        list: ['organizers'] as const,
        /** Key for fetching a single organizer by ID */
        detail: (id: string) => ['organizer', id] as const,
    },
} as const;

