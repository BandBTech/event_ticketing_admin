"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrganizerService, Organizer } from "@/lib/organizerService";
import { format } from "date-fns";
import {
  DotsThreeVertical as DotsThreeVerticalIcon,
  ArrowSquareOut as ArrowSquareOutIcon,
  PencilSimple as PencilSimpleIcon,
  Trash as TrashIcon,
  UserCheck as UserCheckIcon,
  CalendarBlank as CalendarBlankIcon,
  Phone as PhoneIcon,
  Envelope as EnvelopeIcon,
  ShieldCheck as ShieldCheckIcon,
  Buildings as BuildingsIcon,
  CheckCircle as CheckCircleIcon,
  Clock as ClockIcon,
  XCircle as XCircleIcon,
  UserMinus as UserMinusIcon,
  Check as CheckIcon,
  X as XIcon,
  Warning as WarningIcon,
  ArrowLeft as ArrowLeftIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TranslatedFormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createApprovalSchema, ApprovalFormValues } from "@/lib/validation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPhoneNumber } from "@/lib/utils";

type StatusAction = "approve" | "reject" | "activate" | "deactivate";

function getInitials(firstName: string, lastName: string) {
  const first = firstName?.[0] || "";
  const last = lastName?.[0] || "";
  return (first + last).toUpperCase();
}

function getStatusConfig(status: string, t: any) {
  switch (status?.toLowerCase()) {
    case "approved":
      return {
        color: "bg-emerald-100 text-emerald-700 border-emerald-200",
        bgColor: "bg-emerald-50",
        icon: CheckCircleIcon,
        label: t("organizer.management.status.approved", "Approved"),
        variant: "secondary" as const,
      };
    case "pending":
      return {
        color: "bg-amber-100 text-amber-700 border-amber-200",
        bgColor: "bg-amber-50",
        icon: ClockIcon,
        label: t("organizer.management.status.pending", "Pending"),
        variant: "secondary" as const,
      };
    case "rejected":
      return {
        color: "bg-red-100 text-red-700 border-red-200",
        bgColor: "bg-red-50",
        icon: XCircleIcon,
        label: t("organizer.management.status.rejected", "Rejected"),
        variant: "destructive" as const,
      };
    case "inactive":
      return {
        color: "bg-gray-100 text-gray-700 border-gray-200",
        bgColor: "bg-gray-50",
        icon: UserMinusIcon,
        label: t("organizer.management.status.inactive", "Inactive"),
        variant: "secondary" as const,
      };
    default:
      return {
        color: "bg-gray-100 text-gray-700 border-gray-200",
        bgColor: "bg-gray-50",
        icon: ClockIcon,
        label: status || t("organizer.management.status.unknown", "Unknown"),
        variant: "secondary" as const,
      };
  }
}

function getAccountStatusConfig(status: string, t: any) {
  switch (status?.toLowerCase()) {
    case "active":
      return {
        color: "bg-emerald-500 text-white",
        dotColor: "bg-emerald-400",
        label: t("organizer.management.status.active", "Active"),
      };
    case "inactive":
      return {
        color: "bg-gray-500 text-white",
        dotColor: "bg-gray-400",
        label: t("organizer.management.status.inactive", "Inactive"),
      };
    case "suspended":
      return {
        color: "bg-red-500 text-white",
        dotColor: "bg-red-400",
        label: t("organizer.management.status.suspended", "Suspended"),
      };
    default:
      return {
        color: "bg-gray-500 text-white",
        dotColor: "bg-gray-400",
        label: t("organizer.management.status.unknown", "Unknown"),
      };
  }
}

// Skeleton Component
function DetailPageSkeleton({ t }: { t: any }) {
  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Skeleton className="h-10 w-32 mb-6" />
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <Skeleton className="h-32 w-full rounded-none" />
          <div className="p-6 pt-0 relative">
            <Skeleton className="absolute -top-12 left-6 w-24 h-24 rounded-xl border-4 border-white" />
            <div className="pt-14 flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-64" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Status Modal Component
function StatusModal({
  isOpen,
  onClose,
  organizer,
  action,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  organizer: Organizer;
  action: StatusAction;
  t: any;
}) {
  const queryClient = useQueryClient();
  const approvalSchema = useMemo(() => createApprovalSchema(t, action), [action, t]);

  const form = useForm<ApprovalFormValues>({
    resolver: zodResolver(approvalSchema),
    defaultValues: {
      remark: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({ remark: "" });
    }
  }, [isOpen, action, form]);

  const statusMutation = useMutation({
    mutationFn: (data: ApprovalFormValues) => {
      let targetStatus = "approved";
      if (action === "reject") targetStatus = "rejected";
      if (action === "deactivate") targetStatus = "inactive";
      if (action === "activate") targetStatus = "approved";

      return OrganizerService.approveOrganizer({
        organizerId: organizer.id,
        admin_remark: data.remark || "",
        status: targetStatus,
      });
    },
    onSuccess: () => {
      const successMessage = t(`organizer.management.messages.${action}Success`, `Organizer ${action}d successfully`);
      toast.success(successMessage);
      queryClient.invalidateQueries({ queryKey: queryKeys.organizers.list });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizers.detail(organizer.id) });
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || t("organizer.management.messages.updateError", "Failed to update status"));
    },
  });

  const onSubmit = (data: ApprovalFormValues) => {
    statusMutation.mutate(data);
  };

  const getModalConfig = () => {
    switch (action) {
      case "approve":
        return {
          title: t("organizer.management.modals.approveTitle", "Approve Organizer"),
          description: t("organizer.management.modals.approveDesc", "Are you sure you want to approve {name}?", { name: `${organizer.first_name} ${organizer.last_name}` }).replace("{name}", `${organizer.first_name} ${organizer.last_name}`),
          buttonText: t("organizer.management.actions.approve", "Approve"),
          buttonClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
          icon: CheckIcon,
          iconClass: "bg-emerald-100 text-emerald-600",
        };
      case "reject":
        return {
          title: t("organizer.management.modals.rejectTitle", "Reject Organizer"),
          description: t("organizer.management.modals.rejectDesc", "Are you sure you want to reject {name}?", { name: `${organizer.first_name} ${organizer.last_name}` }).replace("{name}", `${organizer.first_name} ${organizer.last_name}`),
          buttonText: t("organizer.management.actions.reject", "Reject"),
          buttonClass: "bg-red-600 hover:bg-red-700 text-white",
          icon: XIcon,
          iconClass: "bg-red-100 text-red-600",
        };
      case "deactivate":
        return {
          title: t("organizer.management.modals.deactivateTitle", "Deactivate Organizer"),
          description: t("organizer.management.modals.deactivateDesc", "Are you sure you want to deactivate {name}'s account?", { name: `${organizer.first_name} ${organizer.last_name}` }).replace("{name}", `${organizer.first_name} ${organizer.last_name}`),
          buttonText: t("organizer.management.actions.deactivate", "Deactivate"),
          buttonClass: "bg-gray-600 hover:bg-gray-700 text-white",
          icon: UserMinusIcon,
          iconClass: "bg-gray-100 text-gray-600",
        };
      case "activate":
        return {
          title: t("organizer.management.modals.activateTitle", "Activate Organizer"),
          description: t("organizer.management.modals.activateDesc", "Are you sure you want to activate {name}'s account?", { name: `${organizer.first_name} ${organizer.last_name}` }).replace("{name}", `${organizer.first_name} ${organizer.last_name}`),
          buttonText: t("organizer.management.actions.activate", "Activate"),
          buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
          icon: CheckCircleIcon,
          iconClass: "bg-blue-100 text-blue-600",
        };
    }
  };

  const config = getModalConfig();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${config.iconClass}`}>
            <config.icon weight="duotone" className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center">{config.title}</DialogTitle>
          <DialogDescription className="text-center">{config.description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="remark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("organizer.management.modals.remarkLabel", "Admin Remark")}
                    {(action === "reject" || action === "deactivate") && <span className="text-red-500">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        action === "reject" || action === "deactivate"
                          ? t("organizer.management.modals.rejectPlaceholder", "Please provide a reason...")
                          : t("organizer.management.modals.remarkPlaceholder", "Add a note...")
                      }
                      className="resize-none"
                      maxLength={500}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center -mt-1 min-h-[20px]">
                    <TranslatedFormMessage t={t} className="mt-0" />
                    <div className="text-xs text-muted-foreground ml-auto">
                      {field.value?.length || 0}/500 {t("common.characters", "characters")}
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={statusMutation.isPending}
                className="w-full sm:w-auto"
              >
                {t("common.cancelButton", "Cancel")}
              </Button>
              <Button
                type="submit"
                disabled={statusMutation.isPending}
                className={`w-full sm:w-auto ${config.buttonClass}`}
              >
                {statusMutation.isPending ? (
                  <>
                    <ClockIcon className="mr-2 h-4 w-4 animate-spin" />
                    {t("organizer.management.actions.processing", "Processing...")}
                  </>
                ) : (
                    config.buttonText
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function OrganizerDetailPage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const queryClient = useQueryClient();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState<StatusAction>("approve");

  const {
    data: organizer,
    isLoading,
    isError,
    error,
  } = useQuery<Organizer | null>({
    queryKey: queryKeys.organizers.detail(id!),
    queryFn: () => OrganizerService.getOrganizerById(id!),
    enabled: !!id,
  });

  // const deleteMutation = useMutation({
  //   mutationFn: () => OrganizerService.deleteOrganizer(id!),
  //   onSuccess: () => {
  //     toast.success(t("organizer.management.messages.deleteSuccess", "Organizer deleted successfully"));
  //     queryClient.invalidateQueries({ queryKey: queryKeys.organizers.list });
  //     router.push("/organisers");
  //   },
  //   onError: (error: Error) => {
  //     toast.error(error.message || t("organizer.management.messages.deleteError", "Failed to delete organizer"));
  //   },
  // });

  if (isLoading) {
    return <DetailPageSkeleton t={t} />;
  }

  if (isError || !organizer || !id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <WarningIcon weight="duotone" className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {!id ? t("organizer.management.messages.noId", "No Organizer Selected") : isError ? t("common.error", "Error") : t("organizer.management.messages.notFound", "Organizer Not Found")}
          </h2>
          <p className="text-gray-500 mb-6">
            {!id ? t("organizer.management.messages.selectFirst", "Please select an organizer from the list.") : (error as Error)?.message || t("organizer.management.messages.notExist", "The organizer you're looking for doesn't exist.")}
          </p>
          <button
            onClick={() => router.push("/organisers")}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("organizer.management.backToList", "Back to Organisers")}
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(organizer.organizer_status, t);
  const accountStatusConfig = getAccountStatusConfig(organizer.account_status, t);
  const StatusIcon = statusConfig.icon;

  const formattedCreatedDate = organizer.created_at
    ? format(new Date(organizer.created_at), "MMMM dd, yyyy 'at' hh:mm a")
    : "N/A";

  const formattedUpdatedDate = organizer.updated_at
    ? format(new Date(organizer.updated_at), "MMMM dd, yyyy 'at' hh:mm a")
    : "N/A";

  const isPending = organizer.organizer_status?.toLowerCase() === "pending";
  const isApproved = organizer.organizer_status?.toLowerCase() === "approved";
  const isRejected = organizer.organizer_status?.toLowerCase() === "rejected";
  const isInactive = organizer.organizer_status?.toLowerCase() === "inactive";

  const handleAction = (action: StatusAction) => {
    setStatusAction(action);
    setShowStatusModal(true);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <button
          onClick={() => router.push("/organisers")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeftIcon weight="duotone" className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">{t("organizer.management.backToList", "Back to Organisers")}</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="shrink-0">
                <div className="w-24 h-24 rounded-full bg-linear-to-br from-indigo-50 to-blue-50 text-indigo-600 flex items-center justify-center text-3xl font-bold border border-indigo-100 shadow-sm">
                  {getInitials(organizer.first_name, organizer.last_name)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {organizer.first_name} {organizer.last_name}
                      </h1>
                      {organizer.is_email_verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          <UserCheckIcon weight="duotone" className="w-3.5 h-3.5" />
                          {t("organizer.management.status.verified", "Verified")}
                        </span>
                      )}
                      <Badge className={accountStatusConfig.color}>
                        {accountStatusConfig.label}
                      </Badge>
                    </div>
                    <p className="text-gray-500 mb-4">{organizer.email}</p>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant={statusConfig.variant} className={`gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                        <StatusIcon weight="duotone" className="w-4 h-4" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 relative">
                    <div className="flex gap-2">
                      {isPending && (
                        <>
                          <Button onClick={() => handleAction("approve")} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {t("organizer.management.actions.approve", "Approve")}
                          </Button>
                          <Button onClick={() => handleAction("reject")} className="bg-red-600 hover:bg-red-700 text-white">
                            {t("organizer.management.actions.reject", "Reject")}
                          </Button>
                        </>
                      )}
                      {isApproved && (
                        <Button onClick={() => handleAction("deactivate")} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                          {t("organizer.management.actions.deactivate", "Deactivate")}
                        </Button>
                      )}
                      {(isRejected || isInactive) && (
                        <Button onClick={() => handleAction("activate")} className="bg-blue-600 hover:bg-blue-700 text-white">
                          {t("organizer.management.actions.activate", "Activate")}
                        </Button>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                        >
                          <DotsThreeVerticalIcon weight="duotone" className="w-5 h-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => router.push(`/events?organizer_id=${organizer.id}`)}
                          className="gap-2"
                        >
                          <ArrowSquareOutIcon weight="duotone" className="w-4 h-4" />
                          {t("organizer.management.actions.viewEvents", "View Events")}
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled className="gap-2">
                          <PencilSimpleIcon weight="duotone" className="w-4 h-4" />
                          {t("organizer.management.actions.editDetails", "Edit Details")}
                        </DropdownMenuItem>
                        {/* <DropdownMenuSeparator /> */}
                        {/* <DropdownMenuItem
                          onClick={() => {
                            if (confirm(t("organizer.management.modals.deleteConfirm", "Are you sure you want to delete this organizer?"))) {
                              deleteMutation.mutate();
                            }
                          }}
                          className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <TrashIcon weight="duotone" className="w-4 h-4" />
                          {t("organizer.management.actions.deleteOrganizer", "Delete Organizer")}
                        </DropdownMenuItem> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t("organizer.management.sections.contactInfo", "Contact Information")}
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <EnvelopeIcon weight="duotone" className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t("profile.email", "Email Address")}</p>
                    <p className="font-medium text-gray-900">{organizer.email}</p>
                  </div>
                </div>

                {organizer.phone && (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                      <PhoneIcon weight="duotone" className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t("profile.phone", "Phone Number")}</p>
                      <p className="font-medium text-gray-900">
                        {formatPhoneNumber(organizer.country_code, organizer.phone)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <CalendarBlankIcon weight="duotone" className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Joined</p>
                    <p className="font-medium text-gray-900">{formattedCreatedDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                    <CalendarBlankIcon weight="duotone" className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium text-gray-900">{formattedUpdatedDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {organizer.roles && organizer.roles.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t("organizer.management.sections.rolesPermissions", "Roles & Permissions")}
                </h2>
                <div className="space-y-4">
                  {organizer.roles.map((role) => (
                    <div key={role.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheckIcon weight="duotone" className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900 capitalize">{role.name}</h3>
                      </div>
                      {role.description && <p className="text-sm text-gray-600">{role.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t("organizer.management.sections.quickActions", "Quick Actions")}
              </h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-center gap-2" onClick={() => router.push(`/events?organizer_id=${organizer.id}`)}>
                  <BuildingsIcon weight="duotone" className="w-4 h-4" />
                  {t("organizer.management.actions.viewEvents", "View Events")}
                </Button>
                <Button variant="secondary" className="w-full justify-center gap-2">
                  <EnvelopeIcon weight="duotone" className="w-4 h-4" />
                  {t("organizer.management.actions.sendEmail", "Send Email")}
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t("organizer.management.sections.statusSummary", "Status Summary")}
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{t("organizer.management.status.organizer", "Organizer Status")}</span>
                  <Badge variant={statusConfig.variant} className={statusConfig.color}>
                    {statusConfig.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{t("organizer.management.status.account", "Account Status")}</span>
                  <Badge className={accountStatusConfig.color}>
                    {accountStatusConfig.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{t("organizer.management.status.verified", "Email Verified")}</span>
                  <Badge variant={organizer.is_email_verified ? "secondary" : "destructive"} className={organizer.is_email_verified ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                    {organizer.is_email_verified ? t("common.yes", "Yes") : t("common.no", "No")}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        organizer={organizer}
        action={statusAction}
        t={t}
      />
    </div>
  );
}
