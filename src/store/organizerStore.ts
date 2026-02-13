import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OrganizerStore {
  totalPendingOrganizers: number;
  setTotalPendingOrganizers: (count: number) => void;
}

export const useOrganizerStore = create<OrganizerStore>()(
  persist(
    (set) => ({
      totalPendingOrganizers: 0,
      setTotalPendingOrganizers: (count) => set({ totalPendingOrganizers: count }),
    }),
    {
      name: "organizer-storage",
    }
  )
);
