/* eslint-disable @typescript-eslint/no-explicit-any */
import type { creatUserPayload } from "../types/payload";
import axiosClient from "./base.api";
const userUrl = "/api/user";

const userApi = {
  getById: async (id: string) => {
    try {
      const response = await axiosClient.get(userUrl + `/${id}`);
      return response.data ;
    } catch (error: any) {
      console.error("Get user by id failed:", error);
      return {
        error: {
          message: error.response?.data?.message || error.message || "Lấy thông tin người dùng thất bại",
        },
      };
    }
  },

  getAllUser: async (pageNumber: number, pageSize: number) => {
    try {
      const response = await axiosClient.get(userUrl, {
        params: { pageNumber, pageSize }
      });
      return response.data ;
    } catch (error: any) {
      console.error("Get all users failed:", error);
      return {
        error: {
          message: error.response?.data?.message || error.message || "Lấy danh sách người dùng thất bại",
        },
      };
    }
  },

  searchUsers: async (keyword: string, pageNumber: number, pageSize: number) => {
    try {
      const response = await axiosClient.get(userUrl + "/search", {
        params: { keyword, pageNumber, pageSize }
      });
      return response.data ;
    } catch (error: any) {
      console.error("Search users failed:", error);
      return {
        error: {
          message: error.response?.data?.message || error.message || "Tìm kiếm người dùng thất bại",
        },
      };
    }
},

  createUser: async (userData: creatUserPayload) => {
    try {
      const response = await axiosClient.post(userUrl + "/create", userData);
      return  response.data ;
    } catch (error: any) {
      console.error("Create user failed:", error);
      return {
        error: {
          message: error.response?.data?.message || error.message || "Tạo người dùng thất bại",
        },
      };
    }
  },

  lockUnlockUser: async (id: string) => {
    try {
      const response = await axiosClient.post(userUrl + `/${id}/lock-unlock`);
      return response.data;
    } catch (error: any) {
      console.error("Lock/Unlock user failed:", error);
      return {
        error: {
          message: error.response?.data?.message || error.message || "Khóa/Mở khóa người dùng thất bại",
        },
      };
    }
  },

  updateUser: async (id: string, userData: FormData) => {
    try {
      const response = await axiosClient.put(userUrl + `/${id}/update`, userData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return  response.data ;
    } catch (error: any) {
      console.error("Update user failed:", error);
      return {
        error: {
          message: error.response?.data?.message || error.message || "Cập nhật người dùng thất bại",
        },
      };
    }
  },

  updateUserRoles: async (id: string, roles: string[]) => {
    try {
      const response = await axiosClient.put(userUrl + `/${id}/roles`, roles);
      return  response.data;
    } catch (error: any) {
      console.error("Update user roles failed:", error);
      return {
        error: {
          message: error.response?.data?.message || error.message || "Cập nhật vai trò người dùng thất bại",
        },
      };
    }
  },

  changePassword: async (id: string, oldPassword: string, newPassword: string) => {
    try {
      const response = await axiosClient.put(userUrl + `/${id}/change-password`, {
        oldPassword,
        newPassword
      });
      return response.data;
    } catch (error: any) {
      console.error("Change password failed:", error);
      return {
        error: {
          message: error.response?.data?.message || error.message || "Đổi mật khẩu thất bại",
        },
      };
    }
  },
};

export default userApi;
