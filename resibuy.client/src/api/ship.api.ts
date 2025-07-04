import axiosClient from "./base.api";
import type { Shipper } from "../types/models";

const shipperUrl = "/api/shipper";

const shipperApi = {
  // Lấy danh sách shipper (có phân trang)
  getAll: async (pageNumber: number = 1, pageSize: number = 5) => {
    const response = await axiosClient.get(`${shipperUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response.data;
  },

  // Lấy shipper theo id
  getById: async (id: string) => {
    const response = await axiosClient.get(`${shipperUrl}/${id}`);
    return response.data;
  },

  // Lấy shipper theo userId
  getByUserId: async (userId: string) => {
    const response = await axiosClient.get(`${shipperUrl}/user/${userId}`);
    return response.data;
  },

  // Tạo mới shipper
  create: async (data: Shipper) => {
    const response = await axiosClient.post(`${shipperUrl}`, data);
    return response.data;
  },

  // Cập nhật shipper
  update: async (id: string, data: Shipper) => {
    const response = await axiosClient.put(`${shipperUrl}/${id}`, data);
    return response.data;
  },

  // Cập nhật vị trí shipper
  updateLocation: async (id: string, data: Partial<Shipper>) => {
    const response = await axiosClient.put(`${shipperUrl}/${id}/location`, data);
    return response.data;
  },

  // Cập nhật trạng thái shipper
  updateStatus: async (id: string, data: Partial<Shipper>) => {
    const response = await axiosClient.put(`${shipperUrl}/${id}/status`, data);
    return response.data;
  },
};

export default shipperApi;