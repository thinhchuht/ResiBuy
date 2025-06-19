import axiosClient from "./base.api";
import type { CheckoutRequest } from "./vnpay.api";

const checkoutUrl = "/api/checkout";

const checkoutApi = {
  checkout: async (checkoutData : CheckoutRequest) => {
    const response = await axiosClient.post(`${checkoutUrl}`, checkoutData);
    return response.data.data;
  }
};

export default checkoutApi;