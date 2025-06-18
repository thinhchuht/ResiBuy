/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosClient from "./base.api";

export interface CheckoutRequest {
  orders: OrderRequest[];
  totalAmount: number;
  paymentMethod: string;
  userId: string;
}

export interface OrderRequest {
  voucherId?: string;
  totalPrice: number;
  items: OrderItemRequest[];
  roomId: string;
  areaId: string;
  buildingId: string;
  paymentMethod: string;
  note?: string;
}

export interface OrderItemRequest {
  quantity: number;
  price: number;
  productDetailId: string;
}

export interface SessionStatistics {
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
  oldestSessionAge: string;
  newestSessionAge: string;
  memoryUsageEstimate: number;
}

const vnPayUrl = "/api/vnpay";
const vnPayApi = {
  getPaymentUrl: async (amount: number, orderId: string, orderInfo: string) => {
    try {
      const response = await axiosClient.post(vnPayUrl + "/create-payment", { amount, orderId, orderInfo });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("Createpayment failed:", error);
      return { success: false, error };
    }
  },

  createPaymentWithSession: async (checkoutRequest: CheckoutRequest) => {
    try {
      const response = await axiosClient.post(vnPayUrl + "/create-payment-with-session", checkoutRequest);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("Create payment with session failed:", error);
      return { success: false, error };
    }
  },

  getSessionStatistics: async (): Promise<{ success: boolean; data?: SessionStatistics; error?: any }> => {
    try {
      const response = await axiosClient.get(vnPayUrl + "/session-statistics");
      return { success: true, data: response.data.data };
    } catch (error: any) {
      console.error("Get session statistics failed:", error);
      return { success: false, error };
    }
  },

  verifyPaymentToken: async (token: string) => {
    try {
      const response = await axiosClient.get(`${vnPayUrl}/verify-payment-token?token=${token}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("Verify payment token failed:", error);
      return { success: false, error };
    }
  },

  invalidatePaymentToken: async (token: string) => {
    try {
      await axiosClient.post(`${vnPayUrl}/invalidate-payment-token?token=${token}`);
      return { success: true };
    } catch (error: any) {
      console.error("Invalidate payment token failed:", error);
      return { success: false, error };
    }
  },
};

export default vnPayApi;
