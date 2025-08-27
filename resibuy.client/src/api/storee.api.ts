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
    // Đảm bảo payload chỉ chứa các trường cần thiết
    const payload = {
      id,
      name: data.name,
      phoneNumber: data.phoneNumber,
      description: data.description,
      roomId: data.roomId || null, // Chuyển chuỗi rỗng thành null
    };
    console.log("Update store payload:", payload); // Log để gỡ lỗi
    const response = await axiosClient.put(`${storeUrl}/${id}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },
  updateStatus: async (id: string, isLocked: boolean, isOpen?: boolean ) => {
    const response = await axiosClient.put(`${storeUrl}/${id}/status`, { isLocked, isOpen });
    return response.data;
  },

count: async () => {
  const response = await axiosClient.get(`${storeUrl}/count`);
  return response.data.data.count;
},

countByIsOpenAndIsLoc: async () => {
  const response = await axiosClient.get(`${storeUrl}/count/status`);
  return response.data.data;
},
  search: async(keyWord?: string,isOpen?: boolean,isLocked?:boolean,isPayFee?:boolean,pageNumber: number=1,pageSize: number=10)=>{
    const response =await axiosClient.get(`${storeUrl}/search`,{params :{keyWord,isOpen,isLocked,isPayFee,pageNumber,pageSize}});
    return response.data;
  },
};

export default storeApi;