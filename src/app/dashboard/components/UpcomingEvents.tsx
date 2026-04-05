import { UpcomingEvent } from "@/types/dashboard";
import Image from "next/image";
import {
  MapPinIcon,
  ClockIcon,
  CalendarBlankIcon,
} from "@phosphor-icons/react";
import FeaturedBadge from "@/app/events/components/FeaturedBadge";
import { Route } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

type EventProps = {
  event: UpcomingEvent;
};

type UpcomingEventsListProps = {
  data: UpcomingEvent[];
};

function parseCategories(raw: string | null | undefined): string[] {
  if (!raw) {
    return [];
  }

  return raw
    .replace(/[{}"]/g, "")
    .split(",")
    .map((c: string) => c.trim())
    .filter(Boolean);
}

interface DateRangeResult {
  date: string;
  time: string;
}

function formatDateRange(
  start: Date | string | number | null | undefined,
  end: Date | string | number | null | undefined,
): DateRangeResult | null {
  if (!start || !end) {
    return null;
  }

  try {
    const s = new Date(start);
    const e = new Date(end);

    // Validate dates
    if (isNaN(s.getTime()) || isNaN(e.getTime())) {
      console.error("Invalid date provided to formatDateRange");
      return null;
    }

    const sameDay = s.toLocaleDateString() === e.toLocaleDateString();

    const dateOpts: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    const timeOpts: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    if (sameDay) {
      return {
        date: s.toLocaleDateString("en-US", dateOpts),
        time: `${s.toLocaleTimeString("en-US", timeOpts)} – ${e.toLocaleTimeString("en-US", timeOpts)}`,
      };
    }

    return {
      date: `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.toLocaleDateString("en-US", dateOpts)}`,
      time: s.toLocaleTimeString("en-US", timeOpts),
    };
  } catch (error) {
    console.error("Error formatting date range:", error);
    return null;
  }
}

type DaysUntilResult = string | null;

function getDaysUntil(
  dateStr: string | Date | number | null | undefined,
): DaysUntilResult {
  if (!dateStr) {
    return null;
  }

  try {
    const targetDate = new Date(dateStr);
    const currentDate = new Date();

    // Validate date
    if (isNaN(targetDate.getTime())) {
      console.error("Invalid date provided to getDaysUntil");
      return null;
    }

    // Reset time part for accurate day calculation
    targetDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    const diff = Math.ceil(
      (targetDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diff < 0) return null;
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `In ${diff} days`;
  } catch (error) {
    console.error("Error calculating days until:", error);
    return null;
  }
}

const STATUS_MAP = {
  on_sale: { pill: "bg-blue-50 text-blue-600", label: "On Sale" },
  live: { pill: "bg-green-50 text-green-600", label: "Live" },
  pending: { pill: "bg-yellow-50 text-yellow-700", label: "Pending" },
  completed: { pill: "bg-gray-100 text-gray-500", label: "Completed" },
  upcoming: { pill: "bg-violet-50 text-violet-600", label: "Upcoming" },
};

type StatusKey = keyof typeof STATUS_MAP;

const CAT_COLORS = [
  "bg-blue-50 text-blue-700",
  "bg-purple-50 text-purple-700",
  "bg-emerald-50 text-emerald-700",
  "bg-orange-50 text-orange-700",
  "bg-yellow-50 text-yellow-700",
];

function EventCard({ event }: EventProps) {
  const categories = parseCategories(event.category);
  const dateRange = formatDateRange(event.start_date, event.end_date);
  const router = useRouter();

  if (!dateRange) {
    console.error("Invalid date range for event:", event.id);
    return null;
  }

  const { date, time } = dateRange;
  const daysUntil = getDaysUntil(event.start_date);
  const status = STATUS_MAP[event.status as StatusKey] ?? STATUS_MAP.upcoming;

  const handleOpenEventDetails = () => {
    router.push(`/events/eventdetails/?id=${event.id}`);
  };

  return (
    <div
      onClick={handleOpenEventDetails}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      {/* Banner */}
      <div className="relative h-44 overflow-hidden bg-gray-100 flex-shrink-0">
        <Image
          src={event.banner_image}
          alt={event.title}
          width={400}
          height={200}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            console.error("Image failed to load:", event.banner_image);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Days until — top left */}
        {daysUntil && (
          <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-md">
            {daysUntil}
          </span>
        )}

        {/* Status — top right */}
        <span
          className={`absolute top-3 right-3 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wide backdrop-blur-sm ${status.pill}`}
        >
          {status.label}
        </span>

        {/* Featured — bottom left */}
        {event.is_featured && (
          <span className="absolute bottom-3 left-3">
            <FeaturedBadge />
          </span>
        )}

        {/* Sales status — bottom right */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ring-2 ring-white/50 ${event.sales_status === "active" ? "bg-emerald-400" : "bg-gray-400"}`}
          />
          <span className="text-[10px] text-white font-semibold capitalize">
            Sales {event.sales_status}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Title */}
        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
          {event.title}
        </h3>

        {/* Meta */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
            <CalendarBlankIcon />
            <span className="font-medium text-gray-700">{date}</span>
            <span className="text-gray-300">·</span>
            <ClockIcon />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPinIcon />
            <span className="truncate">{event.venue_name}</span>
          </div>
        </div>

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
      </div>
    </div>
  );
}

export default function UpcomingEventsList({ data }: UpcomingEventsListProps) {
  const EVENTS = data;
  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Upcoming Events</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {EVENTS.length} events scheduled
            </p>
          </div>
        </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-2 gap-4">
        {EVENTS.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
