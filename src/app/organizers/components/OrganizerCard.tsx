import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { getInitials, formatPhoneNumber } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarBlankIcon,
  PhoneCallIcon,
  TicketIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UserMinusIcon,
} from "@phosphor-icons/react";
import { Organizer } from "@/services/organizerService";
import Image from "next/image";

function getStatusConfig(status: string) {
  switch (status?.toLowerCase()) {
    case "approved":
      return {
        variant: "secondary" as const,
        className:
          "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200",
        icon: CheckCircleIcon,
        label: "approved",
      };
    case "pending":
      return {
        variant: "secondary" as const,
        className:
          "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200",
        icon: ClockIcon,
        label: "pending",
      };
    case "rejected":
      return {
        variant: "destructive" as const,
        className: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200",
        icon: XCircleIcon,
        label: "rejected",
      };
    case "inactive":
      return {
        variant: "secondary" as const,
        className:
          "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200",
        icon: UserMinusIcon,
        label: "inactive",
      };
    default:
      return {
        variant: "secondary" as const,
        className:
          "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200",
        icon: ClockIcon,
        label: status || "unknown",
      };
  }
}

function getAccountStatusConfig(status: string) {
  switch (status?.toLowerCase()) {
    case "active":
      return {
        className:
          "bg-emerald-500 text-white hover:bg-emerald-600 border-transparent",
        label: "active",
      };
    case "inactive":
      return {
        className:
          "bg-gray-500 text-white hover:bg-gray-600 border-transparent",
        label: "inactive",
      };
    case "suspended":
      return {
        className: "bg-red-500 text-white hover:bg-red-600 border-transparent",
        label: "suspended",
      };
    default:
      return {
        className:
          "bg-gray-500 text-white hover:bg-gray-600 border-transparent",
        label: status || "unknown",
      };
  }
}

// Organizer Card Component
function OrganizerCard({ organizer }: { organizer: Organizer }) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const router = useRouter();
  const statusConfig = getStatusConfig(organizer.organizer_status);
  const accountStatusConfig = getAccountStatusConfig(organizer.account_status);
  const StatusIcon = statusConfig.icon;

  const formattedDate = organizer.created_at
    ? format(new Date(organizer.created_at), "MMM dd, yyyy")
    : "N/A";

  return (
    <Card
      className="group hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden border-gray-200 cursor-pointer"
      onClick={() => router.push(`/organizers/detail?id=${organizer?.id}`)}
    >
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
        <Avatar className="h-16 w-16 border border-gray-100 group-hover:scale-105 transition-transform duration-300">
          {organizer.logo ? (
            <Image
              width={400}
              height={200}
              src={organizer.logo}
              alt={`${organizer.name}`}
              className="object-contain"
            />
          ) : (
            <AvatarFallback className="text-xl font-bold bg-linear-to-br from-indigo-50 to-blue-50 text-indigo-600">
              {getInitials(organizer.name)}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-lg text-gray-900 truncate pr-1 group-hover:text-primary transition-colors">
              {organizer.name}
            </h3>
            <Badge
              variant="outline"
              className={`text-[10px] font-bold shrink-0 ${accountStatusConfig.className}`}
            >
              {t(`organizer.${accountStatusConfig.label}`)}
            </Badge>
          </div>
          <p
            className="text-sm text-muted-foreground truncate font-medium"
            title={organizer.email}
          >
            {organizer.email}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 pb-4">
        <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t("organizer.status")}
            </span>
            <Badge
              variant={statusConfig.variant}
              className={`gap-1.5 px-2.5 py-0.5 rounded-full font-semibold border ${statusConfig.className}`}
            >
              <StatusIcon weight="duotone" className="w-3.5 h-3.5" />
              {t(`organizer.${statusConfig.label}`)}
            </Badge>
          </div>
          {/* {organizer.is_email_verified && (
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100 gap-1 px-2 py-0.5"
              title="Email Verified"
            >
              <UserCheckIcon weight="duotone" className="w-3.5 h-3.5" />
              {t("organizer.verified")}
            </Badge>
          )} */}
        </div>

        <div className="space-y-1 text-sm text-muted-foreground">
          {organizer.phone && (
            <div className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md transition-colors">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <PhoneCallIcon weight="duotone" className="w-4 h-4" />
              </div>
              <span className="font-medium truncate">
                {formatPhoneNumber(organizer.country_code, organizer.phone)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md transition-colors">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <CalendarBlankIcon weight="duotone" className="w-4 h-4" />
            </div>
            <span className="font-medium">
              {t("organizer.joined")} {formattedDate}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex gap-3">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/organizers/detail?id=${organizer.id}`);
          }}
        >
          <EyeIcon weight="duotone" className="w-4.5 h-4.5" />
          {t("organizer.profile")}
        </Button>
        <Button
          className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/events?organizer_id=${organizer.id}`);
          }}
        >
          <TicketIcon weight="duotone" className="w-4.5 h-4.5" />
          {t("organizer.events")}
        </Button>
      </CardFooter>
    </Card>
  );
}

export { OrganizerCard };
