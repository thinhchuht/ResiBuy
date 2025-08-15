/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosClient from "./base.api";
import type { BuildingDto, CreateBuildingDto, UpdateStatusBuildingDto } from "../types/dtoModels";

const buildingUrl = "/api/Building";

const buildingApi = {
  // Lấy tất cả tòa nhà
  getAll: async (): Promise<BuildingDto[]> => {
    try {
      const response = await axiosClient.get(buildingUrl);
      if (response.data.code !== 0) {
        throw new Error(response.data.message || "Lỗi khi lấy danh sách tòa nhà");
      }
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi gọi API lấy danh sách tòa nhà");
    }
  },

  // Lấy theo id
  getById: async (id: string): Promise<BuildingDto> => {
    try {
      const response = await axiosClient.get(`${buildingUrl}/${id}`);
      if (response.data.code !== 0) {
        throw new Error(response.data.message || "Lỗi khi lấy thông tin tòa nhà");
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi gọi API lấy tòa nhà");
    }
  },

  // Lấy theo areaId
  getByAreaId: async (areaId: string, getActive: boolean = true): Promise<BuildingDto[]> => {
    try {
      const response = await axiosClient.get(`${buildingUrl}/area/${areaId}`, {
        params: {
          getActive,
        },
      });
      if (response.data.code !== 0) {
        throw new Error(response.data.message || "Lỗi khi lấy danh sách tòa nhà theo khu vực");
      }
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi gọi API lấy danh sách tòa nhà theo khu vực");
    }
  },

  // Lấy số lượng building
  count: async (): Promise<number> => {
    try {
      const response = await axiosClient.get(`${buildingUrl}/count`);
      if (response.data.code !== 0) {
        throw new Error(response.data.message || "Lỗi khi đếm số lượng tòa nhà");
      }
      return response.data.data || 0;
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi gọi API đếm số lượng tòa nhà");
    }
  },

  // Tạo mới
  create: async (data: CreateBuildingDto): Promise<{ code: number; message: string; data: BuildingDto }> => {
    try {
      const response = await axiosClient.post(`${buildingUrl}/create`, data);
      if (response.data.code !== 0) {
        throw new Error(response.data.message || "Lỗi khi tạo tòa nhà");
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi gọi API tạo tòa nhà");
    }
  },

  // Cập nhật thông tin building
  update: async (data: BuildingDto): Promise<{ code: number; message: string; data: BuildingDto }> => {
    try {
      const response = await axiosClient.put(buildingUrl, data);
      if (response.data.code !== 0) {
        throw new Error(response.data.message || "Lỗi khi cập nhật tòa nhà");
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi gọi API cập nhật tòa nhà");
    }
  },

  // Cập nhật trạng thái isActive
  updateStatus: async (data: UpdateStatusBuildingDto): Promise<{ code: number; message: string; data: { isActive: boolean } }> => {
    try {
      const response = await axiosClient.put(`${buildingUrl}/updatestatus`, data);
      if (response.data.code !== 0) {
        throw new Error(response.data.message || "Lỗi khi cập nhật trạng thái tòa nhà");
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi gọi API cập nhật trạng thái tòa nhà");
    }
  },
};

export default buildingApi;
