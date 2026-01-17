"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/lib/adminService";
import { queryKeys } from "@/lib/queryKeys";
import { Permission } from "@/types/permissions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";

export function PermissionsTable() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const { data: permissions, isLoading, error } = useQuery({
    queryKey: queryKeys.permissions.all,
    queryFn: () => adminService.getPermissions(),
  });

  if (isLoading) {
    return <PermissionsTableSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {t('common.error', 'Something went wrong')}
      </div>
    );
  }

  if (!permissions || permissions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t('settings.permissions.empty.permissions', 'No permissions found')}
      </div>
    );
  }

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = permission.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedPermissions).map(([category, perms]) => (
        <div key={category} className="glass-card rounded-xl overflow-hidden">
          <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100">
            <h3 className="font-medium text-gray-900 capitalize">{category}</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[200px]">
                  {t('settings.permissions.table.name', 'Name')}
                </TableHead>
                <TableHead>
                  {t('settings.permissions.table.description', 'Description')}
                </TableHead>
                <TableHead className="w-[100px] text-center">
                  {t('settings.permissions.table.system', 'System')}
                </TableHead>
                <TableHead className="w-[120px]">
                  {t('settings.permissions.table.created', 'Created')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perms.map((permission) => (
                <TableRow key={permission.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-medium text-gray-900">
                    {permission.name}
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {permission.description}
                  </TableCell>
                  <TableCell className="text-center">
                    {permission.is_system ? (
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                        System
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        Custom
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {format(new Date(permission.created_at), 'MMM d, yyyy')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}

function PermissionsTableSkeleton() {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100">
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
