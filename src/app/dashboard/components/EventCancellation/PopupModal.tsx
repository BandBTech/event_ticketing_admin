"use client";

import React, { useEffect, useMemo } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { createRejectionSchema } from "@/lib/validation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppEvent } from "@/types/event";

interface PopupModalProps {
  title: string;
  children?: React.ReactNode;
  isApprove?: boolean;
  onCancel?: () => void;
  onConfirm?: (data: { adminRemark: string }) => void;
  showCommissionInput?: boolean;
  isLoading?: boolean;
  eventName?: string;
  eventDetails?: AppEvent;
}

/**
 * Rejection Modal Component
 * Uses React Hook Form + Zod validation following the project patterns
 */
function ApprovalModal({
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
  onConfirm?: (data: { adminRemark: string }) => void;
  isLoading?: boolean;
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string;
  remarkLabel?: string;
  placeholder?: string;
  confirmText?: string;
}) {
  const schema = useMemo(() => createRejectionSchema(t), [t]);

  const form = useForm<{ adminRemark: string }>({
    resolver: zodResolver(schema),
    defaultValues: {
      adminRemark: "",
    },
  });

  useEffect(() => {
    form.reset({ adminRemark: "" });
  }, [form]);

  const onSubmit = (data: { adminRemark: string }) => {
    onConfirm?.(data);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel?.()}>
      <DialogContent className="max-w-md rounded-3xl shadow-2xl border-none bg-white/95 backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2 duration-300">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="relative space-y-4"
          >
            {isLoading && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-3xl">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                  <p className="text-sm font-medium text-gray-700">
                    {t("dashboard.dataDisplay.processing")}...
                  </p>
                </div>
              </div>
            )}
            {children}

            <FormField
              control={form.control}
              name="adminRemark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    {remarkLabel || t("dashboard.modal.reason")}
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder={
                        placeholder || t("dashboard.modal.approvalReason")
                      }
                      className="resize-none bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-500/20 transition-all"
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
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
              <Button
                variant="outline"
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="h-11 px-6 border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {t("common.cancelButton", "Cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 px-8 flex-1 sm:flex-none active:scale-95"
              >
                {isLoading
                  ? t("common.loading")
                  : confirmText || t("dashboard.modal.approveCancellation")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
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
  onConfirm?: (data: { adminRemark: string }) => void;
  isLoading?: boolean;
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string;
  remarkLabel?: string;
  placeholder?: string;
  confirmText?: string;
}) {
  // Schema Factory Pattern: Create schema with translated messages
  const schema = useMemo(() => createRejectionSchema(t), [t]);

  const form = useForm<{ adminRemark: string }>({
    resolver: zodResolver(schema),
    defaultValues: {
      adminRemark: "",
    },
  });

  useEffect(() => {
    form.reset({ adminRemark: "" });
  }, [form]);

  const onSubmit = (data: { adminRemark: string }) => {
    onConfirm?.(data);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel?.()}>
      <DialogContent className="max-w-md rounded-3xl shadow-2xl border-none bg-white/95 backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2 duration-300">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="relative space-y-4"
          >
            {isLoading && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-3xl">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                  <p className="text-sm font-medium text-gray-700">
                    {t("dashboard.dataDisplay.processing")}...
                  </p>
                </div>
              </div>
            )}
            {children}

            <FormField
              control={form.control}
              name="adminRemark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    {remarkLabel || t("dashboard.modal.reason")}
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder={
                        placeholder || t("dashboard.modal.rejectionReason")
                      }
                      className="resize-none bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-500/20 transition-all"
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
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
              <Button
                variant="outline"
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="h-11 px-6 border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {t("common.cancelButton", "Cancel")}
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isLoading}
                className="h-11 px-8 flex-1 sm:flex-none active:scale-95"
              >
                {isLoading
                  ? t("common.loading")
                  : confirmText || t("dashboard.modal.rejectCancellation")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
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
  isLoading = false,
  remarkLabel,
  placeholder,
  confirmText,
}: PopupModalProps & {
  remarkLabel?: string;
  placeholder?: string;
  confirmText?: string;
}) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  // Route to the appropriate modal based on action type
  if (isApprove) {
    return (
      <ApprovalModal
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
      </ApprovalModal>
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
