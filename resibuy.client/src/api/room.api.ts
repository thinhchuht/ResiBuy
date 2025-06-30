import axiosClient from "./base.api";

const roomUrl = "/api/room";

const roomApi = {
  getByBuilingId: async (id: string, pageNumber = 1, pageSize = 100) => {
    const response = await axiosClient.get(`${roomUrl}/building/${id}`, {
      params: { pageNumber, pageSize }
    });
    return response.data.data;
  }
};

export default roomApi;