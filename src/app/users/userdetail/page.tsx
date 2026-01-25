"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Calendar, Shield, User, MessageSquare, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

interface Role {
  id: string
  name: string
  description: string
}

interface OrganizerData {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  country_code: string
  is_email_verified: boolean
  organizer_status: string
  account_status: string
  admin_remark: string
  roles: Role[]
  created_at: string
  updated_at: string
}

interface OrganizerProfileProps {
  data: OrganizerData
}

function OrganizerProfile({ data }: OrganizerProfileProps) {
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      approved: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      active: "bg-blue-100 text-blue-800 border-blue-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">
              {data.first_name} {data.last_name}
            </CardTitle>
            <CardDescription className="mt-1">Organizer Profile</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusColor(data.organizer_status)}>
              {data.organizer_status}
            </Badge>
            <Badge className={getStatusColor(data.account_status)}>
              {data.account_status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Contact Information */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-4 w-4" />
            Contact Information
          </h3>
          <div className="grid gap-3 pl-6">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <div className="flex items-center gap-2">
                <span className="text-sm">{data.email}</span>
                {data.is_email_verified && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    Verified
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {data.country_code} {data.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Roles */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles & Permissions
          </h3>
          <div className="flex flex-wrap gap-2 pl-6">
            {data.roles.map((role) => (
              <div key={role.id} className="group relative">
                <Badge variant="secondary" className="capitalize">
                  {role.name}
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
        {data.admin_remark && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Admin Remark
            </h3>
            <p className="text-sm text-gray-600 pl-6 italic">{data.admin_remark}</p>
          </div>
        )}

        {/* Timestamps */}
        <div className="space-y-3 pt-4 border-t">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Account Details
          </h3>
          <div className="grid gap-2 pl-6 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Created:</span>
              <span className="font-medium">
                {format(new Date(data.created_at), "PPp")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span className="font-medium">
                {format(new Date(data.updated_at), "PPp")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>User ID:</span>
              <span className="font-mono text-xs">{data.id}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function OrganizerProfilePage() {
  const router = useRouter()

  // Random sample data
  const organizerData: OrganizerData = {
    id: "0c41f48e-863c-4c6d-bf58-ba1bf8253492",
    email: "timroticket_org+2ndjan24@yopmail.com",
    first_name: "Event",
    last_name: "Organizer",
    phone: "+9779827225258",
    country_code: "+977",
    is_email_verified: true,
    organizer_status: "approved",
    account_status: "active",
    admin_remark: "Approved by admin",
    roles: [
      {
        id: "7c8e94b1-cf10-45f8-9e98-03efc74815bf",
        name: "organizer",
        description: "Event organizer with event management permissions"
      }
    ],
    created_at: "2026-01-24T16:18:04.786305Z",
    updated_at: "2026-01-25T07:01:11.839438Z"
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>

        {/* Profile Card */}
        <OrganizerProfile data={organizerData} />
      </div>
    </div>
  )
}