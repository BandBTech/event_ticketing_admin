"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  XCircle,
  PauseCircle,
  PencilLine,
  CircleDot,
} from "lucide-react";
import Image from "next/image";
import { useEventStore } from "@/store/eventStore";
import { PendingEvent } from "@/types/pendingEvents";
import { useParams, useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function EventDetailsPage() {
  const [event, setEvent] = useState<PendingEvent | null>(null);
  const { selectedEvent, clearSelectedEvent } = useEventStore();
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  useEffect(() => {
    const loadEventData = async () => {
      try {
        if (selectedEvent) {
          setEvent(selectedEvent);
        } else {
        }
      } catch (error) {
        console.error("Error loading event:", error);
      } finally {
      }
    };

    loadEventData();
  }, [eventId, selectedEvent]);

  const handleCancelEvent = () => {
    clearSelectedEvent();
    router.push("/dashboard");
  };
  return (
    <>
      <div className="flex flex-col min-h-screen ml-64">
        <div className="flex-grow p-6 space-y-6">
          {/* Event Title + Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="text-3xl text-gray-700 font-bold">
                {event?.title}
              </h2>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="bg-green-500 flex items-center gap-2 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                  <CircleDot className="w-3 h-3" />
                  {event?.status}
                </span>
                <div className="flex items-center gap-1 text-gray-700 ">
                  <Calendar size={14} />{" "}
                  {event?.start_date ? (
                    <>
                      {new Date(event.start_date).toLocaleDateString()}{" "}
                      {new Date(event.start_date).toLocaleTimeString()}
                    </>
                  ) : (
                    "N/A"
                  )}
                </div>
                <div className="flex items-center gap-1 text-gray-700 ">
                  <MapPin size={14} />
                  {event?.address}
                </div>
              </div>
            </div>

            <div className="flex gap-3 ">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-400 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer">
                <PauseCircle size={16} /> Pause Sales
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-400 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer">
                <PencilLine size={16} /> Edit Event
              </button>
              <button
                onClick={handleCancelEvent}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-400 bg-red-200 text-red-500 hover:bg-red-300 cursor-pointer"
              >
                <XCircle size={16} /> Cancel
              </button>
            </div>
          </div>

          {/* Banner */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-xl overflow-hidden relative h-64 md:h-80 lg:h-96 bg-gray-200">
              {event?.banner_image ? (
                <Image
                  src={event.banner_image}
                  alt={event.title}
                  fill={true}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No banner image available</p>
                </div>
              )}
            </div>
            {/* Description */}
            <div className="rounded-xl bg-white  p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 ">
                Event description
              </h3>
              <p className="text-gray-600">{event?.description}</p>
              <div className="flex flex-wrap gap-2 ">
                <h3 className="w-full text-lg font-semibold text-gray-700 mb-2">
                  Categories
                </h3>
                {event?.category.map((cat) => (
                  <span
                    key={cat}
                    className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-sm"
                  >
                    {cat}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 ">
                <h3 className="w-full text-lg font-semibold text-gray-700 mb-2">
                  Commission Rate
                </h3>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-sm">
                  {event?.commission_rate}%
                </span>
              </div>
              {/* Details */}
              <div className=" grid grid-cols-2 gap-4 text-gray-700">
                <div>
                  <h3 className="font-semibold">Venue</h3>
                  <p className="font-medium text-gray-500">
                    {event?.venue_name}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold ">Location</h3>
                  <p className="font-medium text-gray-500">{event?.address}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Event Starts On</h3>
                  <p className="font-medium text-gray-500">
                    {event?.start_date ? (
                      <>
                        {new Date(event.start_date).toLocaleDateString()}{" "}
                        {new Date(event.start_date).toLocaleTimeString()}
                      </>
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Event Ends On</h3>
                  <p className="font-medium text-gray-500">
                    {event?.end_date ? (
                      <>
                        {new Date(event.end_date).toLocaleDateString()}{" "}
                        {new Date(event.end_date).toLocaleTimeString()}
                      </>
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Ticket Sales Starts On</h3>
                  <p className="font-medium text-gray-500">
                    5-Sep-2025 9:00 AM
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Ticket Sales Ends On</h3>
                  <p className="font-medium text-gray-500">
                    25-Sep-2025 9:00 AM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
