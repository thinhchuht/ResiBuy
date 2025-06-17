import axiosClient from "./base.api";
import type { ProductDto } from "../types/models";

const productUrl = "/api/product";

const productApi = {
  getAll: async (pageNumber: number, pageSize: number) => {
    const response = await axiosClient.get(`${productUrl}/get-all-products`, {
      params: {
        pageNumber,
        pageSize,
      },
    });
    return response.data;
  },
  getById: (id: string) => {
    return axiosClient.get(`${productUrl}/get-product-by-id`, {
      params: { id },
    });
  },
  getByIdWithStore: (id: string) => {
    return axiosClient.get(`${productUrl}/get-product-by-id-with-store`, {
      params: { id },
    });
  },
  create: (data: ProductDto) => {
    return axiosClient.post(`${productUrl}/create`, data);
  },
};

export default productApi;