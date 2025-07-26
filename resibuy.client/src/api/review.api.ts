import axiosClient from "./base.api";
const reviewUrl = "/api/review";

const reviewApi = {
  getAll: async (productId: string, rate: number, pageNumber: number, pageSize: number) => {
    const response = await axiosClient.get(`${reviewUrl}`, {
      params: { productId, rate, pageNumber, pageSize },
    });
    return response.data.data;
  },
  getById: async (id: string) => {
    const response = await axiosClient.get(`${reviewUrl}/${id}`);
    return response.data.data;
  },
  create: (userId: string, productDetailId: number, rate: number, comment: string, isAnonymous: boolean ) => {
    return axiosClient.post(`${reviewUrl}`, { userId, productDetailId,  rate, comment, isAnonymous});
  },
};

export default reviewApi;
