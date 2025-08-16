import axiosClient from "./base.api";
import { OrderStatus } from "../types/models";
const orderUrl = "/api/order";

const orderApi = {
  getAll: async (
    orderStatus = "None",
    paymentMethod = "None",
    paymentStatus = "None",
    storeId?: string,
    userId?: string,
    shipperId?: string,
    pageNumber = 1,
    pageSize = 10,
    startDate?: string,
    endDate?: string,
    keyword?: string
  ) => {
    const params: Record<string, unknown> = {
      keyword,
      orderStatus,
      paymentMethod,
      paymentStatus,
      storeId,
      userId,
      shipperId,
      pageNumber,
      pageSize,
    };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await axiosClient.get(`${orderUrl}`, { params });
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await axiosClient.get(`${orderUrl}/${id}`);
    if (response.data.code !== 0) {
      throw new Error(response.data.message || "Lỗi khi lấy chi tiết đơn hàng");
    }
    return response.data.data;
  },

  updateOrder: async (userId: string, orderId: string, shippingAddressId: string, note: string) => {
    const body = {
      userId,
      orderId,
      shippingAddressId,
      note,
    };
    const response = await axiosClient.put(`/api/order`, body);
    return response.data.data;
  },
  updateOrderSatus: async (userId: string, orderId: string, orderStatus: string, reason: string) => {
    const body = {
      userId,
      orderId,
      orderStatus,
      reason,
    };
    const response = await axiosClient.put(`/api/order/order-status`, body);
    return response.data;
  },

  updateOrderStatusShip: async (orderId: string, orderStatus: string, shipperId: string) => {
    const body = {
      orderId,
      orderStatus,
      shipperId,
    };
    const response = await axiosClient.put(`/api/order/order-status`, body);
    return response.data;
  },

  countOrder: async (params: { shipperId?: string; storeId?: string; userId?: string; status?: OrderStatus | string }) => {
    const response = await axiosClient.get(`${orderUrl}/count`, { params });
    return response.data;
  },

  getTotalShippingFeeshipper: async (params: { shipperId: string; startDate?: string; endDate?: string }) => {
    const response = await axiosClient.get(`${orderUrl}/total-shipping-fee`, {
      params,
    });
    return response.data;
  },
  getTotalOrderAmount: async (params: { userId?: string; storeId?: string }) => {
    const response = await axiosClient.get(`${orderUrl}/total-amount`, { params });
    return response.data;
  },

  getOverviewStats: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await axiosClient.get(`${orderUrl}/overview-stats`, { params });
    if (response.data.code !== 0) {
      throw new Error(response.data.message || "Lỗi khi lấy thống kê đơn hàng");
    }
    return response.data.data;
  },
};

export default orderApi;
