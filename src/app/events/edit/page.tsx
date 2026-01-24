"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { EventService } from "@/lib/eventServices";
import { queryKeys } from "@/lib/queryKeys";
import CreateEventForm from "../components/eventForm/CreateEventForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditEventPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id");

  const { data: event, isLoading, error } = useQuery({
    queryKey: queryKeys.events.detail(eventId || ""),
    queryFn: () => EventService.getEventById(eventId!),
    enabled: !!eventId,
  });

  if (!eventId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Event ID Missing
          </h1>
          <p className="text-gray-500">
            Please provide an event ID in the URL (e.g., /events/edit?id=...)
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pb-12">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 flex items-center">
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Event Not Found
          </h1>
          <p className="text-gray-500">
            The event you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
        </div>
      </div>
    );
  }

  return <CreateEventForm initialData={event} isEditing={true} />;
}
