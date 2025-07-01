import axiosClient from "./base.api";

const roomUrl = "/api/room";

const roomApi = {
  getByBuilingId: async (id: string, pageNumber = 1, pageSize = 100, search?: string) => {
    const response = await axiosClient.get(`${roomUrl}/building/${id}`, {
      params: { pageNumber, pageSize, search },
    });
    return response.data.data;
  },
};

export default roomApi;
