"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EventService } from "@/lib/eventServices";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";
import type { Event } from "@/types/event";

/**
 * Response type for admin events
 */
interface EventResponse {
  events: Event[];
  limit: number;
  page: number;
  total: number;
}

/**
 * Filters for admin events
 */
interface AdminEventFilters {
  page?: number;
  limit?: number;
  status?: string;
  organizerId?: string;
  search?: string;
}

/**
 * Hook for fetching all admin events with filters
 */
export function useAdminEvents(filters?: AdminEventFilters) {
  return useQuery<EventResponse>({
    queryKey: queryKeys.events.all(filters),
    queryFn: () =>
      EventService.getAdminEvents({
        page: filters?.page,
        limit: filters?.limit,
        status: filters?.status,
        organizer_id: filters?.organizerId,
        search: filters?.search,
        sort: "-created_at",
      }),
  });
}

/**
 * Hook for fetching a single event by ID
 */
export function useEvent(eventId: string) {
  return useQuery<Event>({
    queryKey: queryKeys.events.detail(eventId),
    queryFn: () => EventService.getEventById(eventId),
    enabled: !!eventId,
  });
}

/**
 * Hook for toggling event featured status
 */
export function useToggleFeatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, isFeatured }: { eventId: string; isFeatured: boolean }) =>
      EventService.toggleFeatured(eventId, isFeatured),
    onSuccess: (_, variables) => {
      // Invalidate event lists
      queryClient.invalidateQueries({ queryKey: queryKeys.events.list });
      // Invalidate specific event
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(variables.eventId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update featured status.");
    },
  });
}

/**
 * Hook for cancelling an event
 */
export function useCancelEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, reason }: { eventId: string; reason: string }) =>
      EventService.cancelEvent(eventId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.list });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.pendingEvents });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel event.");
    },
  });
}

/**
 * Hook for deleting an event
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => EventService.deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.list });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.pendingEvents });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete event.");
    },
  });
}

/**
 * Hook for fetching event analytics
 */
export function useEventAnalytics(filters?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["eventAnalytics", filters],
    queryFn: () => EventService.getEventAnalytics(filters),
  });
}

/**
 * Hook for fetching specific event analytics
 */
export function useEventAnalyticsById(eventId: string) {
  return useQuery({
    queryKey: ["eventAnalytics", eventId],
    queryFn: () => EventService.getEventAnalyticsById(eventId),
    enabled: !!eventId,
  });
}

/**
 * Hook for fetching event status history
 */
export function useEventStatusHistory(eventId: string) {
  return useQuery({
    queryKey: ["eventStatusHistory", eventId],
    queryFn: () => EventService.getStatusHistory(eventId),
    enabled: !!eventId,
  });
}
