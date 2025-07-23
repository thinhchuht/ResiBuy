import axiosClient from "./base.api";

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
    endDate?: string
  ) => {
    const params: Record<string, unknown> = {
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
  updateOrder: async (
    userId: string,
    orderId: string,
    shippingAddressId: string,
    note: string
  ) => {
    const body = {
      userId,
      orderId,
      shippingAddressId,
      note,
    };
    const response = await axiosClient.put(`/api/order`, body);
    return response.data;
  },
  updateOrderSatus: async (
    userId: string,
    orderId: string,
    orderStatus: string,
    reason: string
  ) => {
    const body = {
      userId,
      orderId,
      orderStatus,
      reason
    }
    const response = await axiosClient.put(`/api/order/order-status`, body);
    return response.data;
  },
};

export default orderApi;
