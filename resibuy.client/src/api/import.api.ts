import axiosClient from "./base.api";

const importUrl = "/api/Import";

const importApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("File", file);
    return axiosClient.post(`${importUrl}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true, 
    });
  },
  confirm: (newEntities: { areaName: string; latitude: number; longitude: number; buildingName: string; roomNames: string[] }[]) => {
    return axiosClient.post(`${importUrl}/confirm`, { newEntities }, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
      },
      withCredentials: true,
    });
  },
};

export default importApi;
