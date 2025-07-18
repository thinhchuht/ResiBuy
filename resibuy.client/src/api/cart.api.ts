import axiosClient from "./base.api";
const cartUrl = "/api/cart";

const cartApi = {
  getCartById: (id: string, pageNumber: number, pageSize: number) => {
    return axiosClient.get(`${cartUrl}/${id}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  },

  addToCart: (id: string, productDetailId: number, quantity: number, isAdd: boolean = true) => {
    return axiosClient.post(`${cartUrl}/${id}/items`, { quantity, productDetailId, isAdd });
  },
  removeFromCart: (cartItemIds: string[],  userId : string | undefined) => {
    return axiosClient.delete(`${cartUrl}/items`, { data: { cartItemIds, userId } });
  },
  countItems: (cartId: string) => {
    return axiosClient.get(`${cartUrl}/${cartId}/items/count`)
  }
};

export default cartApi;
