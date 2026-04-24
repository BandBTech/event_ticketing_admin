"use client";

import { useQuery } from "@tanstack/react-query";
import { RefundService } from "@/services/refundService";

/**
 * Hook for fetching refund status history
 */
export function useRefundStatusHistory(eventId: string) {
  return useQuery({
    queryKey: ["eventStatusHistory", eventId],
    queryFn: () => RefundService.getRefundHistory(eventId),
    enabled: !!eventId,
  });
}
