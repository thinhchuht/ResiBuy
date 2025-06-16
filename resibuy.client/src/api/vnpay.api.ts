/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosClient from "./base.api";
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
