import axiosClient from "./base.api";

const reportApi = {
  getAll: async (params: {
    userId?: string;
    keyword?: string;
    startDate?: string;
    endDate?: string;
    reportStatus?: number;
    pageNumber?: number;
    pageSize?: number;
  }) => {
    const response = await axiosClient.get("/api/report", { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axiosClient.get(`/api/report/${id}`);
    return response.data;
  },
  create: async (data: {
    orderId: string;
    userId: string;
    targetId: string;
    title: string;
    description: string;
    reportTarget: number; // Thêm trường này
  }) => {
    const response = await axiosClient.post("/api/report", data);
    return response.data;
  },
};

export default reportApi;