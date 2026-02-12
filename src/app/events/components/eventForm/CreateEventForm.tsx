"use client";

import React, { useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EventFormData, createEventSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver, SubmitHandler, useForm } from "react-hook-form";
import { EventService } from "@/services/eventServices";
import { Event, CreateEventData, UpdateEventRequest } from "@/types/event";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Form } from "@/components/ui/form";
import { queryKeys } from "@/lib/queryKeys";
import { useLanguageStore } from "@/store/languageStore";
import {
  getEventFormDefaults,
  getChangedFields,
  prepareCreateEventData,
} from "@/lib/eventFormUtils";

import { EventDetailsSection } from "./EventDetailsSection";
import { VenueScheduleSection } from "./VenueScheduleSection";
import { TicketingSection } from "./TicketingSection";
import { DiscountsPromoSection } from "./DiscountsPromoSection";
import { FormActionButtons } from "./FormActionButtons";
import { UnsavedChangesDialog } from "./UnsavedChangesDialog";

interface CreateEventFormProps {
  initialData?: Event;
  isEditing?: boolean;
}

export default function CreateEventForm({
  initialData,
  isEditing = false,
}: CreateEventFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  // Tracking for form initialization to avoid loops
  const lastInitializedEventId = React.useRef<string | null>(null);

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
    initialPreview: initialData?.banner_image || "",
  });

  // Create event schema (simple identity function for t since admin validation handles translation inside the schema function)
  const eventSchema = useMemo(() => createEventSchema(t), [t]);

  // Form setup
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema) as unknown as Resolver<EventFormData>,
    defaultValues: getEventFormDefaults(initialData, []), // Pass empty array for tierTemplates as admin doesn't use them
    mode: "onChange",
  });

  // Use isDirty from form state to track unsaved changes
  const { isDirty } = form.formState;

  // Check for unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    return isDirty || imageFile !== null || imageRemoved;
  }, [isDirty, imageFile, imageRemoved]);

  // Navigation guard hook
  const {
    showLeaveDialog,
    setShowLeaveDialog,
    confirmLeave,
    cancelLeave,
    handleNavigateAway,
  } = useNavigationGuard({
    hasUnsavedChanges,
    onBeforeLeave: () => {
      // Reset form to prevent popstate handler from blocking navigation
      form.reset(form.getValues());
    },
  });

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData && isEditing) {
      if (lastInitializedEventId.current === initialData.id) {
        return;
      }

      lastInitializedEventId.current = initialData.id;
      form.reset(getEventFormDefaults(initialData, []));

      // Update image preview
      if (initialData.banner_image && typeof initialData.banner_image === "string") {
        setImagePreview(initialData.banner_image);
      }
    }
  }, [initialData, isEditing, form, setImagePreview]);

  // Create/Update Event Mutation
  const saveEventMutation = useMutation({
    mutationFn: async (data: {
      eventData: CreateEventData | UpdateEventRequest;
      isUpdate: boolean;
      id?: string;
    }) => {
      if (data.isUpdate && data.id) {
        return EventService.updateEvent(data.id, data.eventData as UpdateEventRequest);
      } else {
        return EventService.createEvent(data.eventData as CreateEventData);
      }
    },
    onSuccess: async () => {
      // Simple invalidation strategy matching admin patterns
      await queryClient.invalidateQueries({ queryKey: queryKeys.events.list });

      if (isEditing && initialData?.id) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(initialData.id) });
      }

      toast.success(
        isEditing ? "Event Updated" : "Event Created",
        {
          description: `Event has been successfully ${isEditing ? "updated" : "created"}.`
        }
      );

      // Navigate away
      router.push("/events");
    },
    onError: (error: Error) => {
      console.error("Event save error:", error);
      toast.error("Error saving event", {
        description: error?.message || "Something went wrong"
      });
    }
  });

  // Form submission handler
  const onSubmit: SubmitHandler<EventFormData> = async (data) => {
    try {
      // Prepare tiers data
      const tiersData = data.tickets.map((ticket, index) => ({
        tier_template_id: "", // Admin doesn't use templates
        price: ticket.price || 0,
        quantity: ticket.quantity || 0,
        gst: isNaN(ticket.gst) ? 0 : ticket.gst || 0,
        sales_start: ticket.salesStart || undefined,
        sales_end: ticket.salesEnd || undefined,
        sort_order: index,
        tier_name: ticket.name // Important: pass the name directly since we don't have templates
      }));

      if (isEditing && initialData) {
        // Only send changed fields for update
        const changedFields = getChangedFields(data, tiersData, initialData, imageFile);

        // If changedFields is null, it means there are no changes or error
        if (!changedFields || Object.keys(changedFields).length === 0) {
          toast.info("No Changes", { description: "No changes detected to update." });
          return;
        }

        saveEventMutation.mutate({
          eventData: changedFields,
          isUpdate: true,
          id: initialData.id,
        });

      } else {
        // Create new event
        // Admin create uses FormData via prepareCreateEventData
        const eventData = prepareCreateEventData(data, tiersData, imageFile);

        saveEventMutation.mutate({ eventData, isUpdate: false });
      }
    } catch (error) {
      console.error("Error preparing event data:", error);
      toast.error("Preparation Error", { description: "Failed to prepare event data" });
    }
  };

  // Handlers for EventDetailsSection
  const handleDescriptionChange = useCallback(
    (html: string) => {
      form.setValue("description", html, { shouldDirty: true, shouldValidate: true });
    },
    [form]
  );

  const handleDescriptionClearError = useCallback(() => {
    form.clearErrors("description");
  }, [form]);

  const handleImageChange = useCallback(
    (file: File) => {
      validateAndProcessImage(file);
      form.setValue("image", "pending", { shouldDirty: true });
      form.clearErrors("image");
    },
    [validateAndProcessImage, form]
  );

  const handleImageRemove = useCallback(() => {
    handleRemoveImage();
    form.setValue("image", "", { shouldDirty: true, shouldValidate: true });
  }, [handleRemoveImage, form]);

  // Handler for creating new tier (placeholder as we simplified it)
  const handleCreateNewTier = useCallback((index: number) => {
    // No-op in simplified admin version
    console.log("Create tier template at index", index);
  }, []);

  // Handler for cancel button
  const handleCancel = useCallback(() => {
    handleNavigateAway(() => router.push("/events"));
  }, [handleNavigateAway, router]);

  return (
    <div className="p-6 space-y-6 container mx-auto max-w-7xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <EventDetailsSection
            control={form.control}
            imagePreview={imagePreview}
            imageError={imageError || form.formState.errors.image?.message || ""}
            imageRemoved={imageRemoved}
            initialBannerImage={typeof initialData?.banner_image === 'string' ? initialData.banner_image : undefined}
            onImageChange={handleImageChange}
            onImageRemove={handleImageRemove}
            descriptionError={form.formState.errors.description?.message}
            onDescriptionChange={handleDescriptionChange}
            onDescriptionClearError={handleDescriptionClearError}
            isEditing={isEditing}
            eventId={initialData?.id}
            initialDescription={initialData?.description || ""}
          />

          <VenueScheduleSection control={form.control} />

          <TicketingSection
            control={form.control}
            tierTemplates={[]} // Empty for admin
            onCreateNewTier={handleCreateNewTier}
          />

          <DiscountsPromoSection control={form.control} />

          <FormActionButtons
            isEditing={isEditing}
            isPending={saveEventMutation.isPending}
            onCancel={handleCancel}
          />
        </form>
      </Form>

      <UnsavedChangesDialog
        open={showLeaveDialog}
        onOpenChange={setShowLeaveDialog}
        onConfirm={confirmLeave}
        onCancel={cancelLeave}
      />
    </div>
  );
}
