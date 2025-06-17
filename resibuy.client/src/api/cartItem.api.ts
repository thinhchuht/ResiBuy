import axiosClient from "./base.api";
import { toast } from "react-toastify";

const cartItemUrl = "/api/cartItem";
const cartItemApi = {
  updateQuantity: async (cartItemId: string, quantity: number) => {
    try {
      const response = await axiosClient.put(`${cartItemUrl}/${cartItemId}/quantity`, quantity);
      toast.success("Cập nhật số lượng thành công!");
      return response;
    } catch (error) {
      toast.error("Cập nhật số lượng thất bại!");
      throw error;
    }
  },
};
export default cartItemApi;