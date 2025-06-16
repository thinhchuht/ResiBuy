import axiosClient from "./base.api";
const cartItemUrl = "/api/cartItem";
const cartItemApi = {
  updateQuantity: (cartItemId: string, quantity: number) => {
    return axiosClient.put(`${cartItemUrl}/${cartItemId}/quantity`, quantity);
  },
};
export default cartItemApi;