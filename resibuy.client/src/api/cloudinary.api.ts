import axiosClient from "./base.api";
const cloudinaryUrl = "/api/cloudinary";

const cloudinaryApi = {
  upload: (file: File, id?: string) => {
    const formData = new FormData();
    formData.append("File", file);
    if (id) formData.append("Id", id);
    return axiosClient.post(`${cloudinaryUrl}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadBatch: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return axiosClient.post(`${cloudinaryUrl}/upload-batch`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  delete: (id: string) => {
    return axiosClient.delete(`${cloudinaryUrl}/${id}`);
  },
};

export default cloudinaryApi;
