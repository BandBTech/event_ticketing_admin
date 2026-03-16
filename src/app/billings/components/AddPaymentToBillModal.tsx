"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SpinnerIcon } from "@phosphor-icons/react";
import { DialogFooter } from "@/components/ui/dialog";
import { Modal } from "@/components/ui/modal";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TranslatedFormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BillingService } from "@/services/billingService";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import { useLanguageStore } from "@/store/languageStore";
import { Bill } from "@/types/billings";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  addPaymentToBillSchema,
  AddPaymentToBillFormValues,
} from "@/lib/validation";
import {
  AsyncCombobox,
  AsyncComboboxOption,
} from "@/components/ui/async-combobox";
import { adminService } from "@/services/adminService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddPaymentToBillPayload } from "@/types/billings";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "@phosphor-icons/react";

interface AddBillPopupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billData: Bill | null;
}

export default function AddBillPopupModal({
  open,
  onOpenChange,
  billData,
}: AddBillPopupModalProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const queryClient = useQueryClient();

  const {
    imageFile,
    imagePreview,
    imageError,
    imageRemoved,
    validateAndProcessImage,
    handleRemoveImage,
  } = useImageUpload({
    initialPreview: "",
  });

  const schema = addPaymentToBillSchema(t);

  const defaultOrganizerOption = billData
    ? { value: billData.organizer.id, label: billData.organizer.name }
    : undefined;

  const defaultEventOption = billData
    ? { value: billData.event.id, label: billData.event.title }
    : undefined;

  const form = useForm<AddPaymentToBillFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      event_id: "",
      organizer_id: "",
      payment_method: "",
      amount: 0,
      payment_ref: "",
      notes: "",
      payment_date: undefined,
      screenshot: undefined,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (open && billData) {
      form.reset({
        event_id: billData.event.id,
        organizer_id: billData.organizer.id,
        payment_method: "",
        amount: 0,
        payment_ref: "",
        notes: "",
        payment_date: undefined,
      });
    }
  }, [open, billData]);

  const createMutation = useMutation({
    mutationFn: (data: AddPaymentToBillPayload) =>
      BillingService.addPaymentToBills({
        bill_id: billData?.id || "",
        payment_method: data.payment_method,
        amount: data.amount,
        screenshot: imageFile || undefined,
        payment_ref: data.payment_ref,
        notes: data.notes,
        payment_date: data.payment_date,
      }),
    onSuccess: async () => {
      toast.success(t("", "Payment added to bill successfully"));
      // FIX: invalidate bills queries, not organizers
      await queryClient.invalidateQueries({
        queryKey: queryKeys.bills?.list ?? ["bills"],
      });
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : t("", "Failed to add payment. Please try again."),
      );
    },
  });

  const organizer_id = form.watch("organizer_id");

  const fetchEvents = useCallback(
    async (search: string): Promise<AsyncComboboxOption[]> => {
      if (!organizer_id) return [];
      try {
        const response = await adminService.getEventsBYOrganizerID(
          organizer_id,
          "events",
        );
        if (!response || !Array.isArray(response)) return [];
        const filtered = search
          ? response.filter((event) =>
              event.title.toLowerCase().includes(search.toLowerCase()),
            )
          : response;
        return filtered.map((event) => ({
          value: event.id,
          label: event.title,
        }));
      } catch (error) {
        console.error("Failed to fetch events:", error);
        return [];
      }
    },
    [organizer_id],
  );

  const fetchOrganizers = useCallback(
    async (search: string): Promise<AsyncComboboxOption[]> => {
      try {
        const response = await adminService.getAllEntities("organizers");
        if (!response || !Array.isArray(response)) return [];
        const filtered = search
          ? response.filter((org) =>
              `${org.name}`.toLowerCase().includes(search.toLowerCase()),
            )
          : response;
        return filtered.map((org) => ({ value: org.id, label: `${org.name}` }));
      } catch (error) {
        console.error("Failed to fetch organizers:", error);
        return [];
      }
    },
    [],
  );

  const PAYMENT_METHODS = [
    { label: "Bank Transfer", value: "bank_transfer" },
    { label: "Cash", value: "cash" },
    { label: "Cheque", value: "cheque" },
    { label: "Mobile Payment", value: "mobile_payment" },
    { label: "Other", value: "other" },
  ];

  const onSubmit = (data: AddPaymentToBillFormValues) => {
    createMutation.mutate(data);
  };

  const isPending = createMutation.isPending;

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
    form.resetField("screenshot");
  }, [handleRemoveImage, form]);

  return (
    <Modal
      isOpen={open}
      onClose={() => handleOpenChange(false)}
      title={t("", "Add Payment to Bill")}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden h-full"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Organizer */}
            <FormField
              control={form.control}
              name="organizer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    required
                    className="text-sm font-semibold text-gray-700"
                  >
                    {t("", "Organizer")}
                  </FormLabel>
                  <FormControl>
                    <AsyncCombobox
                      queryKey={["filter", "organizers"]}
                      value={field.value ?? ""}
                      onValueChange={(val) => field.onChange(val)}
                      fetchOptions={fetchOrganizers}
                      placeholder="Select organizer"
                      searchPlaceholder="Search organizers..."
                      emptyText="No organizers found"
                      defaultOption={defaultOrganizerOption}
                      className="w-full text-sm h-9"
                      debounceMs={300}
                      disabled={!!billData}
                    />
                  </FormControl>
                  <TranslatedFormMessage t={t} />
                </FormItem>
              )}
            />

            {/* Event */}
            <FormField
              control={form.control}
              name="event_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    required
                    className="text-sm font-semibold text-gray-700"
                  >
                    {t("", "Event")}
                  </FormLabel>
                  <FormControl>
                    <AsyncCombobox
                      key={organizer_id}
                      queryKey={["filter", "events", organizer_id]}
                      value={field.value ?? ""}
                      onValueChange={(val) => field.onChange(val)}
                      fetchOptions={fetchEvents}
                      placeholder="Select event"
                      searchPlaceholder="Search event..."
                      emptyText="No events found"
                      defaultOption={defaultEventOption}
                      className="w-full text-sm h-9"
                      debounceMs={300}
                      disabled={!!billData}
                    />
                  </FormControl>
                  <TranslatedFormMessage t={t} />
                </FormItem>
              )}
            />

            {/* Payment Method */}
            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    required
                    className="text-sm font-semibold text-gray-700"
                  >
                    {t("", "Payment Method")}
                  </FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full text-sm h-9 justify-between px-3 bg-white">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <TranslatedFormMessage t={t} />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel
                    required
                    className="text-sm font-semibold text-gray-700"
                  >
                    {t("", "Amount")}
                  </FormLabel>

                  <div className="relative group">
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Enter amount"
                        value={form.watch("amount") ?? ""}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                        onKeyDown={(e) => {
                          if (["e", "E", "+", "-"].includes(e.key))
                            e.preventDefault();
                        }}
                        onWheel={(e) => e.currentTarget.blur()}
                        className="w-full text-sm h-9"
                      />
                    </FormControl>
                  </div>

                  <TranslatedFormMessage t={t} />
                </FormItem>
              )}
            />

            {/* Payment Date */}
            <FormField
              control={form.control}
              name="payment_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    {t("", "Payment Date")}
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-9",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "LLL dd, y")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ?? undefined}
                        onSelect={(date) => field.onChange(date)}
                        captionLayout="dropdown"
                        fromYear={2010}
                        toYear={new Date().getFullYear()}
                        toDate={new Date()}
                        disabled={{ after: new Date() }}
                      />
                    </PopoverContent>
                  </Popover>
                  <TranslatedFormMessage t={t} />
                </FormItem>
              )}
            />

            {/* Payment Reference  */}
            <FormField
              control={form.control}
              name="payment_ref"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    {t("", "Payment Reference")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter payment reference"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-full text-sm h-9"
                    />
                  </FormControl>
                  <TranslatedFormMessage t={t} />
                </FormItem>
              )}
            />

            {/* Notes  */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    {t("", "Notes")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter notes"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-full text-sm h-9"
                    />
                  </FormControl>
                  <TranslatedFormMessage t={t} />
                </FormItem>
              )}
            />

            {/* Screenshot Upload */}

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
              required
            />
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-background shrink-0 gap-2 sm:justify-end">
            <Button
              variant="outline"
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending && (
                <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("", "Add Payment")}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </Modal>
  );
}
