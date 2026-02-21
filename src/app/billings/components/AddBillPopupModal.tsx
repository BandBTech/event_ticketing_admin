"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User as UserIcon,
  CalendarBlankIcon,
  CreditCardIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BillingService } from "@/services/billingService";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import { useLanguageStore } from "@/store/languageStore";
import { CreateBillPayload } from "@/types/billings";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ImageUploader } from "@/components/ui/image-uploader";
import { createBillSchema, BillsFormValues } from "@/lib/validation";

interface AddBillPopupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddBillPopupModal({
  open,
  onOpenChange,
}: AddBillPopupModalProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const queryClient = useQueryClient();

  // Image upload hook
  const {
    imageFile,
    imagePreview,
    imageError,
    imageRemoved,
    validateAndProcessImage,
    handleRemoveImage,
    setImagePreview,
  } = useImageUpload({
    initialPreview: "",
  });

  const schema = createBillSchema(t);

  const form = useForm<BillsFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      event_id: "",
      organizer_id: "",
      payment_method: "",
    },
    mode: "onChange",
  });

  const { errors } = form.formState;

  const createMutation = useMutation({
    mutationFn: (data: CreateBillPayload) =>
      BillingService.createBills({
        event_id: data.event_id,
        organizer_id: data.organizer_id,
        payment_method: data.payment_method,
        screenshot: imageFile ?? undefined,
      }),
    onSuccess: async () => {
      toast.success(t("", "Bill created successfully"));
      await queryClient.invalidateQueries({
        queryKey: queryKeys.organizers.list,
      });
      onOpenChange(false);
    },
  });

  const PAYMENT_METHODS = [
    { label: "Bank Transfer", value: "bank_transfer" },
    { label: "Cash", value: "cash" },
    { label: "Check", value: "check" },
    { label: "Mobile Payment", value: "mobile_payment" },
    { label: "Other", value: "other" },
  ];

  const onSubmit = (data: CreateBillPayload) => {
    createMutation.mutate(data);
  };

  const isPending = createMutation.isPending;

  // Prevent dialog dismissal (overlay/Escape) while mutation is in-flight
  const handleOpenChange = (open: boolean) => {
    if (!open && isPending) return;
    onOpenChange(open);
  };

  const handleImageChange = useCallback(
    (file: File) => {
      validateAndProcessImage(file);
      form.setValue("screenshot", file, { shouldDirty: true });
      form.clearErrors("screenshot");
    },
    [validateAndProcessImage, form],
  );

  const handleImageRemove = useCallback(() => {
    handleRemoveImage();
    form.setValue("screenshot", undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [handleRemoveImage, form]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px] overflow-y-scroll max-h-[90vh] shadow-2xl border-none bg-white/90 backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2 duration-300">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t("", "Add New Bill")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 pt-4"
          >
            <FormField
              control={form.control}
              name="event_id"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel
                    required
                    className="text-sm font-semibold text-gray-700"
                  >
                    {t("", "Event Id")}
                  </FormLabel>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors group-focus-within:text-blue-600">
                      <CalendarBlankIcon
                        weight="duotone"
                        size={22}
                        className="text-gray-400"
                      />
                    </div>
                    <FormControl>
                      <Input
                        placeholder={t("", "Enter event id")}
                        {...field}
                        className={cn(
                          "h-12 pl-12 pr-4 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-200",
                          fieldState.error &&
                            "border-destructive focus:ring-destructive/20",
                        )}
                      />
                    </FormControl>
                  </div>
                  <TranslatedFormMessage t={t} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organizer_id"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel
                    required
                    className="text-sm font-semibold text-gray-700"
                  >
                    {t("", "Organizer Id")}
                  </FormLabel>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors group-focus-within:text-blue-600">
                      <UserIcon
                        weight="duotone"
                        size={22}
                        className="text-gray-400"
                      />
                    </div>
                    <FormControl>
                      <Input
                        placeholder={t("", "Enter organizer id")}
                        {...field}
                        className={cn(
                          "h-12 pl-12 pr-4 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-200",
                          fieldState.error &&
                            "border-destructive focus:ring-destructive/20",
                        )}
                      />
                    </FormControl>
                  </div>
                  <TranslatedFormMessage t={t} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payment_method"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel
                    required
                    className="text-sm font-semibold text-gray-700"
                  >
                    {t("", "Payment Method")}
                  </FormLabel>

                  <div className="relative group">
                    {/* Left icon */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors group-focus-within:text-blue-600">
                      <CreditCardIcon
                        weight="duotone"
                        size={22}
                        className="text-gray-400"
                      />
                    </div>

                    <FormControl>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-12 w-full justify-between pl-12 pr-4 bg-gray-50/50 border-gray-200",
                              "hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-200",
                              "font-normal",
                              !field.value
                                ? "text-gray-400"
                                : "text-gray-700 bg-[#e9f0ff]",
                              fieldState.error &&
                                "border-destructive focus:ring-destructive/20",
                            )}
                          >
                            {PAYMENT_METHODS.find(
                              (m) => m.value === field.value,
                            )?.label || t("", "Select payment method")}
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="start"
                          className="w-[--radix-dropdown-menu-trigger-width] p-1.5"
                        >
                          {field.value && (
                            <>
                              <DropdownMenuItem
                                onClick={() => field.onChange("")}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-md cursor-pointer text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                              >
                                Clear selection
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {PAYMENT_METHODS.map((method) => {
                            const isSelected = field.value === method.value;
                            return (
                              <DropdownMenuItem
                                key={method.value}
                                onClick={() => field.onChange(method.value)}
                                className={cn(
                                  "flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-colors",
                                  isSelected
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "text-gray-700 hover:bg-gray-50",
                                )}
                              >
                                {method.label}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </FormControl>
                  </div>

                  <TranslatedFormMessage t={t} />
                </FormItem>
              )}
            />

            <ImageUploader
              label={t("", "Upload Screenshot")}
              className="w-full h-50"
              helperText={t("", "Upload screenshot image or drag & drop")}
              helperTextSize={t(
                "",
                "Recommended: PNG/JPG file of 1920x1200px with size up to 5MB",
              )}
              value={imageRemoved ? "" : imagePreview || ""}
              onChange={(file) => {
                if (file) handleImageChange(file);
              }}
              onRemove={handleImageRemove}
              error={imageError}
              browseButtonText={t("", "Browse File")}
            />

            <DialogFooter className="gap-3 pt-6">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="h-11 px-6 border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("", "Create Bill")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
