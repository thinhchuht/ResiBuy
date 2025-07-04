import axiosClient from "./base.api";
import type { Store } from "../types/storeData";

const storeUrl = "/api/store";

const storeApi = {
  getAll: async (pageNumber: number = 1, pageSize: number = 5) => {
    const response = await axiosClient.get(`${storeUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosClient.get(`${storeUrl}/${id}`);
    return response.data;
  },

  getByOwnerId: async (ownerId: string, pageNumber: number = 1, pageSize: number = 5) => {
    const response = await axiosClient.get(`${storeUrl}/owner/${ownerId}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response.data;
  },

  create: async (data: Partial<Store>) => {
    const response = await axiosClient.post(`${storeUrl}`, data);
    return response.data;
  },

  update: async (id: string, data: Partial<Store>) => {
    const response = await axiosClient.put(`${storeUrl}/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, isLocked: boolean, isOpen?: boolean ) => {
    const response = await axiosClient.put(`${storeUrl}/${id}/status`, { isLocked, isOpen });
    return response.data;
  },
};

export default storeApi;