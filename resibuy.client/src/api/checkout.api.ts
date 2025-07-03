// import type { CartItem } from "../types/models";
import axiosClient from "./base.api";
// import type { CheckoutRequest } from "./vnpay.api";
import type { UpdateTempOrderDto } from "../types/models";

const checkoutApi = {
  checkoutUser: async (userId: string, checkoutId: string) => {
    const response = await axiosClient.post(`/api/checkout/user/${userId}/checkout`, checkoutId, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  },

  getTempOrder: async (userId: string, id: string) => {
    const response = await axiosClient.get(`/api/checkout/user/${userId}?id=${id}`);
    return response.data;
  },

  createTempOrder: async (userId: string, dto: { cartItems: { productDetailId: number; storeId: string; quantity: number }[]; isInstance?: boolean }) => {
    const response = await axiosClient.post(`/api/checkout/user/${userId}`, dto);
    return response.data;
  },

  updateTempOrder: async (userId: string, updateDto: UpdateTempOrderDto) => {
    const response = await axiosClient.put(`/api/checkout/user/${userId}`, updateDto);
    return response.data;
  },
};

export default checkoutApi;
