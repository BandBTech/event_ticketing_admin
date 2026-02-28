import { Option } from "@/components/ui/multiple-selector";
import { subDays } from "date-fns";

export interface TimesheetFilters {
  employeeIds: string[];
  employeeLabels: Option[];
  customerIds: string[];
  customerLabels: Option[];
  jobTypeIds: string[];
  jobTypeLabels: Option[];
  status: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

// Default date range: last 30 days
export const getDefaultDateRange = () => ({
  from: subDays(new Date(), 30),
  to: new Date(),
});

export const getDefaultFilters = (): TimesheetFilters => ({
  employeeIds: [],
  employeeLabels: [],
  customerIds: [],
  customerLabels: [],
  jobTypeIds: [],
  jobTypeLabels: [],
  status: 'all',
  dateRange: getDefaultDateRange(),
});
