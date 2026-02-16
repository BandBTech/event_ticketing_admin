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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createEventApprovalSchema,
  createRejectionSchema,
} from "@/lib/validation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppEvent } from "@/types/event";
import { EventDetailCard } from "./EventDetailCard";
import { cn } from "@/lib/utils";

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
  eventName?: string;
  eventDetails?: AppEvent;
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
  eventName,
  eventDetails,
}: {
  title: string;
  children?: React.ReactNode;
  onCancel?: () => void;
  onConfirm?: (data: { commissionRate?: number; adminRemark: string }) => void;
  isLoading?: boolean;
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string;
  eventName?: string;
  eventDetails?: AppEvent;
}) {
  // Schema Factory Pattern: Create schema with translated messages
  const schema = useMemo(() => createEventApprovalSchema(t), [t]);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [pendingData, setPendingData] = React.useState<ApprovalFormData | null>(
    null,
  );

  const form = useForm<ApprovalFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      commissionRate: "10",
      adminRemark: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    form.reset({ commissionRate: "10", adminRemark: "" });
  }, [form]);

  const onSubmit = (data: ApprovalFormData) => {
    setPendingData(data);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (pendingData) {
      onConfirm?.({
        commissionRate: parseFloat(pendingData.commissionRate),
        adminRemark: pendingData.adminRemark || "",
      });
      setShowConfirm(false);
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={(open) => !open && onCancel?.()}>
        <DialogContent
          className={cn(
            "rounded-3xl shadow-2xl border-none bg-white/95 backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2 duration-300",
            eventDetails ? "sm:max-w-4xl" : "max-w-md",
          )}
          showCloseButton={true}
        >
          {/* <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader> */}

          <div
            className={`grid ${
              eventDetails ? "md:grid-cols-2 gap-6" : "grid-cols-1"
            }`}
          >
            {/* Left Column - Event Details Card */}
            {eventDetails && <EventDetailCard eventDetails={eventDetails} />}

            {/* Right Column - Approval Form */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 h-full flex flex-col justify-between"
              >
                {children}
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                    {title}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="commissionRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          {t("dashboard.modal.commissionRate")}
                          <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder={t(
                              "dashboard.modal.commissionRatePlaceholder",
                              "Enter commission rate (in %)",
                            )}
                            {...field}
                            className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                          />
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
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          {t("dashboard.modal.additionalNotes")}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            placeholder={t(
                              "dashboard.modal.additionalNotesPlaceholder",
                            )}
                            className="resize-none bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                            maxLength={500}
                            {...field}
                          />
                        </FormControl>
                        <div className="flex justify-between items-center min-h-[20px]">
                          <TranslatedFormMessage t={t} className="mt-0" />
                          <div className="text-xs text-muted-foreground ml-auto">
                            {field.value?.length || 0}/500{" "}
                            {t("common.characters")}
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 mt-auto">
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
                    className="h-11 px-8 active:scale-95"
                  >
                    {isLoading
                      ? t("common.loading")
                      : t("dashboard.modal.confirmApprove")}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="data-[state=open]:slide-in-from-bottom-2 duration-300">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">
              {t(
                "dashboard.modal.confirmEventApproval",
                "Confirm Event Approval",
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 text-base">
              {eventName && (
                <div className="mb-2 font-semibold text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {t("dashboard.modal.event", "Event")}: {eventName}
                </div>
              )}
              {t(
                "dashboard.modal.confirmEventApprovalDesc",
                "Are you sure you want to approve this event with a commission rate of {rate}%? This action cannot be undone immediately.",
                {
                  rate: pendingData?.commissionRate || "0",
                },
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel
              onClick={() => setShowConfirm(false)}
              className="h-11 px-6 border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {t("common.cancel", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="h-11 px-8 active:scale-95"
            >
              {t("common.confirm", "Confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
    <Dialog open={true} onOpenChange={(open) => !open && onCancel?.()}>
      <DialogContent className="max-w-md rounded-3xl shadow-2xl border-none bg-white/95 backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2 duration-300">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {children}

            <FormField
              control={form.control}
              name="adminRemark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    {remarkLabel || t("dashboard.modal.reasonForRejection")}
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder={
                        placeholder || t("dashboard.modal.rejectionPlaceholder")
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
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isLoading}
                className="h-11 px-8 flex-1 sm:flex-none active:scale-95"
              >
                {isLoading
                  ? t("common.loading")
                  : confirmText || t("dashboard.modal.confirmReject")}
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
  showCommissionInput = false,
  isLoading = false,
  remarkLabel,
  placeholder,
  confirmText,
  eventName,
  eventDetails,
}: PopupModalProps & {
  remarkLabel?: string;
  placeholder?: string;
  confirmText?: string;
  eventName?: string;
  eventDetails?: AppEvent;
}) {
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
        eventName={eventName}
        eventDetails={eventDetails}
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
