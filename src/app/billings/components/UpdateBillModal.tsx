"use client";

import { useState, useCallback, useEffect } from "react";
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
import { BillingService } from "@/services/billingService";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import { useLanguageStore } from "@/store/languageStore";
import { Bill } from "@/types/billings";
import { updateBillSchema, UpdateBillFormValues } from "@/lib/validation";
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
import { UpdateBillPayload } from "@/types/billings";

interface AddBillPopupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billData: Bill | null;
}

export default function UpdateBillModal({
  open,
  onOpenChange,
  billData,
}: AddBillPopupModalProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const queryClient = useQueryClient();

  const BILL_STATUS = [
    { label: "Pending", value: "pending" },
    { label: "Partially Paid", value: "partially_paid" },
    { label: "Paid", value: "paid" },
    { label: "Overdue", value: "overdue" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const schema = updateBillSchema(t);

  const defaultOrganizerOption = billData
    ? { value: billData.organizer.id, label: billData.organizer.name }
    : undefined;

  const defaultEventOption = billData
    ? { value: billData.event.id, label: billData.event.title }
    : undefined;

  const form = useForm<UpdateBillFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      event_id: "",
      organizer_id: "",
      amount: 0,
      payment_ref: "",
      notes: "",
      status: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (open && billData) {
      form.reset({
        event_id: billData.event.id,
        organizer_id: billData.organizer.id,
        amount: 0,
        payment_ref: billData.payment_ref || "",
        notes: billData.notes || "",
        status: billData.status || "",
      });
    }
  }, [open, billData]);

  const createMutation = useMutation({
    mutationFn: (data: UpdateBillPayload) =>
      BillingService.updateBill({
        bill_id: billData?.id || "",
        amount: data.amount,
        payment_ref: data.payment_ref,
        notes: data.notes,
        status: data.status,
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
          : t("", "Failed to update bill. Please try again."),
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

  const onSubmit = (data: UpdateBillFormValues) => {
    createMutation.mutate(data);
  };

  const isPending = createMutation.isPending;

  const handleOpenChange = (open: boolean) => {
    if (!open && isPending) return;
    onOpenChange(open);
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => handleOpenChange(false)}
      title={t("billings.billUpdate.updateBill", "Update Bill")}
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
                    {t("billings.billUpdate.organizer", "Organizer")}
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
                    {t("billings.billUpdate.event", "Event")}
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
                      disabled={!!billData}
                    />
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
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    {t("billings.billUpdate.amount", "Amount")}
                  </FormLabel>

                  <div className="relative group">
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder={t(
                          "billings.billUpdate.enterAmount",
                          "Enter amount",
                        )}
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

            {/* Payment Reference  */}
            <FormField
              control={form.control}
              name="payment_ref"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    {t(
                      "billings.billUpdate.paymentReference",
                      "Payment Reference",
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder={t(
                        "billings.billUpdate.enterPaymentReference",
                        "Enter payment reference",
                      )}
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
                    {t("billings.billUpdate.notes", "Notes")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder={t(
                        "billings.billUpdate.enterNotes",
                        "Enter notes",
                      )}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-full text-sm h-9"
                    />
                  </FormControl>
                  <TranslatedFormMessage t={t} />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    required
                    className="text-sm font-semibold text-gray-700"
                  >
                    {t("billings.billUpdate.status", "Status")}
                  </FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full text-sm h-9 justify-between px-3 bg-white">
                        <SelectValue
                          placeholder={t(
                            "billings.billUpdate.selectStatus",
                            "Select status",
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {BILL_STATUS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {t(`billings.status.${method.value}`, method.label)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <TranslatedFormMessage t={t} />
                </FormItem>
              )}
            />
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
              {t("billings.billUpdate.updateBill", "Update Bill")}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </Modal>
  );
}
