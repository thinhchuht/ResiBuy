/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosClient from "./base.api";
const cartUrl = "/api/cart";

const cartApi = {
  getCartByUserId: (userId: string) => {
    return axiosClient.get(`${cartUrl}/${userId}`);
  },

  addToCart: (userId: string, data: any) => {
    return axiosClient.post(`${cartUrl}/${userId}`, data);
  },
};

export default cartApi;
