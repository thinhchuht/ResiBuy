import axiosClient from "./base.api";
import type { AreaDto, UpdateStatusAreaDto } from "../types/dtoModels";

const areaUrl = "/api/area";

const areaApi = {
  // Lấy tất cả khu vực
  getAll: async (getActive: boolean = true) => {
    const response = await axiosClient.get(areaUrl, {
      params: {
        getActive,
      },
    });
    return response.data.data;
  },

  // Lấy khu vực theo ID
  getById: async (id: string) => {
    const response = await axiosClient.get(`${areaUrl}/${id}`);
    return response.data.data;
  },

  // Tạo khu vực mới
  create: async (data: {
    name: string;
    latitude: string;
    longtitude: string;
  }) => {
    const response = await axiosClient.post(`${areaUrl}/create`, data);
    return response.data;
  },

  // Cập nhật khu vực (PUT)
  update: async (data: AreaDto) => {
    const response = await axiosClient.put(areaUrl, data);
    return response.data;
  },

  // Cập nhật trạng thái isActive (POST đến /updatestatus)
  updateStatus: async (data: UpdateStatusAreaDto) => {
    const response = await axiosClient.put(`${areaUrl}/updatestatus`, data);
    return response.data;
  },

  // Đếm tổng số khu vực
  count: async () => {
    const response = await axiosClient.get(`${areaUrl}/count`);
    return response.data.data;
  },
};

export default areaApi;
