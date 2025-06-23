import axiosClient from "./base.api";

const buildingUrl = "/api/building";

const buildingApi = {
  getByBuilingId: async (id :string) => {
    const response = await axiosClient.get(`${buildingUrl}/area/${id}`);
    return response.data.data;
  }
};

export default buildingApi;