"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { EventService } from "@/lib/eventServices";
import { Event } from "@/types/event";
import { useEventStore } from "@/store/eventStore";
import { format } from "date-fns";
import {
  CalendarBlank,
  MapPin,
  Clock,
  Users,
  CurrencyDollar,
  ArrowLeft,
  CheckCircle,
  XCircle,
  WarningCircle,
  ShieldCheck,
  Tag,
  PauseCircle,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const config = (() => {
    switch (status?.toLowerCase()) {
      case "approved":
        return { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle };
      case "pending":
        return { color: "bg-amber-100 text-amber-700", icon: Clock };
      case "rejected":
        return { color: "bg-red-100 text-red-700", icon: XCircle };
      case "draft":
        return { color: "bg-gray-100 text-gray-700", icon: WarningCircle };
      case "live":
        return { color: "bg-green-100 text-green-700", icon: CheckCircle };
      case "cancelled":
        return { color: "bg-red-100 text-red-700", icon: XCircle };
      default:
        return { color: "bg-gray-100 text-gray-700", icon: WarningCircle };
    }
  })();

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
    >
      <Icon weight="duotone" className="w-4 h-4" />
      <span className="capitalize">{status}</span>
    </span>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
      <div className="p-2 bg-white rounded-lg shadow-sm text-gray-500">
        <Icon weight="duotone" className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className="mt-1 text-sm font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  );
}

export default function EventDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { selectedEvent } = useEventStore();
  const [event, setEvent] = useState<Event | null>(selectedEvent);

  // Fetch event if not in store or ID doesn't match
  const { data: fetchedEvent, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => EventService.getEventById(id!),
    enabled: !!id && (!event || event.id !== id),
  });

  useEffect(() => {
    if (fetchedEvent) {
      setEvent(fetchedEvent);
    }
  }, [fetchedEvent]);

  if (isLoading && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="p-4 bg-red-100 rounded-full text-red-600">
          <WarningCircle weight="duotone" className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Event Not Found</h2>
        <button
          onClick={() => router.push("/events")}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleEdit = () => {
    router.push(`/events/createevent?id=${event!.id}&edit=true`);
  };

  const categories = Array.isArray(event!.category)
    ? event!.category
    : typeof event!.category === "string"
      ? (event!.category as string).split(",").map((tag) => tag.trim().replace(/[\[\]"'{}]/g, ""))
      : [];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header Banner */}
      <div className="h-64 bg-linear-to-r from-blue-600 to-indigo-700 relative">
        {event?.banner_image && (
          <Image
            src={event.banner_image}
            alt={event.title}
            fill
            className="object-cover opacity-20 mix-blend-overlay"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-gray-900/50 to-transparent" />

        <div className="absolute top-6 left-6">
          <button
            onClick={() => router.push("/events")}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            <ArrowLeft weight="duotone" className="w-4 h-4" />
            Back to Events
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Column: Image & Quick Stats */}
              <div className="w-full md:w-1/3 space-y-6">
                <div className="aspect-16/10 relative rounded-xl overflow-hidden shadow-lg border border-gray-100 bg-gray-100">
                  <Image
                    src={event!.banner_image || "/placeholder.png"}
                    alt={event!.title}
                    fill
                    className="object-cover"
                  />
                  {event!.is_featured && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-linear-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                      FEATURED
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-blue-700">
                      {event!.capacity}
                    </div>
                    <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                      Capacity
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-emerald-700">
                      {event!.available}
                    </div>
                    <div className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                      Available
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                  >
                    <PencilSimple weight="duotone" className="w-4 h-4" />
                    Edit Event
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                    <PauseCircle weight="duotone" className="w-4 h-4" />
                    Pause Sales
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium border border-red-100">
                    <Trash weight="duotone" className="w-4 h-4" />
                    Cancel Event
                  </button>
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="w-full md:w-2/3 space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <StatusBadge status={event!.status} />
                    {event!.sales_status && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full capitalize">
                        Sales: {event!.sales_status}
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {event!.title}
                  </h1>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map((cat, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm"
                      >
                        {cat.trim()}
                      </span>
                    ))}
                  </div>
                  <div className="prose prose-blue max-w-none text-gray-600 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                    <p>{event!.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem
                    icon={CalendarBlank}
                    label="Date & Time"
                    value={
                      <div>
                        {event!.start_date ? (
                          <>
                            <div className="text-gray-900">
                              {format(new Date(event!.start_date), "MMMM dd, yyyy")}
                            </div>
                            <div className="text-sm text-gray-500 font-normal">
                              {format(new Date(event!.start_date), "hh:mm a")} -{" "}
                              {event!.end_date
                                ? format(new Date(event!.end_date), "hh:mm a")
                                : "End time n/a"}
                            </div>
                          </>
                        ) : (
                          "TBA"
                        )}
                      </div>
                    }
                  />
                  <DetailItem
                    icon={MapPin}
                    label="Location"
                    value={
                      <div>
                        <div className="text-gray-900 line-clamp-1">{event!.venue_name}</div>
                        <div className="text-sm text-gray-500 font-normal line-clamp-1">
                          {event!.address}
                        </div>
                      </div>
                    }
                  />
                  <DetailItem
                    icon={CurrencyDollar}
                    label="Pricing"
                    value={`NPR ${event!.price}`}
                  />
                  <DetailItem
                    icon={ShieldCheck}
                    label="Commission Rate"
                    value={`${event!.commission_rate}%`}
                  />
                </div>

                {/* Additional Metadata */}
                <div className="pt-6 border-t border-gray-100 grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <span className="text-gray-500 block mb-1">Created At</span>
                    <span className="font-medium text-gray-900">
                      {event!.created_at ? format(new Date(event!.created_at), "MMM dd, yyyy HH:mm") : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Last Updated</span>
                    <span className="font-medium text-gray-900">
                      {event!.updated_at ? format(new Date(event!.updated_at), "MMM dd, yyyy HH:mm") : 'N/A'}
                    </span>
                  </div>
                </div>

                {event!.organizer_id && (
                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg text-indigo-600">
                          <Users weight="duotone" className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Organizer ID</p>
                          <p className="font-mono font-medium text-indigo-900">{event!.organizer_id}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/organisers/detail?id=${event!.organizer_id}`)}
                        className="px-3 py-1.5 bg-white text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
                      >
                        View Organizer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
