"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SpinnerIcon } from "@phosphor-icons/react";
import { DialogFooter } from "@/components/ui/dialog";
import { Modal } from "@/components/ui/modal";
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
import {
  TooltipProvider,
  TooltipContent,
  Tooltip,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { CalendarIcon, InfoIcon } from "@phosphor-icons/react";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/ui/field";

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

  const maxAmount = billData?.remaining_amount;
  const maxAmountLength = maxAmount?.toString().length;

  const schema = addPaymentToBillSchema(t, maxAmount as number);

  // Inside your component:
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToFirstError = useCallback((errors: Record<string, unknown>) => {
    // Respect the order fields appear in the form
    const fieldOrder = [
      "organizer_id",
      "event_id",
      "payment_method",
      "amount",
      "payment_date",
      "notes",
      "screenshot",
    ];

    const firstErrorKey = fieldOrder.find((key) => key in errors);
    if (!firstErrorKey || !scrollContainerRef.current) return;

    const target = scrollContainerRef.current.querySelector<HTMLElement>(
      `[data-field="${firstErrorKey}"]`,
    );

    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "center" });

    // Try to focus the first focusable element inside it
    const focusable = target.querySelector<HTMLElement>(
      "input, button, textarea, select, [tabindex]",
    );
    focusable?.focus({ preventScroll: true });
  }, []);

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
        amount: billData.remaining_amount ?? 0,
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
    { label: "bank_transfer", value: "bank_transfer" },
    { label: "cash", value: "cash" },
    { label: "cheque", value: "cheque" },
    { label: "mobile_payment", value: "mobile_payment" },
    { label: "stripe", value: "stripe" },
    { label: "other", value: "other" },
  ];

  const onSubmit = (data: AddPaymentToBillFormValues) => {
    createMutation.mutate(data);
  };

  const isPending = createMutation.isPending;
  const isSubmitting = form.formState.isSubmitting || isPending;
  // const isSubmitting = true;

  const handleOpenChange = (open: boolean) => {
    if (!open && isPending) return;
    form.reset();
    handleRemoveImage();
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
      title={t(
        "billings.addPaymentToBill.addPaymentToBill",
        "Add Payment to Bill",
      )}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            // This callback fires when validation fails
            scrollToFirstError(errors);
          })}
          className="flex flex-col flex-1 overflow-hidden h-full"
        >
          {isSubmitting && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
              <SpinnerIcon className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            {/* Organizer */}
            <FormField
              control={form.control}
              name="organizer_id"
              render={({ field }) => (
                <FormItem data-field="organizer_id">
                  <FormLabel
                    required
                    className="text-sm font-semibold text-gray-700"
                  >
                    {t("billings.addPaymentToBill.organizer", "Organizer")}
                  </FormLabel>
                  <FormControl>
                    <AsyncCombobox
                      queryKey={["filter", "organizers"]}
                      value={field.value ?? ""}
                      onValueChange={(val) => field.onChange(val)}
                      fetchOptions={fetchOrganizers}
                      placeholder={t("billings.filter.selectOrganizer")}
                      searchPlaceholder={t("billings.filter.searchOrganizer")}
                      emptyText={t("billings.filter.noOrganizerFound")}
                      defaultOption={defaultOrganizerOption}
                      className="w-full text-sm h-9"
                      debounceMs={300}
                      disabled={!!billData || isSubmitting}
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
                <FormItem data-field="event_id">
                  <FormLabel
                    required
                    className="text-sm font-semibold text-gray-700"
                  >
                    {t("billings.addPaymentToBill.event", "Event")}
                  </FormLabel>
                  <FormControl>
                    <AsyncCombobox
                      key={organizer_id}
                      queryKey={["filter", "events", organizer_id]}
                      value={field.value ?? ""}
                      onValueChange={(val) => field.onChange(val)}
                      fetchOptions={fetchEvents}
                      placeholder={t("billings.billUpdate.event", "Event")}
                      searchPlaceholder={t("billings.addBillModal.searchEvent")}
                      emptyText={t("billings.addBillModal.noEventFound")}
                      defaultOption={defaultEventOption}
                      className="w-full text-sm h-9"
                      debounceMs={300}
                      disabled={!!billData || isSubmitting}
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
                <FormItem data-field="payment_method">
                  <FormLabel
                    required
                    className="text-sm font-semibold text-gray-700"
                  >
                    {t(
                      "billings.addPaymentToBill.paymentMethod",
                      "Payment Method",
                    )}
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="w-full text-sm h-9 justify-between px-3 bg-white">
                        <SelectValue
                          placeholder={t(
                            "billings.addPaymentToBill.selectPaymentMethod",
                            "Select payment method",
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {t("billings.method." + method.label)}
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
                <FormItem data-field="amount">
                  <FormLabel
                    required
                    className="text-sm font-semibold text-gray-700"
                  >
                    {t("billings.addPaymentToBill.amount", "Amount")}

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="text-yellow-800 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {t(
                              "billings.addPaymentToBill.remainingAmountInfo",
                              "The amount displayed is the remaining balance amount.",
                            )}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>

                  <div className="relative group">
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={
                          `${billData?.remaining_amount}`
                            ? `${billData?.remaining_amount}`
                            : "e.g Rs. 100"
                        }
                        max={
                          `${billData?.remaining_amount}`
                            ? `${billData?.remaining_amount}`
                            : 1000000
                        }
                        inputMode="decimal"
                        step="0.01"
                        {...field}
                        onKeyDown={(e) => {
                          // Allow decimal point for price
                          if (
                            e.key === "e" ||
                            e.key === "E" ||
                            e.key === "-" ||
                            e.key === "+"
                          ) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.length > (maxAmountLength ?? 7)) {
                            return;
                          }
                          if (val === "") {
                            field.onChange("");
                            return;
                          }
                          // Allow trailing decimal point (e.g., "100.")
                          if (val.endsWith(".")) {
                            field.onChange(val);
                            return;
                          }
                          // Allow only one decimal point
                          const parts = val.split(".");
                          if (parts.length > 2) {
                            return;
                          }
                          // Allow only 2 decimal places
                          if (parts[1] && parts[1].length > 2) {
                            return;
                          }
                          const num = Number(val);
                          if (isNaN(num)) return;
                          field.onChange(num);
                        }}
                        onWheel={(e) => e.currentTarget.blur()}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <div className="flex justify-between items-center absolute -bottom-6 left-0 w-full px-1">
                      <p> </p>
                      <p className="text-xs font-normal text-left text-muted-foreground">
                        {t("common.max", "Max")}{" "}
                        {`${billData?.remaining_amount}`
                          ? `${billData?.remaining_amount}`
                          : "e.g Rs. 100"}
                      </p>
                    </div>
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
                <FormItem data-field="payment_date">
                  <FormLabel
                    required
                    className="text-sm font-semibold text-gray-700"
                  >
                    {t("billings.addPaymentToBill.paymentDate", "Payment Date")}
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
                          disabled={isSubmitting}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "LLL dd, y")
                          ) : (
                            <span>
                              {t(
                                "billings.addPaymentToBill.pickDate",
                                "Pick a date",
                              )}
                            </span>
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
            {/* <FormField
              control={form.control}
              name="payment_ref"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    {t(
                      "billings.addPaymentToBill.paymentReference",
                      "Payment Reference",
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder={t(
                        "billings.addPaymentToBill.enterPaymentReference",
                        "Enter payment reference",
                      )}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-full text-sm h-9"
                      maxLength={100}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center">
                    <p>
                      {" "}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </p>
                    <p className="text-xs font-normal text-left text-muted-foreground">
                      {field.value?.length || 0} /100 {t(
                            "common.characters",
                            "characters",
                          )}
                    </p>
                  </div>
                  <TranslatedFormMessage t={t} />
                </FormItem>
              )}
            /> */}

            {/* Notes  */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field, fieldState }) => (
                <FormItem data-field="notes">
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    {t("billings.addPaymentToBill.notes", "Notes")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t(
                        "billings.addPaymentToBill.enterNotes",
                        "Enter notes",
                      )}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      rows={3}
                      maxLength={200}
                      disabled={isSubmitting}
                      className="w-full min-h-[80px] !bg-white"
                    />
                  </FormControl>
                  <div className="flex justify-between items-center">
                    <p>
                      {" "}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </p>
                    <p className="text-xs font-normal text-left text-muted-foreground">
                      {field.value?.length || 0} /200{" "}
                      {t("common.characters", "characters")}
                    </p>
                  </div>
                  <TranslatedFormMessage t={t} />
                </FormItem>
              )}
            />

            {/* Image Uploader  */}
            <FormField
              control={form.control}
              name="screenshot"
              render={({ field }) => (
                <FormItem data-field="screenshot">
                  {/* <FormLabel className="text-sm font-semibold text-gray-700">
                    {t("billings.addPaymentToBill.screenshot", "Screenshot")}
                  </FormLabel> */}
                  <FormControl>
                    <ImageUploader
                      label={t(
                        "billings.addPaymentToBill.screenshot",
                        "Upload Screenshot",
                      )}
                      className="w-full h-50"
                      helperText={t(
                        "imageUploader.uploadScreenshot",
                        "Upload screenshot image or drag & drop",
                      )}
                      helperTextSize={t(
                        "imageUploader.recommendedSize",
                        "Recommended: PNG/JPG file of 1920x1200px with size up to 5MB",
                      )}
                      value={imageRemoved ? "" : imagePreview || ""}
                      onChange={(file) => {
                        if (file) handleImageChange(file);
                      }}
                      onRemove={handleImageRemove}
                      error={imageError}
                      browseButtonText={t(
                        "imageUploader.browseFile",
                        "Browse File",
                      )}
                      required
                    />
                  </FormControl>
                  <TranslatedFormMessage t={t} />
                </FormItem>
              )}
            />

            {/* Screenshot Upload */}

            {/* <ImageUploader
              label={t(
                "billings.addPaymentToBill.screenshot",
                "Upload Screenshot",
              )}
              className="w-full h-50"
              helperText={t(
                "imageUploader.uploadScreenshot",
                "Upload screenshot image or drag & drop",
              )}
              helperTextSize={t(
                "imageUploader.recommendedSize",
                "Recommended: PNG/JPG file of 1920x1200px with size up to 5MB",
              )}
              value={imageRemoved ? "" : imagePreview || ""}
              onChange={(file) => {
                if (file) handleImageChange(file);
              }}
              onRemove={handleImageRemove}
              error={imageError}
              browseButtonText={t("imageUploader.browseFile", "Browse File")}
              required
            /> */}
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-background shrink-0 gap-2 sm:justify-end">
            <Button
              variant="outline"
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              {t("common.cancelButton", "Cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending && (
                <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("billings.addPayment", "Add Payment")}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </Modal>
  );
}
