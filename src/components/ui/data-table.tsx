import React from "react";
import { flexRender, Table as TanstackTable, Row } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData> {
  table: TanstackTable<TData>;
  columns: { id?: string }[];
  isLoading?: boolean;
  loadingMessage?: string;
  emptyIcon?: React.ReactNode;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  showSerialNumber?: boolean;
  serialNumberStart?: number;
  className?: string;
  onRowClick?: (row: Row<TData>, event: React.MouseEvent) => void;
  enableHorizontalScroll?: boolean;
  // Render function for expandable sub-rows
  renderSubRow?: (row: Row<TData>) => React.ReactNode;
}

export function DataTable<TData>({
  table,
  columns,
  isLoading = false,
  emptyIcon,
  emptyMessage = "No results found",
  emptyAction,
  showSerialNumber = false,
  serialNumberStart = 1,
  className,
  onRowClick,
  enableHorizontalScroll = true,
  renderSubRow,
}: DataTableProps<TData>) {
  const columnCount = columns.length + (showSerialNumber ? 1 : 0);
  const tableContent = (
    <Table className={className}>
      <TableHeader className="bg-gray-200">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {showSerialNumber && <TableHead className="w-12">S.N</TableHead>}
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} className="max-w-[200px]">
                {header.isPlaceholder
                  ? null
                  : flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody className="bg-white">
        {isLoading ? (
          Array.from({ length: 10 }).map((_, rowIndex) => (
            <TableRow key={`skeleton-row-${rowIndex}`}>
              {showSerialNumber && (
                <TableCell className="w-6 px-3 py-3.5">
                  <Skeleton className="bg-muted h-4 min-w-4 w-4 my-0.5" />
                </TableCell>
              )}
              {columns.map((_, colIndex) => (
                <TableCell key={`skeleton-col-${colIndex}`} className="px-3 py-3.5 max-w-[200px]">
                  <Skeleton className="bg-muted h-4 min-w-4 w-full my-0.5" />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row, index) => (
            <React.Fragment key={row.id}>
              <TableRow
                onClick={(e) => {
                  // Don't trigger row click if clicking on interactive elements
                  const target = e.target as HTMLElement;
                  if (target.closest('button, input, [role="checkbox"], [data-no-row-click]')) {
                    return;
                  }
                  onRowClick?.(row, e);
                }}
                className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
              >
                {showSerialNumber && (
                  <TableCell className="font-medium">
                    {serialNumberStart + index}
                  </TableCell>
                )}
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="max-w-[200px] truncate"
                    title={
                      typeof cell.getValue() === "string"
                        ? String(cell.getValue())
                        : undefined
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
              {renderSubRow?.(row)}
            </React.Fragment>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columnCount} className="h-24 text-center">
              <div className="flex flex-col px-4 py-8 items-center gap-2">
                {emptyIcon}
                <span className="text-sm text-gray-500">{emptyMessage}</span>
                {emptyAction}
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  if (enableHorizontalScroll) {
    return <div className="w-full overflow-x-auto print:overflow-visible flex-1">{tableContent}</div>;
  }

  return tableContent;
}
