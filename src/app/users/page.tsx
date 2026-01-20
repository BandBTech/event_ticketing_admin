"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  MagnifyingGlass as MagnifyingGlassIcon,
  Funnel as FunnelIcon,
  CaretLeft as CaretLeftIcon,
  CaretRight as CaretRightIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Clock as ClockIcon,
  UserMinus as UserMinusIcon,
  UserCheck as UserCheckIcon,
  Eye as EyeIcon,
  Shield as ShieldIcon,
  Buildings as BuildingsIcon,
  User as UserIcon,
} from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { formatPhoneNumber } from "@/lib/utils";

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  roles: string[];
  created_at: string;
  updated_at: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  users: string[];
  permissions: Permission[];
}

interface OrganizerOnboarding {
  business_description: string;
  business_logo_url: string;
  business_name: string;
  created_at: string;
  id: string;
  is_complete: boolean;
  organizer: string;
  organizer_id: string;
  updated_at: string;
}

interface User {
  account_status: string;
  admin_remark: string;
  approved_at: string | null;
  country_code: string;
  created_at: string;
  created_by: string;
  email: string;
  first_name: string;
  id: string;
  is_email_verified: boolean;
  last_name: string;
  organizer_id: string;
  organizer_onboarding: OrganizerOnboarding;
  organizer_status: string;
  phone: string;
  rejected_at: string | null;
  roles: Role[];
  updated_at: string;
}

function getStatusConfig(status: string) {
  switch (status?.toLowerCase()) {
    case "approved":
      return {
        className:
          "bg-green-50 text-green-700 hover:bg-green-100 border-green-200",
        icon: CheckCircleIcon,
        label: "Approved",
      };
    case "pending":
      return {
        className:
          "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200",
        icon: ClockIcon,
        label: "Pending",
      };
    case "rejected":
      return {
        className: "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200",
        icon: XCircleIcon,
        label: "Rejected",
      };
    case "suspended":
      return {
        className:
          "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200",
        icon: UserMinusIcon,
        label: "Suspended",
      };
    default:
      return {
        className: "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200",
        icon: ClockIcon,
        label: status || "Unknown",
      };
  }
}

function getAccountStatusConfig(status: string) {
  switch (status?.toLowerCase()) {
    case "active":
      return {
        className:
          "bg-green-600 text-white hover:bg-green-700 border-transparent",
        label: "Active",
      };
    case "inactive":
      return {
        className:
          "bg-slate-500 text-white hover:bg-slate-600 border-transparent",
        label: "Inactive",
      };
    case "pending":
      return {
        className:
          "bg-yellow-600 text-white hover:bg-yellow-700 border-transparent",
        label: "Pending",
      };
    case "suspended":
      return {
        className:
          "bg-rose-600 text-white hover:bg-rose-700 border-transparent",
        label: "Suspended",
      };
    case "rejected":
      return {
        className:
          "bg-orange-600 text-white hover:bg-orange-700 border-transparent",
        label: "Rejected",
      };
    default:
      return {
        className:
          "bg-gray-500 text-white hover:bg-gray-600 border-transparent",
        label: status || "Unknown",
      };
  }
}

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);

  const mockUserData: User[] = [
    {
      account_status: "active",
      admin_remark: "Verified and approved",
      approved_at: "2025-01-08T09:20:00Z",
      country_code: "+977",
      created_at: "2025-01-05T07:10:00Z",
      created_by: "admin_001",
      email: "ram.sharma@example.com",
      first_name: "Ram",
      id: "usr_001",
      is_email_verified: true,
      last_name: "Sharma",
      organizer_id: "org_001",
      organizer_onboarding: {
        business_description: "Tech event organizer",
        business_logo_url: "https://example.com/logo1.png",
        business_name: "TechFest Nepal",
        created_at: "2025-01-06T10:00:00Z",
        id: "onb_001",
        is_complete: true,
        organizer: "Ram Sharma",
        organizer_id: "org_001",
        updated_at: "2025-01-07T12:00:00Z",
      },
      organizer_status: "approved",
      phone: "9812345678",
      rejected_at: null,
      roles: [
        {
          id: "role_admin",
          name: "Admin",
          description: "Full system access",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-05T08:20:00Z",
          users: ["usr_001"],
          permissions: [
            {
              id: "perm_users_read",
              name: "Read Users",
              description: "View users",
              resource: "users",
              action: "read",
              roles: ["Admin"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
            {
              id: "perm_users_write",
              name: "Manage Users",
              description: "Create and update users",
              resource: "users",
              action: "write",
              roles: ["Admin"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          ],
        },
      ],
      updated_at: "2025-01-08T09:20:00Z",
    },
    {
      account_status: "pending",
      admin_remark: "Waiting for documents",
      approved_at: null,
      country_code: "+977",
      created_at: "2025-01-10T11:30:00Z",
      created_by: "self",
      email: "sita.karki@example.com",
      first_name: "Sita",
      id: "usr_002",
      is_email_verified: false,
      last_name: "Karki",
      organizer_id: "org_002",
      organizer_onboarding: {
        business_description: "Music and cultural events",
        business_logo_url: "https://example.com/logo2.png",
        business_name: "Music Vibe",
        created_at: "2025-01-10T12:00:00Z",
        id: "onb_002",
        is_complete: false,
        organizer: "Sita Karki",
        organizer_id: "org_002",
        updated_at: "2025-01-10T12:30:00Z",
      },
      organizer_status: "pending",
      phone: "9801122334",
      rejected_at: null,
      roles: [
        {
          id: "role_organizer",
          name: "Organizer",
          description: "Manage own events",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-10T11:50:00Z",
          users: ["usr_002"],
          permissions: [
            {
              id: "perm_events_create",
              name: "Create Events",
              description: "Create events",
              resource: "events",
              action: "create",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
            {
              id: "perm_events_read",
              name: "View Events",
              description: "View own events",
              resource: "events",
              action: "read",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          ],
        },
      ],
      updated_at: "2025-01-10T12:30:00Z",
    },
    {
      account_status: "suspended",
      admin_remark: "Policy violation",
      approved_at: "2024-12-20T08:00:00Z",
      country_code: "+977",
      created_at: "2024-12-01T09:45:00Z",
      created_by: "admin_002",
      email: "arjun.thapa@example.com",
      first_name: "Arjun",
      id: "usr_003",
      is_email_verified: true,
      last_name: "Thapa",
      organizer_id: "org_003",
      organizer_onboarding: {
        business_description: "Sports event organizer",
        business_logo_url: "https://example.com/logo3.png",
        business_name: "Nepal Sports Hub",
        created_at: "2024-12-02T10:00:00Z",
        id: "onb_003",
        is_complete: true,
        organizer: "Arjun Thapa",
        organizer_id: "org_003",
        updated_at: "2024-12-15T15:00:00Z",
      },
      organizer_status: "suspended",
      phone: "9844455566",
      rejected_at: null,
      roles: [
        {
          id: "role_organizer",
          name: "Organizer",
          description: "Manage own events",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2024-12-01T10:00:00Z",
          users: ["usr_003"],
          permissions: [
            {
              id: "perm_events_read",
              name: "View Events",
              description: "View own events",
              resource: "events",
              action: "read",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          ],
        },
      ],
      updated_at: "2025-01-02T10:00:00Z",
    },
    {
      account_status: "rejected",
      admin_remark: "Incomplete business details",
      approved_at: null,
      country_code: "+977",
      created_at: "2025-01-03T14:20:00Z",
      created_by: "self",
      email: "nabin.paudel@example.com",
      first_name: "Nabin",
      id: "usr_004",
      is_email_verified: false,
      last_name: "Paudel",
      organizer_id: "org_004",
      organizer_onboarding: {
        business_description: "Startup event planning",
        business_logo_url: "https://example.com/logo4.png",
        business_name: "Startup Connect",
        created_at: "2025-01-03T15:00:00Z",
        id: "onb_004",
        is_complete: false,
        organizer: "Nabin Paudel",
        organizer_id: "org_004",
        updated_at: "2025-01-04T09:00:00Z",
      },
      organizer_status: "rejected",
      phone: "9866677788",
      rejected_at: "2025-01-05T10:00:00Z",
      roles: [
        {
          id: "role_viewer",
          name: "Viewer",
          description: "Read-only access",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-03T14:30:00Z",
          users: ["usr_004"],
          permissions: [
            {
              id: "perm_events_read",
              name: "View Events",
              description: "View events",
              resource: "events",
              action: "read",
              roles: ["Viewer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          ],
        },
      ],
      updated_at: "2025-01-05T10:00:00Z",
    },
    {
      account_status: "active",
      admin_remark: "Auto-approved",
      approved_at: "2025-01-14T16:40:00Z",
      country_code: "+977",
      created_at: "2025-01-14T15:10:00Z",
      created_by: "system",
      email: "priya.adhikari@example.com",
      first_name: "Priya",
      id: "usr_005",
      is_email_verified: true,
      last_name: "Adhikari",
      organizer_id: "org_005",
      organizer_onboarding: {
        business_description: "Wedding and private events",
        business_logo_url: "https://example.com/logo5.png",
        business_name: "Elegant Events",
        created_at: "2025-01-14T15:20:00Z",
        id: "onb_005",
        is_complete: true,
        organizer: "Priya Adhikari",
        organizer_id: "org_005",
        updated_at: "2025-01-14T16:00:00Z",
      },
      organizer_status: "approved",
      phone: "9822233344",
      rejected_at: null,
      roles: [
        {
          id: "role_organizer",
          name: "Organizer",
          description: "Manage own events",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-14T15:30:00Z",
          users: ["usr_005"],
          permissions: [
            {
              id: "perm_events_create",
              name: "Create Events",
              description: "Create events",
              resource: "events",
              action: "create",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
            {
              id: "perm_events_update",
              name: "Update Events",
              description: "Update own events",
              resource: "events",
              action: "update",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          ],
        },
      ],
      updated_at: "2025-01-14T16:40:00Z",
    },
        {
      account_status: "active",
      admin_remark: "Auto-approved",
      approved_at: "2025-01-14T16:40:00Z",
      country_code: "+977",
      created_at: "2025-01-14T15:10:00Z",
      created_by: "system",
      email: "priya.adhikari@example.com",
      first_name: "Priya",
      id: "usr_005",
      is_email_verified: true,
      last_name: "Adhikari",
      organizer_id: "org_005",
      organizer_onboarding: {
        business_description: "Wedding and private events",
        business_logo_url: "https://example.com/logo5.png",
        business_name: "Elegant Events",
        created_at: "2025-01-14T15:20:00Z",
        id: "onb_005",
        is_complete: true,
        organizer: "Priya Adhikari",
        organizer_id: "org_005",
        updated_at: "2025-01-14T16:00:00Z",
      },
      organizer_status: "approved",
      phone: "9822233344",
      rejected_at: null,
      roles: [
        {
          id: "role_organizer",
          name: "Organizer",
          description: "Manage own events",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-14T15:30:00Z",
          users: ["usr_005"],
          permissions: [
            {
              id: "perm_events_create",
              name: "Create Events",
              description: "Create events",
              resource: "events",
              action: "create",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
            {
              id: "perm_events_update",
              name: "Update Events",
              description: "Update own events",
              resource: "events",
              action: "update",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          ],
        },
      ],
      updated_at: "2025-01-14T16:40:00Z",
    },
        {
      account_status: "active",
      admin_remark: "Auto-approved",
      approved_at: "2025-01-14T16:40:00Z",
      country_code: "+977",
      created_at: "2025-01-14T15:10:00Z",
      created_by: "system",
      email: "priya.adhikari@example.com",
      first_name: "Priya",
      id: "usr_005",
      is_email_verified: true,
      last_name: "Adhikari",
      organizer_id: "org_005",
      organizer_onboarding: {
        business_description: "Wedding and private events",
        business_logo_url: "https://example.com/logo5.png",
        business_name: "Elegant Events",
        created_at: "2025-01-14T15:20:00Z",
        id: "onb_005",
        is_complete: true,
        organizer: "Priya Adhikari",
        organizer_id: "org_005",
        updated_at: "2025-01-14T16:00:00Z",
      },
      organizer_status: "approved",
      phone: "9822233344",
      rejected_at: null,
      roles: [
        {
          id: "role_organizer",
          name: "Organizer",
          description: "Manage own events",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-14T15:30:00Z",
          users: ["usr_005"],
          permissions: [
            {
              id: "perm_events_create",
              name: "Create Events",
              description: "Create events",
              resource: "events",
              action: "create",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
            {
              id: "perm_events_update",
              name: "Update Events",
              description: "Update own events",
              resource: "events",
              action: "update",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          ],
        },
      ],
      updated_at: "2025-01-14T16:40:00Z",
    },
        {
      account_status: "active",
      admin_remark: "Auto-approved",
      approved_at: "2025-01-14T16:40:00Z",
      country_code: "+977",
      created_at: "2025-01-14T15:10:00Z",
      created_by: "system",
      email: "priya.adhikari@example.com",
      first_name: "Priya",
      id: "usr_005",
      is_email_verified: true,
      last_name: "Adhikari",
      organizer_id: "org_005",
      organizer_onboarding: {
        business_description: "Wedding and private events",
        business_logo_url: "https://example.com/logo5.png",
        business_name: "Elegant Events",
        created_at: "2025-01-14T15:20:00Z",
        id: "onb_005",
        is_complete: true,
        organizer: "Priya Adhikari",
        organizer_id: "org_005",
        updated_at: "2025-01-14T16:00:00Z",
      },
      organizer_status: "approved",
      phone: "9822233344",
      rejected_at: null,
      roles: [
        {
          id: "role_organizer",
          name: "Organizer",
          description: "Manage own events",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-14T15:30:00Z",
          users: ["usr_005"],
          permissions: [
            {
              id: "perm_events_create",
              name: "Create Events",
              description: "Create events",
              resource: "events",
              action: "create",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
            {
              id: "perm_events_update",
              name: "Update Events",
              description: "Update own events",
              resource: "events",
              action: "update",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          ],
        },
      ],
      updated_at: "2025-01-14T16:40:00Z",
    },
        {
      account_status: "active",
      admin_remark: "Auto-approved",
      approved_at: "2025-01-14T16:40:00Z",
      country_code: "+977",
      created_at: "2025-01-14T15:10:00Z",
      created_by: "system",
      email: "priya.adhikari@example.com",
      first_name: "Priya",
      id: "usr_005",
      is_email_verified: true,
      last_name: "Adhikari",
      organizer_id: "org_005",
      organizer_onboarding: {
        business_description: "Wedding and private events",
        business_logo_url: "https://example.com/logo5.png",
        business_name: "Elegant Events",
        created_at: "2025-01-14T15:20:00Z",
        id: "onb_005",
        is_complete: true,
        organizer: "Priya Adhikari",
        organizer_id: "org_005",
        updated_at: "2025-01-14T16:00:00Z",
      },
      organizer_status: "approved",
      phone: "9822233344",
      rejected_at: null,
      roles: [
        {
          id: "role_organizer",
          name: "Organizer",
          description: "Manage own events",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-14T15:30:00Z",
          users: ["usr_005"],
          permissions: [
            {
              id: "perm_events_create",
              name: "Create Events",
              description: "Create events",
              resource: "events",
              action: "create",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
            {
              id: "perm_events_update",
              name: "Update Events",
              description: "Update own events",
              resource: "events",
              action: "update",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          ],
        },
      ],
      updated_at: "2025-01-14T16:40:00Z",
    },
        {
      account_status: "active",
      admin_remark: "Auto-approved",
      approved_at: "2025-01-14T16:40:00Z",
      country_code: "+977",
      created_at: "2025-01-14T15:10:00Z",
      created_by: "system",
      email: "priya.adhikari@example.com",
      first_name: "Priya",
      id: "usr_005",
      is_email_verified: true,
      last_name: "Adhikari",
      organizer_id: "org_005",
      organizer_onboarding: {
        business_description: "Wedding and private events",
        business_logo_url: "https://example.com/logo5.png",
        business_name: "Elegant Events",
        created_at: "2025-01-14T15:20:00Z",
        id: "onb_005",
        is_complete: true,
        organizer: "Priya Adhikari",
        organizer_id: "org_005",
        updated_at: "2025-01-14T16:00:00Z",
      },
      organizer_status: "approved",
      phone: "9822233344",
      rejected_at: null,
      roles: [
        {
          id: "role_organizer",
          name: "Organizer",
          description: "Manage own events",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-14T15:30:00Z",
          users: ["usr_005"],
          permissions: [
            {
              id: "perm_events_create",
              name: "Create Events",
              description: "Create events",
              resource: "events",
              action: "create",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
            {
              id: "perm_events_update",
              name: "Update Events",
              description: "Update own events",
              resource: "events",
              action: "update",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          ],
        },
      ],
      updated_at: "2025-01-14T16:40:00Z",
    },
        {
      account_status: "active",
      admin_remark: "Auto-approved",
      approved_at: "2025-01-14T16:40:00Z",
      country_code: "+977",
      created_at: "2025-01-14T15:10:00Z",
      created_by: "system",
      email: "priya.adhikari@example.com",
      first_name: "Priya",
      id: "usr_005",
      is_email_verified: true,
      last_name: "Adhikari",
      organizer_id: "org_005",
      organizer_onboarding: {
        business_description: "Wedding and private events",
        business_logo_url: "https://example.com/logo5.png",
        business_name: "Elegant Events",
        created_at: "2025-01-14T15:20:00Z",
        id: "onb_005",
        is_complete: true,
        organizer: "Priya Adhikari",
        organizer_id: "org_005",
        updated_at: "2025-01-14T16:00:00Z",
      },
      organizer_status: "approved",
      phone: "9822233344",
      rejected_at: null,
      roles: [
        {
          id: "role_organizer",
          name: "Organizer",
          description: "Manage own events",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-14T15:30:00Z",
          users: ["usr_005"],
          permissions: [
            {
              id: "perm_events_create",
              name: "Create Events",
              description: "Create events",
              resource: "events",
              action: "create",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
            {
              id: "perm_events_update",
              name: "Update Events",
              description: "Update own events",
              resource: "events",
              action: "update",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          ],
        },
      ],
      updated_at: "2025-01-14T16:40:00Z",
    },
        {
      account_status: "active",
      admin_remark: "Auto-approved",
      approved_at: "2025-01-14T16:40:00Z",
      country_code: "+977",
      created_at: "2025-01-14T15:10:00Z",
      created_by: "system",
      email: "priya.adhikari@example.com",
      first_name: "Priya",
      id: "usr_005",
      is_email_verified: true,
      last_name: "Adhikari",
      organizer_id: "org_005",
      organizer_onboarding: {
        business_description: "Wedding and private events",
        business_logo_url: "https://example.com/logo5.png",
        business_name: "Elegant Events",
        created_at: "2025-01-14T15:20:00Z",
        id: "onb_005",
        is_complete: true,
        organizer: "Priya Adhikari",
        organizer_id: "org_005",
        updated_at: "2025-01-14T16:00:00Z",
      },
      organizer_status: "approved",
      phone: "9822233344",
      rejected_at: null,
      roles: [
        {
          id: "role_organizer",
          name: "Organizer",
          description: "Manage own events",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-14T15:30:00Z",
          users: ["usr_005"],
          permissions: [
            {
              id: "perm_events_create",
              name: "Create Events",
              description: "Create events",
              resource: "events",
              action: "create",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
            {
              id: "perm_events_update",
              name: "Update Events",
              description: "Update own events",
              resource: "events",
              action: "update",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          ],
        },
      ],
      updated_at: "2025-01-14T16:40:00Z",
    },
        {
      account_status: "active",
      admin_remark: "Auto-approved",
      approved_at: "2025-01-14T16:40:00Z",
      country_code: "+977",
      created_at: "2025-01-14T15:10:00Z",
      created_by: "system",
      email: "priya.adhikari@example.com",
      first_name: "Priya",
      id: "usr_005",
      is_email_verified: true,
      last_name: "Adhikari",
      organizer_id: "org_005",
      organizer_onboarding: {
        business_description: "Wedding and private events",
        business_logo_url: "https://example.com/logo5.png",
        business_name: "Elegant Events",
        created_at: "2025-01-14T15:20:00Z",
        id: "onb_005",
        is_complete: true,
        organizer: "Priya Adhikari",
        organizer_id: "org_005",
        updated_at: "2025-01-14T16:00:00Z",
      },
      organizer_status: "approved",
      phone: "9822233344",
      rejected_at: null,
      roles: [
        {
          id: "role_organizer",
          name: "Organizer",
          description: "Manage own events",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-14T15:30:00Z",
          users: ["usr_005"],
          permissions: [
            {
              id: "perm_events_create",
              name: "Create Events",
              description: "Create events",
              resource: "events",
              action: "create",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
            {
              id: "perm_events_update",
              name: "Update Events",
              description: "Update own events",
              resource: "events",
              action: "update",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          ],
        },
      ],
      updated_at: "2025-01-14T16:40:00Z",
    },
        {
      account_status: "active",
      admin_remark: "Auto-approved",
      approved_at: "2025-01-14T16:40:00Z",
      country_code: "+977",
      created_at: "2025-01-14T15:10:00Z",
      created_by: "system",
      email: "priya.adhikari@example.com",
      first_name: "Priya",
      id: "usr_005",
      is_email_verified: true,
      last_name: "Adhikari",
      organizer_id: "org_005",
      organizer_onboarding: {
        business_description: "Wedding and private events",
        business_logo_url: "https://example.com/logo5.png",
        business_name: "Elegant Events",
        created_at: "2025-01-14T15:20:00Z",
        id: "onb_005",
        is_complete: true,
        organizer: "Priya Adhikari",
        organizer_id: "org_005",
        updated_at: "2025-01-14T16:00:00Z",
      },
      organizer_status: "approved",
      phone: "9822233344",
      rejected_at: null,
      roles: [
        {
          id: "role_organizer",
          name: "Organizer",
          description: "Manage own events",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-14T15:30:00Z",
          users: ["usr_005"],
          permissions: [
            {
              id: "perm_events_create",
              name: "Create Events",
              description: "Create events",
              resource: "events",
              action: "create",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
            {
              id: "perm_events_update",
              name: "Update Events",
              description: "Update own events",
              resource: "events",
              action: "update",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          ],
        },
      ],
      updated_at: "2025-01-14T16:40:00Z",
    },
        {
      account_status: "active",
      admin_remark: "Auto-approved",
      approved_at: "2025-01-14T16:40:00Z",
      country_code: "+977",
      created_at: "2025-01-14T15:10:00Z",
      created_by: "system",
      email: "priya.adhikari@example.com",
      first_name: "Priya",
      id: "usr_005",
      is_email_verified: true,
      last_name: "Adhikari",
      organizer_id: "org_005",
      organizer_onboarding: {
        business_description: "Wedding and private events",
        business_logo_url: "https://example.com/logo5.png",
        business_name: "Elegant Events",
        created_at: "2025-01-14T15:20:00Z",
        id: "onb_005",
        is_complete: true,
        organizer: "Priya Adhikari",
        organizer_id: "org_005",
        updated_at: "2025-01-14T16:00:00Z",
      },
      organizer_status: "approved",
      phone: "9822233344",
      rejected_at: null,
      roles: [
        {
          id: "role_organizer",
          name: "Organizer",
          description: "Manage own events",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-14T15:30:00Z",
          users: ["usr_005"],
          permissions: [
            {
              id: "perm_events_create",
              name: "Create Events",
              description: "Create events",
              resource: "events",
              action: "create",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
            {
              id: "perm_events_update",
              name: "Update Events",
              description: "Update own events",
              resource: "events",
              action: "update",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          ],
        },
      ],
      updated_at: "2025-01-14T16:40:00Z",
    },
        {
      account_status: "active",
      admin_remark: "Auto-approved",
      approved_at: "2025-01-14T16:40:00Z",
      country_code: "+977",
      created_at: "2025-01-14T15:10:00Z",
      created_by: "system",
      email: "priya.adhikari@example.com",
      first_name: "Priya",
      id: "usr_005",
      is_email_verified: true,
      last_name: "Adhikari",
      organizer_id: "org_005",
      organizer_onboarding: {
        business_description: "Wedding and private events",
        business_logo_url: "https://example.com/logo5.png",
        business_name: "Elegant Events",
        created_at: "2025-01-14T15:20:00Z",
        id: "onb_005",
        is_complete: true,
        organizer: "Priya Adhikari",
        organizer_id: "org_005",
        updated_at: "2025-01-14T16:00:00Z",
      },
      organizer_status: "approved",
      phone: "9822233344",
      rejected_at: null,
      roles: [
        {
          id: "role_organizer",
          name: "Organizer",
          description: "Manage own events",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-14T15:30:00Z",
          users: ["usr_005"],
          permissions: [
            {
              id: "perm_events_create",
              name: "Create Events",
              description: "Create events",
              resource: "events",
              action: "create",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
            {
              id: "perm_events_update",
              name: "Update Events",
              description: "Update own events",
              resource: "events",
              action: "update",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          ],
        },
      ],
      updated_at: "2025-01-14T16:40:00Z",
    },
        {
      account_status: "active",
      admin_remark: "Auto-approved",
      approved_at: "2025-01-14T16:40:00Z",
      country_code: "+977",
      created_at: "2025-01-14T15:10:00Z",
      created_by: "system",
      email: "priya.adhikari@example.com",
      first_name: "Priya",
      id: "usr_005",
      is_email_verified: true,
      last_name: "Adhikari",
      organizer_id: "org_005",
      organizer_onboarding: {
        business_description: "Wedding and private events",
        business_logo_url: "https://example.com/logo5.png",
        business_name: "Elegant Events",
        created_at: "2025-01-14T15:20:00Z",
        id: "onb_005",
        is_complete: true,
        organizer: "Priya Adhikari",
        organizer_id: "org_005",
        updated_at: "2025-01-14T16:00:00Z",
      },
      organizer_status: "approved",
      phone: "9822233344",
      rejected_at: null,
      roles: [
        {
          id: "role_organizer",
          name: "Organizer",
          description: "Manage own events",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-14T15:30:00Z",
          users: ["usr_005"],
          permissions: [
            {
              id: "perm_events_create",
              name: "Create Events",
              description: "Create events",
              resource: "events",
              action: "create",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
            {
              id: "perm_events_update",
              name: "Update Events",
              description: "Update own events",
              resource: "events",
              action: "update",
              roles: ["Organizer"],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          ],
        },
      ],
      updated_at: "2025-01-14T16:40:00Z",
    },
  ];

  const currentPage = Number(searchParams.get("page")) || 1;
  const searchQuery = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const accountStatusFilter = searchParams.get("account_status") || "";
  const itemsPerPage = 5;

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.push(`/users?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateParams({ page: page.toString() });
    },
    [updateParams],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      updateParams({ search: value, page: "1" });
    },
    [updateParams],
  );

  const handleStatusFilter = useCallback(
    (value: string) => {
      updateParams({ status: value, page: "1" });
    },
    [updateParams],
  );

  const handleAccountStatusFilter = useCallback(
    (value: string) => {
      updateParams({ account_status: value, page: "1" });
    },
    [updateParams],
  );

  // Filter data
  const filteredData = useMemo(() => {
    let result = mockUserData;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.first_name?.toLowerCase().includes(query) ||
          user.last_name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.phone?.includes(query) ||
          user.organizer_onboarding?.business_name
            ?.toLowerCase()
            .includes(query),
      );
    }

    if (statusFilter) {
      result = result.filter(
        (user) =>
          user.organizer_status?.toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    if (accountStatusFilter) {
      result = result.filter(
        (user) =>
          user.account_status?.toLowerCase() ===
          accountStatusFilter.toLowerCase(),
      );
    }

    return result;
  }, [searchQuery, statusFilter, accountStatusFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredData.length);

  return (
    <div className="min-h-screen p-8 space-y-6">

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon
            weight="duotone"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 bg-background/80 backdrop-blur-sm"
          />
        </div>

        <Button
          variant="outline"
          className="gap-2 bg-background/80 backdrop-blur-sm"
        >
          <FunnelIcon weight="duotone" className="h-4 w-4" />
          {/* {t("common.filter")} */}
          Filter
        </Button>
      </div>


      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
<TableHeader>
  <TableRow className="bg-gray-100">
    <TableHead className="w-16">S.N.</TableHead>
    <TableHead>User</TableHead>
    <TableHead>Contact</TableHead>
    <TableHead>Business</TableHead>
    <TableHead>Role</TableHead>
    <TableHead>Organizer Status</TableHead>
    <TableHead>Account Status</TableHead>
    <TableHead>Verified</TableHead>
    <TableHead>Joined</TableHead>
    <TableHead className="text-right">Actions</TableHead>
  </TableRow>
</TableHeader>
<TableBody>
  {paginatedData.length === 0 ? (
    <TableRow>
      <TableCell colSpan={10} className="text-center py-12">
        <div className="flex flex-col items-center gap-2">
          <UserIcon
            weight="duotone"
            className="w-12 h-12 text-muted-foreground/50"
          />
          <p className="text-muted-foreground">No users found</p>
        </div>
      </TableCell>
    </TableRow>
  ) : (
    paginatedData.map((user, index) => {
      const statusConfig = getStatusConfig(user.organizer_status);
      const accountStatusConfig = getAccountStatusConfig(
        user.account_status,
      );
      const StatusIcon = statusConfig.icon;
      const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;

      return (
        <TableRow key={user.id} className="hover:bg-muted/50">
          <TableCell className="font-medium text-muted-foreground">
            {serialNumber}
          </TableCell>
          <TableCell>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">
                {user.first_name} {user.last_name}
              </span>
              <span className="text-sm text-muted-foreground">
                ID: {user.id}
              </span>
            </div>
          </TableCell>
          <TableCell>
            <div className="flex flex-col gap-1">
              <span className="text-sm">{user.email}</span>
              <span className="text-sm text-muted-foreground">
                {formatPhoneNumber(user.country_code, user.phone)}
              </span>
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <BuildingsIcon
                weight="duotone"
                className="w-4 h-4 text-muted-foreground shrink-0"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium truncate max-w-[150px]">
                  {user.organizer_onboarding?.business_name || "N/A"}
                </span>
                {user.organizer_onboarding?.business_description && (
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {user.organizer_onboarding.business_description}
                  </span>
                )}
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div className="flex flex-col gap-1">
              {user.roles.length > 0 ? (
                <>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="gap-1.5 bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                    >
                      <ShieldIcon weight="duotone" className="w-3 h-3" />
                      {user.roles[0].name}
                    </Badge>
                    {user.roles.length > 1 && (
                      <span className="text-xs text-muted-foreground">
                        +{user.roles.length - 1} more
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {user.roles[0].permissions.length} permission(s)
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">No role</span>
              )}
            </div>
          </TableCell>
          <TableCell>
            <Badge
              variant="outline"
              className={`gap-1.5 px-2.5 py-1 rounded-full font-semibold border ${statusConfig.className}`}
            >
              <StatusIcon weight="duotone" className="w-3.5 h-3.5" />
              {statusConfig.label}
            </Badge>
          </TableCell>
          <TableCell>
            <Badge
              variant="outline"
              className={`text-xs font-bold ${accountStatusConfig.className}`}
            >
              {accountStatusConfig.label}
            </Badge>
          </TableCell>
          <TableCell>
            {user.is_email_verified ? (
              <Badge
                variant="secondary"
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100 gap-1"
              >
                <UserCheckIcon weight="duotone" className="w-3.5 h-3.5" />
                Verified
              </Badge>
            ) : (
              <span className="text-sm text-muted-foreground">Unverified</span>
            )}
          </TableCell>
          <TableCell>
            <span className="text-sm">
              {format(new Date(user.created_at), "MMM dd, yyyy")}
            </span>
          </TableCell>
          <TableCell className="text-right">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => router.push(`/users/${user.id}`)}
            >
              <EyeIcon weight="duotone" className="w-4 h-4" />
              View
            </Button>
          </TableCell>
        </TableRow>
      );
    })
  )}
</TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="gap-2"
          >
            <CaretLeftIcon weight="bold" className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNumber = i + 1;
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="icon"
                  onClick={() => handlePageChange(pageNumber)}
                  className="w-10 h-10"
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handlePageChange(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="gap-2"
          >
            Next
            <CaretRightIcon weight="bold" className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Results count */}
      {filteredData.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {startItem}-{endItem} of {filteredData.length} users
        </div>
      )}
    </div>
  );
}
