import axiosClient from "./base.api";
const cartUrl = "/api/cart";

const cartApi = {
  getCartById: (id: string, pageNumber: number, pageSize: number) => {
    return axiosClient.get(`${cartUrl}/${id}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  },

  addToCart: (id: string, quantity: number, productId: string, costDataId: string, uncostDataIds?: string[]) => {
    return axiosClient.post(`${cartUrl}/${id}/items`, { quantity, productId, costDataId, uncostDataIds });
  },
  removeFromCart: (id: string, cartItemIds: string[]) => {
    return axiosClient.delete(`${cartUrl}/${id}/items`, { data: cartItemIds });
  },
};

export default cartApi;
