import axiosClient from "./base.api";

const imageUrl = "/api/Image";

const imageApi = {
  // Lấy tất cả ảnh
  getAll: async () => {
    const response = await axiosClient.get(`${imageUrl}/all`);
    return response.data;
  },

  // Tạo ảnh mới
  create: async (data: {
    url: string;
    thumbUrl: string;
    name: string;
  }) => {
    const response = await axiosClient.post(`${imageUrl}/create`, data);
    return response.data;
  },  delete: async (id: string) => {
    const response = await axiosClient.delete(`${imageUrl}/${id}`);
    return response.data;
  },
};

export default imageApi;
