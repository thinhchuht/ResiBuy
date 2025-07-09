import axiosClient from "./base.api";
const notificationUrl = "/api/notification";

const notificationApi = {
  getByUserId: async (userId: string, pageNumber: number, pageSize: number) => {
    const response = await axiosClient.get(`${notificationUrl}/user/${userId}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response.data.data
  },
  getUnreadCountNotification: async (userId: string) => {
    const response = await axiosClient.get(`${notificationUrl}/user/${userId}/count`);
    return response.data.data
  },
  
  readNotification: async (id: string, userId: string) => {
    const response = await axiosClient.put(`${notificationUrl}/${id}?userId=${userId}`);
    return response.data.data
  },
};

export default notificationApi;
