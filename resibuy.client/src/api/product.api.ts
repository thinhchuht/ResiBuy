import axiosClient from "./base.api";
import type { ProductDto } from "../types/models";

const productUrl = "/api/product";

const productApi = {
  getAll: async (pageNumber: number, pageSize: number) => {
    const response = await axiosClient.get(`${productUrl}`, {
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
  getByCategoryId: async (id: string, pageNumber: number, pageSize: number) => {
    const response = await axiosClient.get(`${productUrl}/get-product-by-category-id`, {
      params: { id, pageNumber, pageSize },
    });
    return response.data;
  },
  create: (data: ProductDto) => {
    return axiosClient.post(`${productUrl}/create`, data);
  },
};

export default productApi;
