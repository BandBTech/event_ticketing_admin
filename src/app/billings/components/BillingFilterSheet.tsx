// import React, { useCallback } from "react";
// import { differenceInMonths, isBefore, startOfDay } from "date-fns";
// import { Calendar as CalendarIcon, Filter, X } from "lucide-react";
// import { toast } from "sonner";
// import { format } from "date-fns";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetFooter,
// } from "@/components/ui/sheet";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import {
//   AsyncCombobox,
//   AsyncComboboxOption,
// } from "@/components/ui/async-combobox";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { cn } from "@/lib/utils";
// import { adminService } from "@/services/adminService";
// import { TimesheetFilters, getDefaultFilters } from "@/types/timesheet-filters";

// interface TimesheetFilterSheetProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   filters: TimesheetFilters;
//   onApplyFilters: (filters: TimesheetFilters) => void;
// }

// export function TimesheetFilterSheet({
//   open,
//   onOpenChange,
//   filters,
//   onApplyFilters,
// }: TimesheetFilterSheetProps) {
//   const [localFilters, setLocalFilters] =
//     React.useState<TimesheetFilters>(filters);
//   const [dateError, setDateError] = React.useState<string | null>(null);

//   React.useEffect(() => {
//     if (open) {
//       setLocalFilters(filters);
//       setDateError(null);
//     }
//   }, [open, filters]);

//   const fetchOrganizers = useCallback(
//     async (search: string): Promise<AsyncComboboxOption[]> => {
//       try {
//         const response = await adminService.getAllEntities("organizers");
//         if (!response || !Array.isArray(response)) return [];

//         const filtered = search
//           ? response.filter((org) =>
//               `${org.name}`.toLowerCase().includes(search.toLowerCase()),
//             )
//           : response;

//         return filtered.map((org) => ({ value: org.id, label: `${org.name}` }));
//       } catch (error) {
//         console.error("Failed to fetch organizers:", error);
//         return [];
//       }
//     },
//     [],
//   );

//   const handleDateChange = (
//     field: "startDate" | "endDate",
//     date: Date | undefined,
//   ) => {
//     const updated = { ...localFilters, [field]: date };
//     setDateError(null);

//     if (updated.startDate && updated.endDate) {
//       if (
//         isBefore(startOfDay(updated.endDate), startOfDay(updated.startDate))
//       ) {
//         setDateError("End date cannot be before start date");
//         return;
//       }
//       if (differenceInMonths(updated.endDate, updated.startDate) > 3) {
//         setDateError("Date range cannot exceed 3 months");
//         toast.error("Date range cannot exceed 3 months");
//         return;
//       }
//     }

//     setLocalFilters(updated);
//   };

//   const handleApply = () => {
//     onApplyFilters(localFilters);
//     onOpenChange(false);
//   };

//   const handleClear = () => {
//     const defaultFilters = getDefaultFilters();
//     setLocalFilters(defaultFilters);
//     onApplyFilters(defaultFilters);
//   };

//   const activeFilterCount = React.useMemo(() => {
//     let count = 0;
//     if (localFilters.startDate) count++;
//     if (localFilters.endDate) count++;
//     if (localFilters.organizerId) count++;
//     if (localFilters.status !== "all") count++;
//     return count;
//   }, [localFilters]);

//   return (
//     <Sheet open={open} onOpenChange={onOpenChange}>
//       <SheetContent
//         side="right"
//         className="w-[450px] sm:max-w-[450px] flex flex-col bg-[#f5f7f8]"
//       >
//         <SheetHeader>
//           <SheetTitle className="flex items-center gap-2">
//             <Filter className="h-5 w-5" />
//             Filter Bills
//           </SheetTitle>
//         </SheetHeader>

//         <div className="flex-1 overflow-y-auto p-4 space-y-6">
//           {/* Date Range */}
//           <div className="space-y-2">
//             <div className="grid grid-cols-2 gap-4">
//               {/* Start Date */}
//               <div className="space-y-2">
//                 <Label>Start Date</Label>
//                 <Popover>
//                   <PopoverTrigger asChild>
//                     <Button
//                       variant="outline"
//                       className={cn(
//                         "w-full justify-start text-left font-normal",
//                         !localFilters.startDate && "text-muted-foreground",
//                       )}
//                     >
//                       <CalendarIcon className="mr-2 h-4 w-4" />
//                       {localFilters.startDate ? (
//                         format(localFilters.startDate, "LLL dd, y")
//                       ) : (
//                         <span>Pick a date</span>
//                       )}
//                     </Button>
//                   </PopoverTrigger>
//                   <PopoverContent className="w-auto p-0" align="start">
//                     <Calendar
//                       mode="single"
//                       selected={localFilters.startDate}
//                       onSelect={(date) => handleDateChange("startDate", date)}
//                       captionLayout="dropdown"
//                       fromYear={2010}
//                       toYear={new Date().getFullYear()}
//                       toDate={new Date()}
//                       disabled={{ after: new Date() }}
//                       initialFocus
//                     />
//                   </PopoverContent>
//                 </Popover>
//               </div>

//               {/* End Date */}
//               <div className="space-y-2">
//                 <Label>End Date</Label>
//                 <Popover>
//                   <PopoverTrigger asChild>
//                     <Button
//                       variant="outline"
//                       className={cn(
//                         "w-full justify-start text-left font-normal",
//                         !localFilters.endDate && "text-muted-foreground",
//                         dateError && "text-destructive border-destructive",
//                       )}
//                     >
//                       <CalendarIcon className="mr-2 h-4 w-4" />
//                       {localFilters.endDate ? (
//                         format(localFilters.endDate, "LLL dd, y")
//                       ) : (
//                         <span>Pick a date</span>
//                       )}
//                     </Button>
//                   </PopoverTrigger>
//                   <PopoverContent className="w-auto p-0" align="start">
//                     <Calendar
//                       mode="single"
//                       selected={localFilters.endDate}
//                       onSelect={(date) => handleDateChange("endDate", date)}
//                       captionLayout="dropdown"
//                       fromYear={2010}
//                       toYear={new Date().getFullYear()}
//                       toDate={new Date()}
//                       disabled={{ after: new Date() }}
//                       initialFocus
//                     />
//                   </PopoverContent>
//                 </Popover>
//                 {dateError && (
//                   <p className="text-xs text-destructive">{dateError}</p>
//                 )}
//               </div>
//             </div>
//             <p className="text-xs text-muted-foreground">
//               Maximum range: 3 months
//             </p>
//           </div>

//           {/* Organizer */}
//           <div className="space-y-2">
//             <Label>Organizer</Label>
//             <AsyncCombobox
//               queryKey={["filter", "organizers"]}
//               value={localFilters.organizerId ?? ""}
//               onValueChange={(val) =>
//                 setLocalFilters((prev) => ({ ...prev, organizerId: val }))
//               }
//               fetchOptions={fetchOrganizers}
//               placeholder="Select organizer"
//               searchPlaceholder="Search organizers..."
//               emptyText="No organizers found"
//               className="w-full text-sm h-9 justify-between px-3!"
//               debounceMs={300}
//             />
//           </div>

//           {/* Status */}
//           <div className="space-y-2">
//             <Label>Status</Label>
//             <Select
//               value={localFilters.status}
//               onValueChange={(value) =>
//                 setLocalFilters((prev) => ({ ...prev, status: value }))
//               }
//             >
//               <SelectTrigger className="w-full text-sm h-9 justify-between px-3!">
//                 <SelectValue placeholder="Select status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Status</SelectItem>
//                 <SelectItem value="PENDING">Pending</SelectItem>
//                 <SelectItem value="PAID">Paid</SelectItem>
//                 <SelectItem value="OVERDUE">Overdue</SelectItem>
//                 <SelectItem value="REJECTED">Rejected</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         <SheetFooter className="flex-row gap-2">
//           <Button variant="outline" onClick={handleClear} className="flex-1">
//             <X className="mr-2 h-4 w-4" />
//             Clear
//           </Button>
//           <Button
//             onClick={handleApply}
//             disabled={!!dateError}
//             className="flex-1 w-full sm:w-auto gap-2 bg-primary hover:bg-primary/80 text-primary-foreground shadow-sm transition-all ease-out duration-300 active:scale-95"
//           >
//             <Filter className="mr-2 h-4 w-4" />
//             Apply Filters
//             {activeFilterCount > 0 && (
//               <span className="ml-2 bg-amber-700 text-white text-xs px-1.5 py-0.5 rounded-full">
//                 {activeFilterCount}
//               </span>
//             )}
//           </Button>
//         </SheetFooter>
//       </SheetContent>
//     </Sheet>
//   );
// }

import React from 'react'

const BillingFilterSheet = () => {
  return (
    <div>BillingFilterSheet</div>
  )
}

export default BillingFilterSheet