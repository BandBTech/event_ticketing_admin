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