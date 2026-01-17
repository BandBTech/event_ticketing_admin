"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/lib/adminService";
import { queryKeys } from "@/lib/queryKeys";
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

interface RolesTableProps {
  onRoleSelect?: (roleId: string) => void;
}

export function RolesTable({ onRoleSelect }: RolesTableProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const { data: roles, isLoading, error } = useQuery({
    queryKey: queryKeys.roles.all,
    queryFn: () => adminService.getRoles(),
  });

  if (isLoading) {
    return <RolesTableSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {t('common.error', 'Something went wrong')}
      </div>
    );
  }

  if (!roles || roles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t('settings.permissions.empty.roles', 'No roles found')}
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
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
          {roles.map((role) => (
            <TableRow
              key={role.id}
              className="hover:bg-gray-50/50 cursor-pointer"
              onClick={() => onRoleSelect?.(role.id)}
            >
              <TableCell className="font-medium text-gray-900 capitalize">
                {role.name}
              </TableCell>
              <TableCell className="text-gray-600 text-sm">
                {role.description}
              </TableCell>
              <TableCell className="text-center">
                {role.is_system ? (
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                    System
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500">
                    Custom
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-gray-500 text-sm">
                {format(new Date(role.created_at), 'MMM d, yyyy')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function RolesTableSkeleton() {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
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
