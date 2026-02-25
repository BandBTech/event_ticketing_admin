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
import { OrganizerService } from "@/services/organizerService";
import { useRouter } from "next/navigation";

import PasswordFieldModal from "@/app/settings/payments/components/PasswordFieldModal";
import { usePaymentStore } from "@/store/paymentStore";

const createBasicInfoSchema = (
  t: (key: string, fallback?: string) => string,
) => {
  const v = createValidationHelpers(t);

  return z.object({
    api_key: z.string().max(50, v.maxLength("API Key", 50)).optional(),

    api_secret: z.string().max(50, v.maxLength("API Secret", 50)).optional(),

    webhook_secret: z
      .string()
      .max(50, v.maxLength("Webhook Secret", 50))
      .optional(),

    display_name: z
      .string()
      .min(1, v.required("Display Name"))
      .min(3, v.minLength("Display Name", 3))
      .max(50, v.maxLength("Display Name", 50)),
    gateway_name: z
      .string()
      .min(1, v.required("Gateway Name"))
      .min(3, v.minLength("Gateway Name", 3))
      .max(50, v.maxLength("Gateway Name", 50)),

    is_enabled: z.boolean().optional(),
    is_test_mode: z.boolean().optional(),
  });
};
export default function AddPaymentPage() {
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [isPasswordFieldModalOpen, setIsPasswordFieldModalOpen] =
    useState(false);
  const setPaymentData = usePaymentStore((state) => state.setPaymentData);
  const paymentData = usePaymentStore((state) => state);

  const onBasicInfoSubmit = async (data: BasicInfoData) => {
    try {
      // Save to Zustand store
      setPaymentData({
        api_key: data.api_key,
        api_secret: data.api_secret,
        display_name: data.display_name,
        gateway_name: data.gateway_name,
        webhook_secret: data.webhook_secret,
        is_enabled: isEnabled,
        is_test_mode: isTestMode,
      });

      // Open password modal
      setIsPasswordFieldModalOpen(true);
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error(
          "",
          error.message || "Registration failed. Please try again.",
          error.details,
        );
      } else {
        toast.error("", "Registration failed. Please try again.");
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handlePasswordFieldOpen = () => {};

  const basicInfoSchema = createBasicInfoSchema(t);
  type BasicInfoData = z.infer<typeof basicInfoSchema>;

  const basicInfoForm = useForm<BasicInfoData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      api_key: "",
      api_secret: "",
      display_name: "",
      gateway_name: "",
      webhook_secret: "",
      is_enabled: false,
      is_test_mode: false,
    },
    mode: "onChange",
  });

  const {
    formState: { errors },
  } = basicInfoForm;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">
          {t("settings.payments.createPaymentMethod")}
        </h1>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm">
          <form
            onSubmit={basicInfoForm.handleSubmit(onBasicInfoSubmit)}
            className="px-6 py-6"
          >
            <Controller
              name="display_name"
              control={basicInfoForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="display_name">
                    {t("settings.payments.displayName")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="display_name"
                    maxLength={100}
                    placeholder={t("settings.payments.enterDisplayName")}
                    aria-invalid={fieldState.invalid}
                  />
                  <div className="flex justify-between items-center">
                    <p>
                      {" "}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </p>
                    <p className="text-xs font-normal text-left text-muted-foreground">
                      {field.value?.length || 0} /100 {t("common.characters")}
                    </p>
                  </div>
                </Field>
              )}
            />
            <Controller
              name="gateway_name"
              control={basicInfoForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="gateway_name">
                    {t("settings.payments.gatewayName")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="gateway_name"
                    maxLength={100}
                    placeholder={t("settings.payments.enterGatewayName")}
                    aria-invalid={fieldState.invalid}
                  />
                  <div className="flex justify-between items-center">
                    <p>
                      {" "}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </p>
                    <p className="text-xs font-normal text-left text-muted-foreground">
                      {field.value?.length || 0} /100 {t("common.characters")}
                    </p>
                  </div>
                </Field>
              )}
            />
            <div className="flex items-center justify-between space-x-6 space-y-6">
              <div className="flex items-center space-x-3">
                <FieldLabel htmlFor="isEnabled">
                  {t("settings.payments.isEnabled")}
                </FieldLabel>
                <button
                  type="button"
                  onClick={() => setIsEnabled(!isEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                    isEnabled ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                      isEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <FieldLabel htmlFor="isTestMode">
                  {t("settings.payments.isTestMode")}
                </FieldLabel>
                <button
                  type="button"
                  onClick={() => setIsTestMode(!isTestMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                    isTestMode ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                      isTestMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
            <Controller
              name="api_secret"
              control={basicInfoForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="api_secret">
                    {t("settings.payments.apiSecret")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="api_secret"
                    maxLength={100}
                    placeholder={t("settings.payments.enterApiSecret")}
                    aria-invalid={fieldState.invalid}
                  />
                  <div className="flex justify-between items-center">
                    <p>
                      {" "}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </p>
                    <p className="text-xs font-normal text-left text-muted-foreground">
                      {field.value?.length || 0} /100 {t("common.characters")}
                    </p>
                  </div>
                </Field>
              )}
            />
            <Controller
              name="webhook_secret"
              control={basicInfoForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="webhook_secret">
                    {t("settings.payments.webhookSecret")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="webhook_secret"
                    maxLength={100}
                    placeholder={t("settings.payments.enterWebhookSecret")}
                    aria-invalid={fieldState.invalid}
                  />
                  <div className="flex justify-between items-center">
                    <p>
                      {" "}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </p>
                    <p className="text-xs font-normal text-left text-muted-foreground">
                      {field.value?.length || 0} /100 {t("common.characters")}
                    </p>
                  </div>
                </Field>
              )}
            />
            <Controller
              name="api_key"
              control={basicInfoForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="api_key">
                    {t("settings.payments.apiKey")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="api_key"
                    maxLength={100}
                    placeholder={t("settings.payments.enterApiKey")}
                    aria-invalid={fieldState.invalid}
                  />
                  <div className="flex justify-between items-center">
                    <p>
                      {" "}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </p>
                    <p className="text-xs font-normal text-left text-muted-foreground">
                      {field.value?.length || 0} /100 {t("common.characters")}
                    </p>
                  </div>
                </Field>
              )}
            />

            {/* Action Buttons */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleBack}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {t("settings.payments.cancel")}
                </button>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    {t("settings.payments.create")}
                  </button>
                </div>
              </div>
            </div>
          </form>

          <PasswordFieldModal
            open={isPasswordFieldModalOpen}
            onOpenChange={setIsPasswordFieldModalOpen}
          />
        </div>
      </div>
    </div>
  );
}
