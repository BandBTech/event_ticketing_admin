import { boolean } from "zod";

export type OrganizerStatus = "inactive" | "active" | "pending" | "rejected";
export type AccountStatus = "active" | "inactive" | "suspended" | "blocked";

export interface BillingFilters {
  user_id: string;
  event_id: string;
  start_date: Date | undefined;
  end_date: Date | undefined;
  // dateRange: {
  //   from: Date | undefined;
  //   to: Date | undefined;
  // };
}

export interface Logs {
    id: string;
    action:string;
    entity_type: string;
    entity_id: string;
    actor: {
      id: string;
      name: string;
      email: string;
    };
    event: {
      id: string;
      title: string;
      banner_image: string;
      organizer_id: string;
    };
    timestamp: string;
    created_at: string;
}

export interface AuditLogsListResponse {
  pagination: {
    has_next: boolean;
    has_prev: boolean;
    limit: number;
    page: number;
    total: number;
    total_pages: number;
  };
  logs: Logs[];
}

export const getDefaultFilters = (): BillingFilters => ({
  user_id: "",
  event_id: "",
  start_date: undefined,
  end_date: undefined,
  // dateRange: getDefaultDateRange(),
});
