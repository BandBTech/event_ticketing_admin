"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminService } from "@/lib/adminService";
import { ShieldCheck, Users, Settings } from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { RolesTable } from "./RolesTable";
import { RolePermissionsEditor } from "./RolePermissionsEditor";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";

export default function PermissionSettingsPage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);

  // Get tab and roleId from URL params
  const tabParam = searchParams.get("tab") || "roles";
  const roleIdParam = searchParams.get("role") || "";

  const handleInitializeSystem = async () => {
    setIsLoading(true);
    try {
      await adminService.initializeSystemPermissions()
    } catch (error) {
      console.error("Failed to initialize system permissions", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    // Clear role param if not on role-permissions tab
    if (tab !== "role-permissions") {
      params.delete("role");
    }
    router.push(`/settings/permission?${params.toString()}`);
  };

  // Handle role selection from RolesTable - navigate to role-permissions tab with role
  const handleRoleSelect = (roleId: string) => {
    const params = new URLSearchParams();
    params.set("tab", "role-permissions");
    params.set("role", roleId);
    router.push(`/settings/permission?${params.toString()}`);
  };

  // Handle role change in RolePermissionsEditor
  const handleRoleChange = (roleId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (roleId) {
      params.set("role", roleId);
    } else {
      params.delete("role");
    }
    router.push(`/settings/permission?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">
            {t('settings.permissions.title', 'Permissions & Roles')}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {t('settings.permissions.subtitle', 'Manage system permissions and role assignments')}
          </p>
        </div>
        {/* <PermissionGuard permission={PERMISSIONS.PERMISSION_MANAGE}> */}
          <Button
            onClick={handleInitializeSystem}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2 bg-white! hover:bg-gray-100!"
          >
            <Settings className="w-4 h-4" />
            {isLoading
              ? t('settings.permissions.initialize.loading', 'Initializing...')
              : t('settings.permissions.initialize.button', 'Initialize System')}
          </Button>
        {/* </PermissionGuard> */}
      </div>

      {/* Tabs */}
      <Tabs value={tabParam} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
          {/* <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            <span className="hidden sm:inline">
              {t('settings.permissions.tabs.permissions', 'Permissions')}
            </span>
            <span className="sm:hidden">Perms</span>
          </TabsTrigger> */}
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">
              {t('settings.permissions.tabs.roles', 'Roles')}
            </span>
            <span className="sm:hidden">Roles</span>
          </TabsTrigger>
          <TabsTrigger value="role-permissions" className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">
              {t('settings.permissions.tabs.rolePermissions', 'Role Permissions')}
            </span>
            <span className="sm:hidden">Assign</span>
          </TabsTrigger>
        </TabsList>

        {/* Permissions Tab */}
        {/* <TabsContent value="permissions" className="mt-6">
          <PermissionsTable />
        </TabsContent> */}

        {/* Roles Tab */}
        <TabsContent value="roles" className="mt-6">
          <RolesTable onRoleSelect={handleRoleSelect} />
        </TabsContent>

        {/* Role Permissions Tab */}
        <TabsContent value="role-permissions" className="mt-6">
          <RolePermissionsEditor
            selectedRoleId={roleIdParam}
            onRoleChange={handleRoleChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
