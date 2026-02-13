import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Event } from "@/types/event";

interface EventStore {
  selectedEvent: Event | null;
  totalPendingEvents: number;
  setSelectedEvent: (event: Event | null) => void;
  clearSelectedEvent: () => void;
  setTotalPendingEvents: (count: number) => void;
}

export const useEventStore = create<EventStore>()(
  persist(
    (set) => ({
      selectedEvent: null,
      totalPendingEvents: 0,
      setSelectedEvent: (event) => set({ selectedEvent: event }),
      clearSelectedEvent: () => set({ selectedEvent: null }),
      setTotalPendingEvents: (count) => set({ totalPendingEvents: count }),
    }),
    {
      name: "event-storage",
    }
  )
);
