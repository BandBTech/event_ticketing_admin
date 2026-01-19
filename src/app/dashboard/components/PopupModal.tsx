"use client";

import React, { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TranslatedFormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createEventApprovalSchema,
  createRejectionSchema,
} from "@/lib/validation";

// Explicit form value types for better type safety
interface ApprovalFormData {
  commissionRate: string;
  adminRemark: string;
}

interface RejectionFormData {
  adminRemark: string;
}

interface PopupModalProps {
  title: string;
  children?: React.ReactNode;
  isApprove?: boolean;
  onCancel?: () => void;
  onConfirm?: (data: { commissionRate?: number; adminRemark: string }) => void;
  showCommissionInput?: boolean;
  isLoading?: boolean;
}

/**
 * Event Approval Modal Component
 * Uses React Hook Form + Zod validation following the project patterns
 */
function EventApprovalModal({
  title,
  children,
  onCancel,
  onConfirm,
  isLoading = false,
  t,
}: {
  title: string;
  children?: React.ReactNode;
  onCancel?: () => void;
  onConfirm?: (data: { commissionRate?: number; adminRemark: string }) => void;
  isLoading?: boolean;
  t: (key: string, fallback?: string) => string;
}) {
  // Schema Factory Pattern: Create schema with translated messages
  const schema = useMemo(() => createEventApprovalSchema(t), [t]);

  const form = useForm<ApprovalFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      commissionRate: "10",
      adminRemark: "",
    },
  });

  useEffect(() => {
    form.reset({ commissionRate: "10", adminRemark: "" });
  }, [form]);

  const onSubmit = (data: ApprovalFormData) => {
    onConfirm?.({
      commissionRate: parseFloat(data.commissionRate),
      adminRemark: data.adminRemark || "",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
            {children}

            <FormField
              control={form.control}
              name="commissionRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("dashboard.modal.commissionRate")}
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" max="100" placeholder={t("dashboard.modal.commissionRatePlaceholder", "Enter commission rate (in %)")} {...field} />
                  </FormControl>
                  <div className="flex justify-between items-center min-h-[20px]">
                    <TranslatedFormMessage t={t} className="mt-0" />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adminRemark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("dashboard.modal.additionalNotes")}</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder={t("dashboard.modal.additionalNotesPlaceholder")}
                      className="resize-none"
                      maxLength={500}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center min-h-[20px]">
                    <TranslatedFormMessage t={t} className="mt-0" />
                    <div className="text-xs text-muted-foreground ml-auto">
                      {field.value?.length || 0}/500 {t("common.characters")}
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
                {t("common.cancelButton", "Cancel")}
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
                {isLoading ? t("common.loading") : t("dashboard.modal.confirmApprove")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

/**
 * Rejection Modal Component
 * Uses React Hook Form + Zod validation following the project patterns
 */
function RejectionModal({
  title,
  children,
  onCancel,
  onConfirm,
  isLoading = false,
  t,
  remarkLabel,
  placeholder,
  confirmText,
}: {
  title: string;
  children?: React.ReactNode;
  onCancel?: () => void;
  onConfirm?: (data: { commissionRate?: number; adminRemark: string }) => void;
  isLoading?: boolean;
  t: (key: string, fallback?: string) => string;
    remarkLabel?: string;
    placeholder?: string;
    confirmText?: string;
  }) {
  // Schema Factory Pattern: Create schema with translated messages
  const schema = useMemo(() => createRejectionSchema(t), [t]);

  const form = useForm<RejectionFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      adminRemark: "",
    },
  });

  useEffect(() => {
    form.reset({ adminRemark: "" });
  }, [form]);

  const onSubmit = (data: RejectionFormData) => {
    onConfirm?.({
      adminRemark: data.adminRemark,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
            {children}

            <FormField
              control={form.control}
              name="adminRemark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                      {remarkLabel || t("dashboard.modal.reasonForRejection")}
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                      placeholder={placeholder || t("dashboard.modal.rejectionPlaceholder")}
                      className="resize-none"
                      maxLength={500}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center min-h-[20px]">
                    <TranslatedFormMessage t={t} className="mt-0" />
                    <div className="text-xs text-muted-foreground ml-auto">
                      {field.value?.length || 0}/500 {t("common.characters")}
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
                {t("dashboard.modal.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading} variant="destructive">
                {isLoading ? t("common.loading") : confirmText || t("dashboard.modal.confirmReject")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

/**
 * PopupModal - Unified modal for approval/rejection flows
 * Follows the Schema Factory Pattern with React Hook Form + Zod
 */
export default function PopupModal({
  title,
  children,
  isApprove = false,
  onCancel,
  onConfirm,
  showCommissionInput = false,
  isLoading = false,
  remarkLabel,
  placeholder,
  confirmText,
}: PopupModalProps & { remarkLabel?: string; placeholder?: string; confirmText?: string }) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  // Route to the appropriate modal based on action type
  if (isApprove && showCommissionInput) {
    return (
      <EventApprovalModal
        title={title}
        onCancel={onCancel}
        onConfirm={onConfirm}
        isLoading={isLoading}
        t={t}
      >
        {children}
      </EventApprovalModal>
    );
  }

  return (
    <RejectionModal
      title={title}
      onCancel={onCancel}
      onConfirm={onConfirm}
      isLoading={isLoading}
      t={t}
      remarkLabel={remarkLabel}
      placeholder={placeholder}
      confirmText={confirmText}
    >
      {children}
    </RejectionModal>
  );
}
