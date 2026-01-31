"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  Calendar,
  Shield,
  User,
  MessageSquare,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { UserService } from "@/lib/userService";
import { useQuery } from "@tanstack/react-query";
import { UserData } from "@/types/user";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";

export default function OrganizerProfilePage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const router = useRouter();
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("user_id") || "" : "";

  const { data: response, isLoading } = useQuery<UserData>({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => UserService.getUsersById({ id: userId }),
    enabled: !!userId,
  });

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      approved: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      active: "bg-blue-100 text-blue-800 border-blue-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return (
      statusColors[status.toLowerCase()] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">Loading user details...</p>
          </div>
        </div>
      </div>
    );
  }

  // if (isError || !response?.success || !response?.data) {
  //   return (
  //     <div className="container mx-auto py-8 px-4">
  //       <div className="max-w-3xl mx-auto space-y-6">
  //         <Button
  //           variant="ghost"
  //           onClick={() => {
  //             localStorage.removeItem("user_id")
  //             router.back()
  //           }}
  //           className="gap-2"
  //         >
  //           <ArrowLeft className="h-4 w-4" />
  //           Back to Users
  //         </Button>
  //         <Card className="w-full max-w-3xl">
  //           <CardContent className="pt-6">
  //             <div className="text-center text-red-600">
  //               <p className="font-medium">Error loading user details</p>
  //               <p className="text-sm text-gray-500 mt-1">
  //                 Failed to fetch user data
  //               </p>
  //             </div>
  //           </CardContent>
  //         </Card>
  //       </div>
  //     </div>
  //   )
  // }

  const data = response;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => {
            localStorage.removeItem("user_id");
            router.back();
          }}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("users.userDetail.backToUsers", "Back to Users")}
        </Button>

        {/* Profile Card */}
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {data?.first_name} {data?.last_name}
                </CardTitle>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(data?.organizer_status || "")}>
                  {t(
                    `users.organizerStatus.${data?.organizer_status?.toLowerCase()}`,
                  )}
                </Badge>
                <Badge className={getStatusColor(data?.account_status || "")}>
                  {t(
                    `users.accountStatus.${data?.account_status?.toLowerCase()}`,
                  )}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Contact Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-4 w-4" />
                {t(
                  "users.userDetail.contactInformation",
                  "Contact Information",
                )}
              </h3>
              <div className="grid gap-3 pl-6">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{data?.email}</span>
                    {data?.is_email_verified && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-50 text-green-700 border-green-200"
                      >
                        {t("users.verifiedStatus.verified")}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {data?.country_code && data?.phone
                      ? `${data.country_code} ${data.phone}`
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Roles */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t(
                  "users.userDetail.rolesAndPermissions",
                  "Roles & Permissions",
                )}
              </h3>
              <div className="flex flex-wrap gap-2 pl-6">
                {data?.roles.map((role) => (
                  <div key={role.id} className="group relative">
                    <Badge variant="secondary" className="capitalize">
                      {t(`users.userRoles.${role.name}`)}
                    </Badge>
                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                      <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        {role.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Remark */}
            {data?.admin_remark && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Admin Remark
                </h3>
                <p className="text-sm text-gray-600 pl-6 italic">
                  {data?.admin_remark}
                </p>
              </div>
            )}

            {/* Timestamps */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t("users.userDetail.accountDetails", "Account Details")}
              </h3>
              <div className="grid gap-2 pl-6 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>{t("users.userDetail.createdOn", "Created On")}:</span>
                  <span className="font-medium">
                    {format(new Date(data?.created_at || "N/A"), "PPp")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t("users.userDetail.updatedOn", "Updated On")}:</span>
                  <span className="font-medium">
                    {format(new Date(data?.updated_at || "N/A"), "PPp")}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
