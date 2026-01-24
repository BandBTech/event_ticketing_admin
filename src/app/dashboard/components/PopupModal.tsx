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
import { format } from "date-fns";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { CalendarBlankIcon, MapPinIcon } from "@phosphor-icons/react";

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
  t: (key: string, fallback?: string) => string;
    eventName?: string;
    eventDetails?: AppEvent;
}) {
  // Schema Factory Pattern: Create schema with translated messages
  const schema = useMemo(() => createEventApprovalSchema(t), [t]);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [pendingData, setPendingData] = React.useState<ApprovalFormData | null>(
    null
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
          className={eventDetails ? "max-w-4xl" : "max-w-md"}
          showCloseButton={true}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div
            className={`grid ${eventDetails ? "md:grid-cols-2 gap-6" : "grid-cols-1"
              }`}
          >
            {/* Left Column - Event Details Card */}
            {eventDetails && (
              <div className="space-y-4">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
                  <Image
                    src={eventDetails.banner_image || "/placeholder.jpg"}
                    alt={eventDetails.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-3">
                  <h3 className="font-bold text-lg text-gray-900 leading-tight">
                    {eventDetails.title}
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(eventDetails.category)
                      ? (eventDetails.category as string[])
                      : typeof eventDetails.category === "string"
                        ? (eventDetails.category as string).split(",")
                        : []
                    )
                      .map((tag) => tag.trim().replace(/^[{"]+|[}"]+$/g, ""))
                      .filter(Boolean)
                      .slice(0, 3) // Show limited tags
                      .map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5"
                        >
                          {tag}
                        </Badge>
                      ))}
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarBlankIcon
                        weight="duotone"
                        className="w-4 h-4 text-primary-500"
                      />
                      <span>
                        {format(new Date(eventDetails.start_date), "PPpp")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon
                        weight="duotone"
                        className="w-4 h-4 text-primary-500"
                      />
                      <span className="truncate">
                        {eventDetails.venue_name}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      {t("dashboard.modal.organizerId", "Organizer")}:
                      <span className="font-mono ml-1">
                        {eventDetails.organizer_id?.slice(0, 8)}...
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-600">
                        {eventDetails.price > 0
                          ? `${eventDetails.price} NPR`
                          : "Free"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Right Column - Approval Form */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 h-full flex flex-col justify-between"
              >
                {children}

                <div className="space-y-4">
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
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder={t(
                              "dashboard.modal.commissionRatePlaceholder",
                              "Enter commission rate (in %)"
                            )}
                            {...field}
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
                        <FormLabel>
                          {t("dashboard.modal.additionalNotes")}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            placeholder={t(
                              "dashboard.modal.additionalNotesPlaceholder"
                            )}
                            className="resize-none"
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
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-auto">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                  >
                    {t("common.cancelButton", "Cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dashboard.modal.confirmApproveTitle", "Confirm Approval")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {eventName && (
                <div className="mb-2 font-medium text-gray-900">
                  {t("dashboard.modal.event", "Event")}: {eventName}
                </div>
              )}
              {t(
                "dashboard.modal.confirmApproveDesc",
                "Are you sure you want to approve this event with a commission rate of {rate}%? This action cannot be undone immediately."
              ).replace("{rate}", pendingData?.commissionRate || "0")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirm(false)}>
              {t("common.cancel", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-green-600 hover:bg-green-700 text-white"
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
    <Dialog open={true} onOpenChange={(open) => !open && onCancel?.()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
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
                  <FormLabel>
                    {remarkLabel || t("dashboard.modal.reasonForRejection")}
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder={
                        placeholder || t("dashboard.modal.rejectionPlaceholder")
                      }
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
              <Button
                variant="outline"
                type="button"
                onClick={onCancel}
                disabled={isLoading}
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button type="submit" disabled={isLoading} variant="destructive">
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
