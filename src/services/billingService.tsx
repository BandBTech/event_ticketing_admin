import { api } from "../lib/apiClient";
import { API_ENDPOINTS } from "@/app/config/api";
import {
  Bill,
  PaymentBillResponse,
  PaymentBillData,
  CreateBillPayload,
  PaymentHistoryData,
  AddPaymentToBillPayload,
} from "@/types/billings";

export class BillingService {
  /**
   * Create new payment gateway from admin
   */
  static async createBills(data: CreateBillPayload): Promise<Bill> {
    const formData = this.createBillFormData(data);
    return await api.postFormData<Bill>("/admin/payments/bills", formData, {
      requiresAuth: true,
      showSuccessToast: true,
      successMessage: "Bill created successfully",
    });
  }

  /**
   * Create new payment gateway from admin
   */
  static async addPaymentToBills(data: AddPaymentToBillPayload): Promise<Bill> {
    const formData = this.addPaymentToBillFormData(data);
    return await api.postFormData<Bill>(
      `/admin/payments/bills/${data.bill_id}/payments`,
      formData,
      {
        requiresAuth: true,
        showSuccessToast: true,
        successMessage: "Payment added to bill successfully",
      },
    );
  }

  static async getAllBills(filters?: {
    page?: number;
    limit?: number;
    status?: string;
    organizer_id?: string;
    start_date?: Date | undefined;
    end_date?: Date | undefined;
    search?: string;
  }): Promise<PaymentBillData> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.status) params.append("status", filters.status.toString());
      if (filters.organizer_id)
        params.append("organizer_id", filters.organizer_id.toString());
      if (filters.start_date)
        params.append(
          "start_date",
          filters.start_date.toISOString().split("T")[0],
        );

      if (filters.end_date)
        params.append("end_date", filters.end_date.toISOString().split("T")[0]);
      if (filters.search) params.append("search", filters.search);
    }

    const query = params.toString();

    const result = await api.get<PaymentBillData>(
      `${API_ENDPOINTS.GET_ALL_BILLS}${query ? `?${query}` : ""}`,
      {
        requiresAuth: true,
      },
    );

    return result;
  }

  static async getBillsById(id: string): Promise<Bill> {
    const response = await api.get<Bill>(API_ENDPOINTS.GET_BILL_BY_ID(id), {
      requiresAuth: true,
    });
    return response;
  }

  static async getBillHistory(id: string): Promise<PaymentHistoryData[]> {
    const response = await api.get<PaymentHistoryData[]>(
      API_ENDPOINTS.GET_BILL_HISTORY(id),
      {
        requiresAuth: true,
      },
    );
    return response;
  }

  /**
   * Helper to create FormData from event data
   */
  private static createBillFormData(data: CreateBillPayload): FormData {
    const formData = new FormData();
    formData.append("event_id", data.event_id);
    formData.append("organizer_id", data.organizer_id);
    formData.append("payment_method", "cheque");

    return formData;
  }

  /**
   * Helper to create FormData from event data
   */
  private static addPaymentToBillFormData(
    data: AddPaymentToBillPayload,
  ): FormData {
    const formData = new FormData();
    if (data.screenshot) {
      formData.append("screenshot", data.screenshot);
    }

    formData.append("bill_id", data.bill_id);
    formData.append("amount", data.amount.toString());
    formData.append("payment_method", data.payment_method);
    formData.append("payment_ref", data?.payment_ref);
    formData.append("notes", data?.notes);
    if (data.payment_date) {
      formData.append("payment_date", data.payment_date.toISOString());
    }

    return formData;
  }
}
