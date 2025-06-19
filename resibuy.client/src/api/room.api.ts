import axiosClient from "./base.api";

const roomUrl = "/api/room";

const roomApi = {
  getByBuilingId: async (id :string) => {
    const response = await axiosClient.get(`${roomUrl}/building/${id}`);
    return response.data.data;
  }
};

export default roomApi;