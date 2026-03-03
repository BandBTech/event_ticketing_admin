import { boolean } from "zod";

export type OrganizerStatus = 'inactive' | 'active' | 'pending' | 'rejected';
export type AccountStatus = 'active' | 'inactive' | 'suspended' | 'blocked';

export interface Logs {
  action: string;
  id: string;
  entity_type: string;
  entity_id: string;
  actor_id: string;
  timestamp: string;
  actor: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    country_code: string;
    is_email_verified: boolean;
    organizer_status: OrganizerStatus;
    account_status: AccountStatus;
    admin_remark: string;
    approved_at: string | null;
    rejected_at: string | null;
    organizer_id: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
  };
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
