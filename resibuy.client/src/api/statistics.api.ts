import axiosClient from "./base.api";

const statisticsUrl = "/api/statistics";
const statisticsApi = {
  getStats: async (startTime: string, endTime: string) => {
    const response = await axiosClient.get(`${statisticsUrl}/statistics`, {
  params: { startTime, endTime }
});
    return response.data;
  },

getTopAndCategory: async (startTime: string, endTime: string) => {
    const response = await axiosClient.get(`${statisticsUrl}/top-and-category-statistics`, {
  params: { startTime, endTime }
});
    return response.data;
  },


};
export default statisticsApi;