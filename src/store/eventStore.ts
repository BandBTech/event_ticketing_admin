import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Event } from '@/types/event';

interface EventStore {
  selectedEvent: Event | null;
  setSelectedEvent: (event: Event | null) => void;
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