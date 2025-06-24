import axiosClient from "./base.api";

const orderUrl = "/api/order";

const orderApi = {
  getAll: async (
    orderStatus = "None",
    paymentMethod = "None",
    paymentStatus = "None",
    userId?: string,
    pageNumber = 1,
    pageSize = 10
  ) => {
    const params = {
      orderStatus,
      paymentMethod,
      paymentStatus,
      userId,
      pageNumber,
      pageSize,
    };
    const response = await axiosClient.get(`${orderUrl}`, { params });
    return response.data.data;
  },
  updateOrder: async (
    userId : string,
    orderId: string,
    shippingAddressId: string,
    note : string,

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
    userId : string,
    orderId: string,
    orderStatus: string
  ) => {
    const body = {
      userId,
      orderId,
      orderStatus,
    }
    const response = await axiosClient.put(`/api/order/order-status`, body);
    return response.data;
  }
};

export default orderApi;
