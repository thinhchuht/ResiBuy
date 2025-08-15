import axiosClient from "./base.api";
import type { CreateCategoryDto, UpdateCategoryDto } from "../types/dtoModels";
const categoryUrl = "/api/category";

const categoryApi = {
  getAll: async (status?: boolean) => {
    const response = await axiosClient.get(`${categoryUrl}/categories`, {
      params: {
        status,
      },
    });
    return response.data;
  },

  create: async (data: CreateCategoryDto) => {
    const response = await axiosClient.post(`${categoryUrl}`, data);
    return response.data;
  },


  update: async (data: UpdateCategoryDto) => {
    const response = await axiosClient.put(`${categoryUrl}`, data);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosClient.get(`${categoryUrl}/${id}`);
    return response.data;
  },

  countAll: async () => {
    const response = await axiosClient.get(`${categoryUrl}/countAll`);
    return response.data;
  },

  countProductsByCategoryId: async (categoryId: string) => {
    const response = await axiosClient.get(`${categoryUrl}/countProducts/${categoryId}`);
    return response.data;
  }
};

export default categoryApi;