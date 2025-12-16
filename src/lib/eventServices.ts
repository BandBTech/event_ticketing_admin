import { api } from './apiClient';
import { Event } from '@/types/event';

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
}

interface ApproveEventResponse {
  success: boolean;
  message: string;
}

export class EventService {
  /**
   * Get all approved public events with pagination and filters
   */
  static async getEvents(filters?: EventFilters): Promise<PaginatedResponse<Event>> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.location) params.append('location', filters.location);
      if (filters.category) params.append('category', filters.category);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.min_price) params.append('min_price', filters.min_price.toString());
      if (filters.max_price) params.append('max_price', filters.max_price.toString());
      if (filters.sort) params.append('sort', filters.sort);
    }
    
    const query = params.toString();
    const endpoint = `/public/events${query ? `?${query}` : ''}`;
    
    return await api.get<PaginatedResponse<Event>>(endpoint);
  }

  /**
   * Get event by ID
   */
  static async getEventById(id: string): Promise<Event> {
    return await api.get<Event>(`/public/events/${id}`);
  }
  
  /**
   * Get pending event
   */
  static async getPendingtEvent(): Promise<EventResponse> {
    return await api.get<EventResponse>(`/admin/events/pending`, {
      requiresAuth: true
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
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.organizer_id) params.append('organizer_id', filters.organizer_id);
      if (filters.sort) params.append('sort', filters.sort);
    }

    const query = params.toString();
    return await api.get<EventResponse>(`/admin/events${query ? `?${query}` : ''}`, {
      requiresAuth: true
    });
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
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.category) params.append('category', filters.category);
    }
    
    const query = params.toString();
    const endpoint = `/public/events/upcoming${query ? `?${query}` : ''}`;
    
    return await api.get<PaginatedResponse<Event>>(endpoint);
  }

  /**
   * Search events
   */
  static async searchEvents(query: string, filters?: {
    page?: number;
    limit?: number;
    category?: string;
  }): Promise<PaginatedResponse<Event>> {
    const params = new URLSearchParams({ q: query });
    
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.category) params.append('category', filters.category);
    }
    
    return await api.get<PaginatedResponse<Event>>(`/public/events/search?${params.toString()}`);
  }

  /**
   * Get events by category
   */
  static async getEventsByCategory(category: string, filters?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Event>> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
    }
    
    const query = params.toString();
    const endpoint = `/public/events/category/${category}${query ? `?${query}` : ''}`;
    
    return await api.get<PaginatedResponse<Event>>(endpoint);
  }


  static async approveEvent(payload: {
    eventId: string;
    admin_remark: string;
    status: string;
    commission_rate: number;
  }): Promise<ApproveEventResponse> {
    return await api.put<ApproveEventResponse>(
      `/admin/events/${payload.eventId}/approval`, 
      {
        admin_remark: payload.admin_remark,
        // status: payload.status,
        commission_rate: payload.commission_rate
      },
      {
        requiresAuth: true,
      }
    );
  }
  }

