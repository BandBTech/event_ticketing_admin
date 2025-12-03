export interface PendingEventsResponse {
  success: boolean;
  message: string;
  data: PendingEventsData;
  timestamp: string;
  request_id: string;
}

export interface PendingEventsData {
  events: PendingEvent[];
  limit: number;
  page: number;
  total: number;
}

export interface PendingEvent {
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
  status: "pending" | "approved" | "rejected";
  sales_status: "active" | "inactive" | "soldout";
  is_featured: boolean;
  is_cancelled: boolean;
  organizer_id: string;
  admin_remark: string;
  created_at: string;
  updated_at: string;
}
