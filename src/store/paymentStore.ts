import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PaymentStore {
  id?: string;
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
      id: "",
      api_key: undefined,
      api_secret: undefined,
      display_name: "",
      gateway_name: "",
      webhook_secret: undefined,
      is_enabled: false,
      is_test_mode: false,

      setPaymentData: (data) =>
        set((state) => ({
          ...state,
          ...data,
        })),

      reset: () =>
        set({
          id: undefined,
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
      name: "payment-storage",
    }
  )
);