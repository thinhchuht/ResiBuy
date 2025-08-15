import axiosClient from "./base.api";
import type { Shipper } from "../types/models";

const shipperUrl = "/api/shipper";
export interface ShipperLocationUpdate {
  shipperId: string;
  locationId: string;
}
const shipperApi = {
  // Lấy danh sách shipper (có phân trang)
  getAll: async (pageNumber: number = 1, pageSize: number = 5) => {
    const response = await axiosClient.get(
      `${shipperUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
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
  update: async (data: Shipper) => {
    const response = await axiosClient.put(`${shipperUrl}`, data);
    return response.data;
  },

  updateLocation: async (data: ShipperLocationUpdate) => {
    const response = await axiosClient.put("/api/shipper/location", data);
    return response.data;
  },

  // Cập nhật trạng thái shipper
  updateStatus: async (id: string, data: Partial<Shipper>) => {
    const response = await axiosClient.put(`${shipperUrl}/${id}/status`, data);
    return response.data;
  },
  stats: async () => {
    const response = await axiosClient.get(`${shipperUrl}/stats`);
    return response.data;
  },
  search: async(keyWord?: string,isOnline?: boolean,isLocked?:boolean,pageNumber: number=1,pageSize: number=10)=>{
    const response =await axiosClient.get(`${shipperUrl}/search`,{params :{keyWord,isOnline,isLocked,pageNumber,pageSize}});
    return response.data;
  },
};

export default shipperApi;
