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
import { Button } from "@/components/ui/button";
import { BillingService } from "@/services/billingService";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { useLanguageStore } from "@/store/languageStore";
import { Bill, CreateBillPayload } from "@/types/billings";
import { createBillSchema, BillsFormValues } from "@/lib/validation";
import {
  AsyncCombobox,
  AsyncComboboxOption,
} from "@/components/ui/async-combobox";
import { adminService } from "@/services/adminService";

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

  const schema = createBillSchema(t);
  const defaultOrganizerOption = billData
    ? { value: billData.organizer.id, label: billData.organizer.name }
    : undefined;

  const defaultEventOption = billData
    ? { value: billData.event.id, label: billData.event.title }
    : undefined;

  const form = useForm<BillsFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      event_id: "",
      organizer_id: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (open && billData) {
      form.reset({
        event_id: billData.event.id,
        organizer_id: billData.organizer.id,
      });
    }
  }, [open, billData]);

  const createMutation = useMutation({
    mutationFn: (data: CreateBillPayload) =>
      BillingService.createBills({
        event_id: data.event_id,
        organizer_id: data.organizer_id,
      }),
    onSuccess: async () => {
      toast.success(t("", "Bill created successfully"));
      await queryClient.invalidateQueries({ queryKey: ["bills"] });
      onOpenChange(false);
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

  const onSubmit = (data: CreateBillPayload) => {
    createMutation.mutate(data);
  };

  const isPending = createMutation.isPending;

  const handleOpenChange = (open: boolean) => {
    if (!open && isPending) return;
    form.reset();
    onOpenChange(open);
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => handleOpenChange(false)}
      title={t("billings.addBillModal.addNewBill", "Add New Bill")}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden h-full"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <FormField
              control={form.control}
              name="organizer_id"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel
                    required
                    className="text-sm font-semibold text-gray-700"
                  >
                    {t("billings.addBillModal.organizer", "Organizer")}
                  </FormLabel>
                  <div className="relative group">
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
                        className="w-full text-sm h-9 ..."
                        debounceMs={300}
                      />
                    </FormControl>
                  </div>
                  <TranslatedFormMessage t={t} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="event_id"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel
                    required
                    className="text-sm font-semibold text-gray-700"
                  >
                    {t("billings.addBillModal.event", "Event")}
                  </FormLabel>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors group-focus-within:text-blue-600"></div>
                    <FormControl>
                      <AsyncCombobox
                        key={organizer_id}
                        queryKey={["filter", "events", organizer_id]}
                        value={field.value ?? ""}
                        onValueChange={(val) => field.onChange(val)}
                        fetchOptions={fetchEvents}
                        placeholder={t("billings.addBillModal.selectEvent")}
                        searchPlaceholder={t(
                          "billings.addBillModal.searchEvent",
                        )}
                        emptyText={t("billings.addBillModal.noEventFound")}
                        defaultOption={defaultEventOption}
                        className="w-full text-sm h-9 ..."
                        debounceMs={300}
                      />
                    </FormControl>
                  </div>
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
              {t("billings.addBillModal.createBill", "Create Bill")}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </Modal>
  );
}
