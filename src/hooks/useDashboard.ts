"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  OrganizerService,
  type OrganizerListResponse,
} from "@/services/organizerService";
import { EventService } from "@/services/eventServices";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";
import type { Event, EventCancellation, EventResponse } from "@/types/event";

/**
 * Hook for fetching pending organizers awaiting approval
 */
export function usePendingOrganizers() {
  return useQuery<OrganizerListResponse>({
    queryKey: queryKeys.dashboard.pendingOrganizers,
    queryFn: () => OrganizerService.getPendingOrganizers(),
  });
}

/**
 * Hook for fetching pending events awaiting approval
 */
export function usePendingEvents() {
  return useQuery<EventResponse>({
    queryKey: queryKeys.dashboard.pendingEvents,
    queryFn: () => EventService.getPendingEvent(),
  });
}

/**
 * Hook for fetching pending cancellation events awaiting approval
 */
export function usePendingCancellationEvents() {
  return useQuery<EventResponse>({
    queryKey: queryKeys.dashboard.pendingCancellationEvents,
    queryFn: () => EventService.getPendingCancellationEvent(),
  });
}

/**
 * Hook for approving an organizer
 */
export function useApproveOrganizer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizerId: string) =>
      OrganizerService.approveOrganizer({
        organizerId,
        admin_remark: "Approved by admin",
        status: "approved",
      }),
    onSuccess: () => {
      // Invalidate pending organizers list to refresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.pendingOrganizers,
      });
      // Also invalidate the main organizers list
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizers.list,
      });
    },
  });
}

/**
 * Hook for rejecting an organizer
 */
export function useRejectOrganizer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizerId,
      adminRemark,
    }: {
      organizerId: string;
      adminRemark: string;
    }) =>
      OrganizerService.approveOrganizer({
        organizerId,
        admin_remark: adminRemark,
        status: "rejected",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.pendingOrganizers,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizers.list,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject organizer.");
    },
  });
}

/**
 * Hook for approving an event
 */
export function useApproveEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      adminRemark,
      commissionRate,
    }: {
      eventId: string;
      adminRemark: string;
      commissionRate: number;
    }) =>
      EventService.approveEvent({
        eventId,
        admin_remark: adminRemark,
        status: "approved",
        commission_rate: commissionRate,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.pendingEvents,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.list,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to approve event.");
    },
  });
}

/**
 * Hook for rejecting an event
 */
export function useRejectEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      adminRemark,
    }: {
      eventId: string;
      adminRemark: string;
    }) =>
      EventService.approveEvent({
        eventId,
        admin_remark: adminRemark,
        status: "rejected",
        commission_rate: 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.pendingEvents,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.list,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject event.");
    },
  });
}

/**
 * Hook for approving an event cancellation
 */
export function useApproveCancellationEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      adminRemark,
    }: {
      eventId: string;
      adminRemark: string;
    }) => EventService.approveCancelEvent(eventId, adminRemark),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.pendingEvents,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.list,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to approve cancellation.");
    },
  });
}

/**
 * Hook for rejecting an event cancellation
 */
export function useRejectCancellationEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      adminRemark,
    }: {
      eventId: string;
      adminRemark: string;
    }) => EventService.rejectCancelEvent(eventId, adminRemark),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.pendingEvents,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.list,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to approve cancellation.");
    },
  });
}

/**
 * Hook for handling event cancellations
 */
export function useCancellationEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => EventService.getPendingCancellationEvent(),
  });
}
