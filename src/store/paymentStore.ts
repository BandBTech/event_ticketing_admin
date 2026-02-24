import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PaymentStore {
  api_key?: string;
  api_secret?: string;
  display_name: string;
  gateway_name: string;
  webhook_secret?: string;
  is_enabled: boolean;
  is_test_mode: boolean;

  setPaymentData: (data: Partial<PaymentStore>) => void;
  reset: () => void;
}

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set) => ({
      // ✅ Default values
      api_key: undefined,
      api_secret: undefined,
      display_name: "",
      gateway_name: "",
      webhook_secret: undefined,
      is_enabled: false,
      is_test_mode: false,

      // ✅ Update store
      setPaymentData: (data) =>
        set((state) => ({
          ...state,
          ...data,
        })),

      // ✅ Reset store
      reset: () =>
        set({
          api_key: undefined,
          api_secret: undefined,
          display_name: "",
          gateway_name: "",
          webhook_secret: undefined,
          is_enabled: false,
          is_test_mode: false,
        }),
    }),
    {
      name: "payment-storage", // localStorage key
    }
  )
);