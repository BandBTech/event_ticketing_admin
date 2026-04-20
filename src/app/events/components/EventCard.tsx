import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { useEventStore } from "@/store/eventStore";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarBlankIcon,
  MapPinIcon,
  TicketIcon,
  CrownIcon,
  EyeIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import { Event } from "@/types/event";
import { EventStatusBadge } from "@/app/components/EventStatusBadge";
import { SalesStatusBadge } from "@/app/components/SalesStatusBadge";
import FeaturedBadge from "./FeaturedBadge";

// Event Card Component
export function EventCard({ event }: { event: Event }) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const router = useRouter();
  const { setSelectedEvent } = useEventStore();
  // const statusConfig = getStatusConfig(event.status);
  // const StatusIcon = statusConfig.icon;

  const formattedDate = event.start_date
    ? format(new Date(event.start_date), "MMM dd, yyyy")
    : "TBA";
  const formattedTime = event.start_date
    ? format(new Date(event.start_date), "hh:mm a")
    : "";

  // Parse categories
  const categories: string[] = event.category
    ? event.category.split(",").map((tag) => tag.trim().replace(/[\[\]"'{}]/g, "")).filter(Boolean)
    : [];

  const handleViewDetail = () => {
    setSelectedEvent(event);
    router.push(`/events/eventdetails?id=${event.id}`);
  };

  // const handleEdit = () => {
  //   setSelectedEvent(event);
  //   router.push(`/events/edit?id=${event.id}`);
  // };

  return (
    <Card
      className="group hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full border-gray-200 py-0 cursor-pointer"
      onClick={handleViewDetail}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-muted">
        <Image
          src={event.banner_image || "/placeholder.png"}
          alt={event.title}
          width={100}
          height={100}
          className="object-cover w-full aspect-16/10 group-hover:scale-105 transition-transform duration-300"
        />
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          {/* {event.status &&
          event.sales_status === "stopped" &&
          !["completed", "cancelled"].includes(event.status) ? (
            <SalesStatusBadge status={event.sales_status} />
          ) : (
            event.status && <EventStatusBadge status={event.status} />
          )} */}
          {event.status && <EventStatusBadge status={event.status} />}
        </div>
        {/* Featured Badge */}
        {event.is_featured && (
          <div className="absolute top-3 right-3">
            <FeaturedBadge />
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-5 flex flex-col flex-1 pb-4">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {categories.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs font-normal text-muted-foreground bg-muted/50 border-border whitespace-pre-wrap break-all max-w-full rounded-xl"
              >
                {tag}
              </Badge>
            ))}
            {categories.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs font-normal text-muted-foreground bg-muted/50 border-border whitespace-pre-wrap break-all max-w-full  rounded-xl"
              >
                +{categories.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Title */}
        <h3
          title={event.title}
          className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2"
        >
          {event.title}
        </h3>

        {/* Event Details */}
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <CalendarBlankIcon
              weight="duotone"
              className="w-4 h-4 text-muted-foreground/70 shrink-0"
            />
            <span className="truncate">
              {formattedDate}{" "}
              <span className="text-muted-foreground/40">•</span>{" "}
              {formattedTime}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon
              weight="duotone"
              className="w-4 h-4 text-muted-foreground/70 shrink-0"
            />
            <span className="truncate">
              {/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(event.address?.trim() ?? "")
                ? event.venue_name
                : [event.venue_name, event.address].filter(Boolean).join(", ")}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        {event.status !== "rejected" && (
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4 bg-muted/30 p-2 rounded-lg border border-border/50">
            {/* <div className="flex items-center gap-1.5" title="Capacity">
            <UsersIcon
              weight="duotone"
              className="w-4 h-4 text-muted-foreground/70"
            />
            <span className="font-medium">{event.capacity || 0}</span>
          </div>
          <div className="w-px h-4 bg-border" /> */}
            <div title="Titckets Sold">
              <div className="flex items-center gap-2">
                <TicketIcon
                  weight="duotone"
                  className="w-4 h-4 text-muted-foreground/70"
                />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold leading-none">
                  {t("events.ticketsSold")}
                </span>
              </div>
              <span className="font-medium">
                {event.sold_seats} / {event.total_seats}
              </span>
            </div>
            {(event.status === "on_sale" ||
              event.status === "approved" ||
              event.status === "completed") && (
              <div className="flex items-center gap-3 ml-auto">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold leading-none mb-1">
                    {t("events.commission")}
                  </span>
                  <div className="flex items-center gap-0.5 text-emerald-600 font-bold">
                    <span>{event.commission_rate || 0}%</span>
                  </div>
                </div>
                <div className="w-px h-6 bg-border/60" />
                {/* <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold leading-none mb-1">
                      Est. Earnings
                    </span>
                    <span className="text-emerald-700 font-bold">
                      {event.tiers?.[0]?.currency || "NPR"}{" "}
                      {((((event.capacity || 0) - (event.available || 0)) * (event.price || 0)) *
                        ((event.commission_rate || 0) / 100)).toFixed(2)}
                    </span>
                  </div> */}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto flex gap-2">
          <Button
            variant="default"
            className="flex-1 gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
            onClick={handleViewDetail}
          >
            <EyeIcon weight="duotone" className="w-4 h-4" />
            {t("events.details")}
          </Button>
          {/* <Button
            variant="outline"
            size="icon"
            className="hover:text-primary hover:border-primary/50"
            onClick={handleEdit}
            title="Edit Event"
          >
            <PencilSimpleIcon weight="duotone" className="w-4 h-4" />
          </Button> */}
        </div>
      </CardContent>
    </Card>
  );
}
