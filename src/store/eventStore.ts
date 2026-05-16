import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Event, EventCancellation } from "@/types/event";

interface EventStore {
  selectedEvent: Event | EventCancellation | null;
  totalPendingEvents: number;
  totalPendingCancellationEvents: number;
  setSelectedEvent: (event: Event | EventCancellation | null) => void;
  clearSelectedEvent: () => void;
  setTotalPendingEvents: (count: number) => void;
  setTotalPendingCancellationEvents: (count: number) => void;
}

export const useEventStore = create<EventStore>()(
  persist(
    (set) => ({
      selectedEvent: null,
      totalPendingEvents: 0,
      totalPendingCancellationEvents: 0,
      setSelectedEvent: (event) => set({ selectedEvent: event }),
      clearSelectedEvent: () => set({ selectedEvent: null }),
      setTotalPendingEvents: (count) => set({ totalPendingEvents: count }),
      setTotalPendingCancellationEvents: (count) => set({ totalPendingCancellationEvents: count }),
    }),
    {
      name: "event-storage",
    }
  )
);
