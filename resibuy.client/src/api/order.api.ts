import axiosClient from "./base.api";

const orderUrl = "/api/order";

export interface UpdateOrderParams {
  orderId: string;
  shippingAddressId?: string;
  note?: string;
  orderStatus?: string;
  userId?: string;
}

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
  updateOrder: async ({
    orderId,
    shippingAddressId,
    note,
    orderStatus,
    userId,
  }: UpdateOrderParams) => {
    const body = {
      orderId,
      shippingAddressId,
      note,
      orderStatus,
      userId,
    };
    const response = await axiosClient.put(`/api/order`, body);
    return response.data;
  },
};

export default orderApi;
