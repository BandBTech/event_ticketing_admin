export interface Event {
  id: string;
  title: string;
  description: string;
  banner_image: string;
  category: string[];
  venue_name: string;
  address: string;
  location: string;
  start_date: string;
  end_date: string;  
  timezone: string;
  capacity: number;
  available: number;
  price: number;
  commission_rate: number;
  status: "draft" | "pending" | "approved" | "rejected" | "live" | "cancelled" | "held";
  sales_status: "active" | "inactive" | "soldout";
  is_featured: boolean;
  is_cancelled: boolean;
  organizer_id: string;
  admin_remark: string;
  created_at: string;
  updated_at: string;
  tiers?: EventTier[];
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  capacity: number;
  timezone: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface TicketType {
  id: string;
  name: TicketCategory;
  price: number;
  quantity: number;
  sold: number;
  description?: string;
  gstPercentage: number;
  salesStartDate: string;
  salesEndDate: string;
  isActive: boolean;
}

export interface EventCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export type TicketCategory = 'General' | 'Premium' | 'VIP' | 'VVIP';

export type EventStatus = 'Draft' | 'Published' | 'On Sale' | 'Sale on Hold' | 'Sold Out' | 'Closed' | 'Cancelled';

export interface EventFilters {
  search?: string;
  categories?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  location?: string;
  status?: EventStatus[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EventsResponse {
  events: Event[];
  pagination: PaginationInfo;
}

export interface EventStatusHistory {
  id: string;
  event_id: string;
  old_status: string;
  new_status: string;
  status_type: string;
  remark?: string;
  changed_by: string;
  changed_by_name: string;
  created_at: string;
}

// Event Tier Types
export interface EventTier {
  id: string;
  tier_name: string;
  tier_template_id?: string;
  price: number;
  quantity: number;
  gst?: number;
  sales_start?: string;
  sales_end?: string;
  currency?: string;
  sort_order?: number;
  available?: number;
  sold?: number;
  is_active?: boolean;
}

export interface CreateEventTierRequest {
  tier_template_id?: string;
  tier_name: string;
  price: number;
  quantity: number;
  currency?: string;
  gst?: number;
  sales_start?: string;
  sales_end?: string;
  sort_order?: number;
}

// Create/Update Event Data (Admin)
export interface CreateEventData {
  title: string;
  description?: string;
  banner_image?: File;
  category: string[];
  venue_name: string;
  address: string;
  start_date: string;
  end_date: string;
  timezone?: string;
  capacity: number;
  price: number;
  commission_rate?: number;
  tiers: string; // JSON string of CreateEventTierRequest[]
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  banner_image?: string | File;
  category?: string[];
  venue_name?: string;
  address?: string;
  start_date?: string;
  end_date?: string;
  timezone?: string;
  capacity?: number;
  price?: number;
  commission_rate?: number;
  tiers?: CreateEventTierRequest[];
  status?: string;
}

// TierTemplate for organizer compatibility
export interface TierTemplate {
  id: string;
  template_name: string;
  description?: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}