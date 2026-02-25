"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { useForm, Controller } from "react-hook-form";
import { useLanguageStore } from "@/store/languageStore";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { toast } from "@/lib/toast";
import { createPaymentSchema, CreatePaymentFormValues } from "@/lib/validation";
import { PaymentGatewayConfig as GatewayConfig } from "@/types/payment";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/hooks/useTranslation";
import { AuthError } from "@/services/authService";
import { usePaymentStore } from "@/store/paymentStore";

interface GatewayConfigModalProps {
  onClose: () => void;
  onPasswordFieldOpen: () => void;
  gateway: GatewayConfig | null;
}

type ToggleProps = {
  label: string;
  value: boolean;
  onChange?: (value: boolean) => void;
  variant?: "green" | "amber" | "blue";
  description?: string;
};

function Toggle({ label, value, onChange, description }: ToggleProps) {
  const handleToggle = useCallback(() => {
    onChange?.(!value);
  }, [value, onChange]);

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg  py-2.5">
      <div>
        <FieldLabel>{label}</FieldLabel>
        {description && (
          <p className="mt-0.5 max-w-xs text-[11.5px] leading-snug text-slate-400 cursor-default">
            {description}
          </p>
        )}
      </div>

      {/* Toggle Switch */}
      <button
        type="button"
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none ${
          value ? "bg-green-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
            value ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function EditPaymentForm({
  onClose,
  gateway,
  onPasswordFieldOpen,
}: GatewayConfigModalProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const [isEnabled, setIsEnabled] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const setPaymentData = usePaymentStore((state) => state.setPaymentData);
  const gatewayId = gateway?.id;

  const paymentSchema = createPaymentSchema(t);
  const form = useForm<CreatePaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      api_key: "",
      api_secret: "",
      display_name: "",
      gateway_name: "",
      webhook_secret: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (gateway) {
      form.reset({
        api_key: gateway.api_key || "",
        api_secret: gateway.api_secret || "",
        display_name: gateway.display_name || "",
        gateway_name: gateway.gateway_name || "",
        webhook_secret: gateway.webhook_secret || "",
      });

      setIsEnabled(gateway.is_enabled ?? false);
      setIsTestMode(gateway.is_test_mode ?? false);
    }
  }, [gateway, form]);

  const onSubmit = async (data: CreatePaymentFormValues) => {
    try {
      setPaymentData({
        ...data,
        id: gatewayId,
        is_enabled: isEnabled,
        is_test_mode: isTestMode,
      });

      onPasswordFieldOpen();
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error("", error.message || "Something went wrong");
      } else {
        toast.error("", "Something went wrong");
      }
    }
  };

  return (
    <div className="flex h-[90vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#fefeff] shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Edit Payment Method
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
                  <span className="text-red-500 ml-1">*</span>
                </FieldLabel>
                <Input
                  {...field}
                  id="display_name"
                  placeholder="Enter Display Name"
                  maxLength={100}
                />
                <div className="flex justify-between items-center">
                  <p>
                    {" "}
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </p>
                  <p className="text-xs font-normal text-left text-muted-foreground">
                    {field.value?.length || 0} /100 characters
                  </p>
                </div>
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
                  <span className="text-red-500 ml-1">*</span>
                </FieldLabel>
                <Input
                  {...field}
                  id="gateway_name"
                  placeholder="Enter Gateway Name"
                  maxLength={100}
                />
                <div className="flex justify-between items-center">
                  <p>
                    {" "}
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </p>
                  <p className="text-xs font-normal text-left text-muted-foreground">
                    {field.value?.length || 0} /100 characters
                  </p>
                </div>
              </Field>
            )}
          />

          <div>
            <Toggle
              label="Gateway Enabled"
              description="Controls whether this payment method is active at checkout."
              value={isEnabled}
              onChange={() => setIsEnabled(!isEnabled)}
            />
            <Toggle
              label="Test Mode"
              description="No real transactions are processed when test mode is on."
              value={isTestMode}
              onChange={() => setIsTestMode(!isTestMode)}
            />
          </div>

          {/* API Key */}
          <Controller
            name="api_key"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("settings.payments.apiKey")}</FieldLabel>
                <Input placeholder="Enter API Key" maxLength={100} {...field} />
                <div className="flex justify-between items-center">
                  <p>
                    {" "}
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </p>
                  <p className="text-xs font-normal text-left text-muted-foreground">
                    {field.value?.length || 0} /100 characters
                  </p>
                </div>
              </Field>
            )}
          />

          {/* API Secret */}
          <Controller
            name="api_secret"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("settings.payments.apiSecret")}</FieldLabel>
                <Input
                  {...field}
                  placeholder="Enter API Secret"
                  maxLength={100}
                />
                <div className="flex justify-between items-center">
                  <p>
                    {" "}
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </p>
                  <p className="text-xs font-normal text-left text-muted-foreground">
                    {field.value?.length || 0} /100 characters
                  </p>
                </div>
              </Field>
            )}
          />

          {/* Webhook Secret */}
          <Controller
            name="webhook_secret"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("settings.payments.webhookSecret")}</FieldLabel>
                <Input
                  {...field}
                  placeholder="Enter Webhook Secret"
                  maxLength={100}
                />
                <div className="flex justify-between items-center">
                  <p>
                    {" "}
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </p>
                  <p className="text-xs font-normal text-left text-muted-foreground">
                    {field.value?.length || 0} /100 characters
                  </p>
                </div>
              </Field>
            )}
          />

          {/* Action Buttons */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2  text-black rounded-lg text-sm "
            >
              {t("settings.payments.cancel")}
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              {t("", "save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* Main Modal Wrapper */
export default function EditPaymentModal({
  open,
  closeModal,
  visible,
  gateway,
  onPasswordFieldOpen,
}: {
  open: boolean;
  closeModal: () => void;
  onPasswordFieldOpen: () => void;
  visible: boolean;
  gateway: GatewayConfig | null;
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
        <EditPaymentForm
          onClose={closeModal}
          gateway={gateway}
          onPasswordFieldOpen={onPasswordFieldOpen}
        />
      </div>
    </div>
  );
}
