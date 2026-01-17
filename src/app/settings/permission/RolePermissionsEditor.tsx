"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/lib/adminService";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface RolePermissionsEditorProps {
  selectedRoleId: string;
  onRoleChange: (roleId: string) => void;
}

export function RolePermissionsEditor({ selectedRoleId, onRoleChange }: RolePermissionsEditorProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const queryClient = useQueryClient();

  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch all roles
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: queryKeys.roles.all,
    queryFn: () => adminService.getRoles(),
  });

  // Fetch all permissions
  const { data: allPermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: queryKeys.permissions.all,
    queryFn: () => adminService.getPermissions(),
  });

  // Fetch permissions for selected role
  const { data: rolePermissions, isLoading: rolePermissionsLoading } = useQuery({
    queryKey: queryKeys.roles.permissions(selectedRoleId),
    queryFn: () => adminService.getRolePermissions(selectedRoleId),
    enabled: !!selectedRoleId,
  });

  // Sync selected permissions when role permissions load
  useEffect(() => {
    if (rolePermissions) {
      setSelectedPermissions(new Set(rolePermissions.map((p) => p.name)));
      setHasChanges(false);
    }
  }, [rolePermissions]);

  // Mutation for assigning permissions
  const assignMutation = useMutation({
    mutationFn: (permissionNames: string[]) =>
      adminService.assignRolePermissions(selectedRoleId, { permission_names: permissionNames }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.permissions(selectedRoleId) });
      setHasChanges(false);
      toast.success(t('settings.permissions.roleEditor.saveSuccess', 'Permissions updated successfully'));
    },
    onError: () => {
      toast.error(t('settings.permissions.roleEditor.saveError', 'Failed to update permissions'));
    },
  });

  const handlePermissionToggle = (permissionName: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionName)) {
      newSelected.delete(permissionName);
    } else {
      newSelected.add(permissionName);
    }
    setSelectedPermissions(newSelected);
    setHasChanges(true);
  };

  const handleSave = () => {
    assignMutation.mutate(Array.from(selectedPermissions));
  };

  const handleRoleChange = (roleId: string) => {
    onRoleChange(roleId);
    setHasChanges(false);
  };

  // Group permissions by category
  const groupedPermissions = allPermissions?.reduce((acc, permission) => {
    const category = permission.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, typeof allPermissions>) || {};

  const selectedRole = roles?.find((r) => r.id === selectedRoleId);

  if (rolesLoading || permissionsLoading) {
    return <RolePermissionsEditorSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Role Selector */}
      <div className="glass-card rounded-xl px-6 py-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-6 sticky top-0 bg-white z-10 border-b border-gray-200">
          <div className="space-y-1">
            <h3 className="font-medium text-gray-900">
              {t('settings.permissions.roleEditor.selectRole', 'Select a role')}
            </h3>
            <p className="text-sm text-gray-500">
              {t('settings.permissions.roleEditor.selectRoleDescription', 'Choose a role to manage its permissions')}
            </p>
          </div>
          <Select value={selectedRoleId} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder={t('settings.permissions.roleEditor.selectRole', 'Select a role')} />
            </SelectTrigger>
            <SelectContent>
              {roles?.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  <span className="capitalize">{role.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Permissions Grid */}
        {!selectedRoleId ? (
          <div className="p-8 text-center text-gray-500">
            {t('settings.permissions.roleEditor.noRoleSelected', 'Select a role to manage its permissions')}
          </div>
        ) : rolePermissionsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-8 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Permission Categories */}
            <div className="space-y-3">
              {Object.entries(groupedPermissions).map(([category, permissions]) => (
                <>
                  <div className="bg-gray-50/80 py-3 ">
                    <h4 className="font-medium text-gray-900 capitalize">{t(`settings.permissions.tabs.permissions`, "Permissions")}</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {permissions?.map((permission) => (
                      <label
                        key={permission.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={selectedPermissions.has(permission.name)}
                          onCheckedChange={() => handlePermissionToggle(permission.name)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {permission.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {permission.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              ))}
            </div>

            {/* Save Button */}
            <div className="flex justify-end bg-white pt-4 pb-6 border-t border-gray-200 sticky bottom-0 mt-4">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || assignMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {assignMutation.isPending
                  ? t('common.saving', 'Saving...')
                  : t('common.saveChanges', 'Save Changes')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RolePermissionsEditorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-[200px]" />
          <div className="text-center">
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
