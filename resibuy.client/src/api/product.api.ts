import axiosClient from "./base.api";
import type { ProductDto, ProductFilter } from "../types/models";

const productUrl = "/api/product";

const productApi = {
  getAll: async (filter: ProductFilter) => {
    const response = await axiosClient.get(`${productUrl}/products`, {
      params: filter,
    });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axiosClient.get(`${productUrl}/${id}`);
    return response.data;
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
