import { api } from "../lib/apiClient";
import { Event, CreateEventData, UpdateEventRequest } from "@/types/event";

/**
 * Event Service
 * Handles all public event-related API calls
 */

export interface EventFilters {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

interface EventResponse {
  events: Event[];
  limit: number;
  page: number;
  total: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

interface ApproveEventResponse {
  success: boolean;
  message: string;
}

export interface EventTierAnalytics {
  tier_id: string;
  tier_name: string;
  price: number;
  currency?: string;
  total_seats: number;
  sold_seats: number;
  available_seats: number;
  revenue: number;
  sales_start?: string;
  sales_end?: string;
  is_active: boolean;
}

export interface EventAnalyticsResponse {
  event_id: string;
  event_title: string;
  event_status: string;
  sales_status: string;
  total_seats: number;
  sold_seats: number;
  available_seats: number;
  total_revenue: number;
  tier_count: number;
  tiers: EventTierAnalytics[];
  created_at: string;
}

interface EventStatusHistory {
  id: string;
  event_id: string;
  from_status: string;
  to_status: string;
  changed_by: string;
  reason?: string;
  created_at: string;
}

export class EventService {
  /**
   * Get all approved public events with pagination and filters
   */
  static async getEvents(
    filters?: EventFilters,
  ): Promise<PaginatedResponse<Event>> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.location) params.append("location", filters.location);
      if (filters.category) params.append("category", filters.category);
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);
      if (filters.min_price)
        params.append("min_price", filters.min_price.toString());
      if (filters.max_price)
        params.append("max_price", filters.max_price.toString());
      if (filters.sort) params.append("sort", filters.sort);
    }

    const query = params.toString();
    const endpoint = `/public/events${query ? `?${query}` : ""}`;

    return await api.get<PaginatedResponse<Event>>(endpoint);
  }

  /**
   * Get event by ID for admin
   */
  static async getEventById(id: string): Promise<Event> {
    return await api.get<Event>(`/admin/events/${id}`, {
      requiresAuth: true,
    });
  }

  /**
   * Get pending event
   */
  static async getPendingtEvent(): Promise<EventResponse> {
    return await api.get<EventResponse>(`/admin/events/pending`, {
      requiresAuth: true,
    });
  }

  /**
   * Get all events for admin with filters
   */
  static async getAdminEvents(filters?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    organizer_id?: string;
    sort?: string;
  }): Promise<EventResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.status) params.append("status", filters.status);
      if (filters.organizer_id)
        params.append("organizer_id", filters.organizer_id);
      if (filters.sort) params.append("sort", filters.sort);
    }

    const query = params.toString();
    return await api.get<EventResponse>(
      `/admin/events${query ? `?${query}` : ""}`,
      {
        requiresAuth: true,
      },
    );
  }

  /**
   * Get featured events (top 3 for homepage)
   */
  static async getFeaturedEvents(limit: number = 3): Promise<Event[]> {
    return await api.get<Event[]>(`/public/events/featured?limit=${limit}`);
  }

  /**
   * Get upcoming events
   */
  static async getUpcomingEvents(filters?: {
    page?: number;
    limit?: number;
    category?: string;
  }): Promise<PaginatedResponse<Event>> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.category) params.append("category", filters.category);
    }

    const query = params.toString();
    const endpoint = `/public/events/upcoming${query ? `?${query}` : ""}`;

    return await api.get<PaginatedResponse<Event>>(endpoint);
  }

  /**
   * Search events
   */
  static async searchEvents(
    query: string,
    filters?: {
      page?: number;
      limit?: number;
      category?: string;
    },
  ): Promise<PaginatedResponse<Event>> {
    const params = new URLSearchParams({ q: query });

    if (filters) {
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.category) params.append("category", filters.category);
    }

    return await api.get<PaginatedResponse<Event>>(
      `/public/events/search?${params.toString()}`,
    );
  }

  /**
   * Get events by category
   */
  static async getEventsByCategory(
    category: string,
    filters?: {
      page?: number;
      limit?: number;
    },
  ): Promise<PaginatedResponse<Event>> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
    }

    const query = params.toString();
    const endpoint = `/public/events/category/${category}${query ? `?${query}` : ""}`;

    return await api.get<PaginatedResponse<Event>>(endpoint);
  }

  /**
   * Approve or reject an event
   */
  static async approveEvent(payload: {
    eventId: string;
    admin_remark: string;
    status: string;
    commission_rate: number;
  }): Promise<ApproveEventResponse> {
    return await api.put<ApproveEventResponse>(
      `/admin/events/${payload.eventId}/status`,
      {
        admin_remark: payload.admin_remark,
        status: payload.status,
        commission_rate: payload.commission_rate,
      },
      {
        requiresAuth: true,
      },
    );
  }

  /**
   * Reject an event
   */
  static async rejectEvent(
    eventId: string,
    data: { adminRemark: string },
  ): Promise<ApproveEventResponse> {
    return await api.put<ApproveEventResponse>(
      `/admin/events/${eventId}/status`,
      {
        admin_remark: data.adminRemark,
        status: "rejected",
        commission_rate: 0,
      },
      {
        requiresAuth: true,
      },
    );
  }

  /**
   * Toggle event featured status
   */
  static async toggleFeatured(
    eventId: string,
    isFeatured: boolean,
  ): Promise<Event> {
    return await api.put<Event>(
      `/admin/events/${eventId}/featured`,
      { is_featured: isFeatured },
      { requiresAuth: true, showSuccessToast: true },
    );
  }

  /**
   * Cancel an event
   */
  static async cancelEvent(eventId: string, reason: string): Promise<Event> {
    return await api.put<Event>(
      `/admin/events/${eventId}/cancel`,
      { cancellation_reason: reason },
      { requiresAuth: true },
    );
  }

  /**
   * Delete an event (soft delete)
   */
  static async deleteEvent(eventId: string): Promise<void> {
    return await api.delete<void>(`/admin/events/${eventId}`, {
      requiresAuth: true,
    });
  }

  /**
   * Get event analytics for all events
   */
  static async getEventAnalytics(filters?: {
    page?: number;
    limit?: number;
  }): Promise<EventAnalyticsResponse> {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const query = params.toString();
    return await api.get<EventAnalyticsResponse>(
      `/admin/events/analytics${query ? `?${query}` : ""}`,
      { requiresAuth: true },
    );
  }
  /**
   * Get single event ticket analytics
   * Uses the global admin analytics endpoint filtered by event ID
   */
  static async getEventAnalyticsById(
    eventId: string,
  ): Promise<EventAnalyticsResponse | null> {
    const response = await api.get<EventAnalyticsResponse>(
      `/admin/events/${eventId}/analytics`,
      { requiresAuth: true },
    );
    // return response.analytics && response.analytics.length > 0 ? response.analytics[0] : null;
    return response;
  }

  /**
   * Get event status change history
   */
  static async getStatusHistory(
    eventId: string,
  ): Promise<EventStatusHistory[]> {
    return await api.get<EventStatusHistory[]>(
      `/admin/events/${eventId}/status-history`,
      { requiresAuth: true },
    );
  }

  /**
   * Create a new event (Admin)
   * Uses multipart/form-data for file upload support
   */
  static async createEvent(data: CreateEventData): Promise<Event> {
    const formData = this.createEventFormData(data);
    return await api.postFormData<Event>("/admin/events", formData, {
      requiresAuth: true,
      showSuccessToast: true,
      successMessage: "Event created successfully",
    });
  }

  /**
   * Update an existing event (Admin)
   * Uses JSON body as per admin API specification
   */
  static async updateEvent(
    id: string,
    data: UpdateEventRequest,
  ): Promise<Event> {
    // Admin update uses JSON body (not FormData)
    const payload: Record<string, unknown> = {};

    if (data.title) payload.title = data.title;
    if (data.description) payload.description = data.description;
    if (data.category && data.category.length > 0) {
      payload.category = data.category.join(",");
    }
    if (data.venue_name) payload.venue_name = data.venue_name;
    if (data.address) payload.address = data.address;
    if (data.start_date) payload.start_date = data.start_date;
    if (data.end_date) payload.end_date = data.end_date;
    if (data.timezone) payload.timezone = data.timezone;
    if (data.capacity !== undefined) payload.capacity = data.capacity;
    if (data.price !== undefined) payload.price = data.price;
    if (data.commission_rate !== undefined)
      payload.commission_rate = data.commission_rate;
    if (data.tiers) payload.tiers = data.tiers;
    if (data.status) payload.status = data.status;

    // Handle banner_image - if it's a File, we need to use FormData
    if (data.banner_image instanceof File) {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(
            key,
            typeof value === "object" ? JSON.stringify(value) : String(value),
          );
        }
      });
      formData.append("banner_image", data.banner_image);
      return await api.putFormData<Event>(`/admin/events/${id}`, formData, {
        requiresAuth: true,
        showSuccessToast: true,
        successMessage: "Event updated successfully",
      });
    }

    return await api.put<Event>(`/admin/events/${id}`, payload, {
      requiresAuth: true,
      showSuccessToast: true,
      successMessage: "Event updated successfully",
    });
  }

  /**
   * Helper to create FormData from event data
   */
  private static createEventFormData(data: CreateEventData): FormData {
    const formData = new FormData();

    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);

    if (data.banner_image) {
      formData.append("banner_image", data.banner_image);
    }

    if (data.category && data.category.length > 0) {
      formData.append("category", data.category.join(","));
    }

    formData.append("venue_name", data.venue_name);
    formData.append("address", data.address);
    formData.append("start_date", data.start_date);
    formData.append("end_date", data.end_date);
    if (data.timezone) formData.append("timezone", data.timezone);
    formData.append("capacity", data.capacity.toString());
    formData.append("price", data.price.toString());

    if (data.commission_rate !== undefined) {
      formData.append("commission_rate", data.commission_rate.toString());
    }

    if (data.tiers) {
      formData.append("tiers", data.tiers);
    }

    return formData;
  }
}
