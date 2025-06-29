import axiosClient from "./base.api";

const categoryUrl = "/api/category";

const categoryApi = {
  getAll: async () => {
    const response = await axiosClient.get(`${categoryUrl}/categories`);
    return response.data;
  }

};

export default categoryApi;