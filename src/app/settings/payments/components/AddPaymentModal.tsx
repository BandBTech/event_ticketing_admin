"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { useForm, Controller } from "react-hook-form";
import { useLanguageStore } from "@/store/languageStore";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { toast } from "@/lib/toast";
import { createValidationHelpers } from "@/lib/validation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/hooks/useTranslation";
import { AuthError } from "@/services/authService";
import { useRouter } from "next/navigation";
import PasswordFieldModal from "@/app/settings/payments/components/PasswordFieldModal";
import { usePaymentStore } from "@/store/paymentStore";

interface GatewayConfigModalProps {
  onClose: () => void;
}

function GatewayConfigModal({ onClose }: GatewayConfigModalProps) {
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const [isEnabled, setIsEnabled] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [isPasswordFieldModalOpen, setIsPasswordFieldModalOpen] =
    useState(false);

  const setPaymentData = usePaymentStore((state) => state.setPaymentData);

const createBasicInfoSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
)=> {
    const v = createValidationHelpers(t);

    return z.object({
      api_key: z.string().max(100, v.maxLength("API Key", 100)).optional(),
      api_secret: z.string().max(100, v.maxLength("API Secret", 100)).optional(),
      webhook_secret: z
        .string()
        .max(100, v.maxLength("Webhook Secret", 100))
        .optional(),
      display_name: z
        .string()
        .min(1, v.required("Display Name"))
        .min(3, v.minLength("Display Name", 3))
        .max(100, v.maxLength("Display Name", 100)),
      gateway_name: z
        .string()
        .min(1, v.required("Gateway Name"))
        .min(3, v.minLength("Gateway Name", 3))
        .max(100, v.maxLength("Gateway Name", 100)),
    });
  };

  const basicInfoSchema = createBasicInfoSchema(t);
  type BasicInfoData = z.infer<typeof basicInfoSchema>;

  const form = useForm<BasicInfoData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      api_key: "",
      api_secret: "",
      display_name: "",
      gateway_name: "",
      webhook_secret: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: BasicInfoData) => {
    try {
      setPaymentData({
        ...data,
        is_enabled: isEnabled,
        is_test_mode: isTestMode,
      });

      setIsPasswordFieldModalOpen(true);
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error("", error.message || "Something went wrong");
      } else {
        toast.error("", "Something went wrong");
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex h-[90vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Add Payment Method
        </h2>

        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100"
        >
          ✕
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Display Name */}
          <Controller
            name="display_name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="display_name">
                  {t("settings.payments.displayName")}
                </FieldLabel>
                <Input {...field} id="display_name" maxLength={100} />
                {fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Gateway Name */}
          <Controller
            name="gateway_name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="gateway_name">
                  {t("settings.payments.gatewayName")}
                </FieldLabel>
                <Input {...field} id="gateway_name" maxLength={100} />
                {fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Toggle Section */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
            <Toggle
              label={t("settings.payments.isEnabled")}
              value={isEnabled}
              onChange={() => setIsEnabled(!isEnabled)}
            />
            <Toggle
              label={t("settings.payments.isTestMode")}
              value={isTestMode}
              onChange={() => setIsTestMode(!isTestMode)}
            />
          </div>

          {/* API Secret */}
          <Controller
            name="api_secret"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>
                  {t("settings.payments.apiSecret")}
                </FieldLabel>
                <Input {...field} maxLength={100} />
              </Field>
            )}
          />

          {/* Webhook Secret */}
          <Controller
            name="webhook_secret"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>
                  {t("settings.payments.webhookSecret")}
                </FieldLabel>
                <Input {...field} maxLength={100} />
              </Field>
            )}
          />

          {/* API Key */}
          <Controller
            name="api_key"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>
                  {t("settings.payments.apiKey")}
                </FieldLabel>
                <Input {...field} maxLength={100} />
              </Field>
            )}
          />

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 border rounded-lg text-sm"
            >
              {t("settings.payments.cancel")}
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              {t("settings.payments.create")}
            </button>
          </div>
        </form>
      </div>

      <PasswordFieldModal
        open={isPasswordFieldModalOpen}
        onOpenChange={setIsPasswordFieldModalOpen}
      />
    </div>
  );
}

/* Toggle Component */
function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between sm:justify-start gap-3">
      <FieldLabel>{label}</FieldLabel>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          value ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

/* Main Modal Wrapper */
export default function AddPaymentModal({
  open,
  closeModal,
  visible,
}: {
  open: boolean;
  closeModal: () => void;
  visible: boolean;
}) {
  if (!open) return null;

  return (
    <div
      onClick={closeModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{
        background: "rgba(15,23,42,0.45)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[560px]"
        style={{
          transform: visible
            ? "translateY(0) scale(1)"
            : "translateY(12px) scale(0.97)",
          transition: "transform 0.22s ease",
        }}
      >
        <GatewayConfigModal onClose={closeModal} />
      </div>
    </div>
  );
}