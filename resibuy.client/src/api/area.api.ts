import axiosClient from "./base.api";

const areaUrl = "/api/area";

const areaApi = {
  getAll: async () => {
    const response = await axiosClient.get(`${areaUrl}`);
    return response.data.data;
  }
};

export default areaApi;