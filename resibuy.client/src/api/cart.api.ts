import axiosClient from "./base.api";
const cartUrl = "/api/cart";

const cartApi = {
  getCartById: (id: string, pageNumber: number, pageSize: number) => {
    return axiosClient.get(
      `${cartUrl}/${id}?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
  },

  getAllCartInShop: () => {
    return axiosClient.get(`${cartUrl}`);
  },

  createCart: () => {
    return axiosClient.post(
      `${cartUrl}/00000000-0000-0000-0000-000000000000`,
      null
    );
  },

  addToCart: (
    id: string,
    productDetailId: number,
    quantity: number,
    isAdd: boolean = true
  ) => {
    return axiosClient.post(`${cartUrl}/${id}/items`, {
      quantity,
      productDetailId,
      isAdd,
    });
  },

  addItemToCart: (
    id: string,
    productDetailId: number,
    quantity: number,
    isAdd: boolean = true
  ) => {
    return axiosClient.post(`${cartUrl}/${id}`, {
      quantity,
      productDetailId,
      isAdd,
    });
  },

  removeFromCart: (cartItemIds: string[], userId: string | undefined) => {
    return axiosClient.delete(`${cartUrl}/items`, {
      data: { cartItemIds, userId },
    });
  },
  countItems: (cartId: string) => {
    return axiosClient.get(`${cartUrl}/${cartId}/items/count`);
  },

  deleteCart: (cartId: string) => {
    return axiosClient.delete(`${cartUrl}/${cartId}`);
  },

  deleteCartItems: (cartId: string, cartItemIds: string[]) => {
    return axiosClient.delete(`${cartUrl}/${cartId}/items`, {
      data: cartItemIds,
    });
  },

  // updateUserInCart: async (cartId: string, userId: string) => {
  //   try {
  //     const response = await axiosClient.put(
  //       `/cart/${cartId}/update-user`,
  //       userId,
  //       {
  //         headers: { "Content-Type": "application/json" },
  //       }
  //     );
  //     return response.data;
  //   } catch (error: any) {
  //     return {
  //       error: {
  //         message:
  //           error.response?.data?.message ||
  //           error.message ||
  //           "Cập nhật user cho giỏ hàng thất bại",
  //       },
  //     };
  //   }
  // },

};


export default cartApi;
