import axiosClient from "./base.api";
const cartUrl = "/api/cart";

const cartApi = {
  getCartByUserId: (id: string) => {
    return axiosClient.get(`${cartUrl}/${id}`);
  },

  addToCart: (id: string, quantity: number, productId: number) => {
    return axiosClient.post(`${cartUrl}/${id}/items`, {quantity , productId});
  },
  removeFromCart: (id: string, cartItemIds: string[]) => {
    return axiosClient.delete(`${cartUrl}/${id}/items`,  {data : cartItemIds});
  },
};

export default cartApi;
