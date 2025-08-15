import axiosClient from "./base.api";

const reportApi = {
  getAll: async (params: {
    userId?: string;
    keyword?: string;
    startDate?: string;
    endDate?: string;
    reportStatus?: string;
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
  getCount: async (params?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await axiosClient.get("/api/report/count", { params });
    return response.data;
  },
  create: async (data: {
    orderId: string;
    userId: string;
    targetId: string;
    title: string;
    description: string;
    reportTarget: number;
  }) => {
    const response = await axiosClient.post("/api/report", data);
    return response.data;
  },
  resolve: async (id: string, isAddReportTarget: boolean = false) => {
    const response = await axiosClient.put(`/api/report/${id}/resolve`, { isAddReportTarget });
    return response.data;
  },
};

export default reportApi;