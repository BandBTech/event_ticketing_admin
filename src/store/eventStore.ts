import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PendingEvent } from '@/types/pendingEvents';

interface EventStore {
  selectedEvent: PendingEvent | null;
  setSelectedEvent: (event: PendingEvent | null) => void;
  clearSelectedEvent: () => void;
}

export const useEventStore = create<EventStore>()(
  persist(
    (set) => ({
      selectedEvent: null,
      setSelectedEvent: (event) => set({ selectedEvent: event }),
      clearSelectedEvent: () => set({ selectedEvent: null }),
    }),
    {
      name: 'event-storage',
    }
  )
);