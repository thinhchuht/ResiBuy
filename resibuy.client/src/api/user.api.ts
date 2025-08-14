/* eslint-disable @typescript-eslint/no-explicit-any */
import type { creatUserPayload } from "../types/payload";
import axiosClient from "./base.api";
const userUrl = "/api/user";

const userApi = {
  getById: async (id: string) => {
    try {
      const response = await axiosClient.get(userUrl + `/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Get user by id failed:", error);
      return {
        error: {
          message:
            error.response?.data?.message ||
            error.message ||
            "Lấy thông tin người dùng thất bại",
        },
      };
    }
  },

  getAllUser: async (pageNumber: number, pageSize: number) => {
    try {
      const response = await axiosClient.get(userUrl, {
        params: { pageNumber, pageSize },
      });
      return response.data;
    } catch (error: any) {
      console.error("Get all users failed:", error);
      return {
        error: {
          message:
            error.response?.data?.message ||
            error.message ||
            "Lấy danh sách người dùng thất bại",
        },
      };
    }
  },

  searchUsers: async (
    keyword: string,
    pageNumber: number,
    pageSize: number
  ) => {
    try {
      const response = await axiosClient.get(userUrl + "/search", {
        params: { keyword, pageNumber, pageSize },
      });
      return response.data;
    } catch (error: any) {
      console.error("Search users failed:", error);
      return {
        error: {
          message:
            error.response?.data?.message ||
            error.message ||
            "Tìm kiếm người dùng thất bại",
        },
      };
    }
  },

  createUser: async (userData: creatUserPayload) => {
    try {
      const response = await axiosClient.post(userUrl, userData);
      return response.data;
    } catch (error: any) {
      console.error("Create user failed:", error);
      return {
        error: {
          message:
            error.response?.data?.message ||
            error.message ||
            "Tạo người dùng thất bại",
        },
      };
    }
  },

  getCode: async (userData: creatUserPayload) => {
    try {
      const response = await axiosClient.post(userUrl + `/code`, userData);
      return response.data;
    } catch (error: any) {
      console.error("Get code failed:", error);
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
          message:
            error.response?.data?.message ||
            error.message ||
            "Khóa/Mở khóa người dùng thất bại",
        },
      };
    }
  },

  updateUser: async (id: string, code: string) => {
    try {
      const response = await axiosClient.put(
        userUrl + `/${id}`,
        JSON.stringify(code),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Update user failed:", error);
      return {
        error: {
          message:
            error.response?.data?.message ||
            error.message ||
            "Cập nhật người dùng thất bại",
        },
      };
    }
  },

  sendUpdateConfirmCode: async (id: string, userData: any) => {
    try {
      const response = await axiosClient.put(
        userUrl + `/${id}/confirm`,
        userData
      );
      return response.data;
    } catch (error: any) {
      console.error("Update user failed:", error);
      return {
        error: {
          message:
            error.response?.data?.message ||
            error.message ||
            "Cập nhật người dùng thất bại",
        },
      };
    }
  },

  sendPasswordConfirmCode: async (
    id: string,
    oldPassword: string,
    newPassword: string
  ) => {
    try {
      const response = await axiosClient.put(
        userUrl + `/${id}/password/confirm`,
        {
          oldPassword,
          newPassword,
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Update user failed:", error);
      return {
        error: {
          message:
            error.response?.data?.message ||
            error.message ||
            "Cập nhật người dùng thất bại",
        },
      };
    }
  },

  updateUserRoles: async (id: string, data: {
    roles: string[];
    shipper?: { lastLocationId: string; startWorkTime: number; endWorkTime: number };
    store?: { name: string; description: string; phoneNumber: string; roomId: string };
    customer?: { roomId: string };
  }) => {
    try {
      const response = await axiosClient.put(userUrl + `/${id}/roles`, data);
      return response.data;
    } catch (error: any) {
      console.error("Update user roles failed:", error);
      return {
        error: {
          message:
            error.response?.data?.message ||
            error.message ||
            "Cập nhật vai trò người dùng thất bại",
        },
      };
    }
  },

  changePassword: async (id: string, code: string) => {
    try {
      const response = await axiosClient.put(
        userUrl + `/${id}/password`,
        JSON.stringify(code),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Change password failed:", error);
      return {
        error: {
          message:
            error.response?.data?.message ||
            error.message ||
            "Đổi mật khẩu thất bại",
        },
      };
    }
  },
  addUserToRooms: async (userIds: string[], roomIds: string[]) => {
    try {
      const response = await axiosClient.post(userUrl + "/add-to-rooms", {
        userIds,
        roomIds,
      });
      return response.data;
    } catch (error: any) {
      console.error("lõi", error);
      return {
        error: {
          message:
            error.response?.data?.message ||
            error.message ||
            "Thêm người dùng vào phòng thất bại",
        },
      };
    }
  },
  removeUserRom: async (userId: string, roomId: string[]) => {
    try {
      const response = await axiosClient.post(userUrl + "/remove-userroom", {
        userId,
        roomId,
      });
      return response.data;
    } catch (error: any) {
      console.error("Remove user room failed:", JSON.stringify(error, null, 2));
      return {
        code: error.response?.data?.code || -1,
        message:
          error.response?.data?.message ||
          error.message ||
          "Lỗi khi xóa người dùng khỏi phòng",
        data: null,
      };
    }
  },
  importExcel: async (formData: FormData) => {
    try {
      const response = await axiosClient.post(userUrl + "/import-excel", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Import excel failed:", error);
      throw error;
    }
  },
  getstats: async () => {
    try {
      const response = await axiosClient.get(userUrl + "/stats");
      return response.data;
    } catch (error: any) {
      console.error("Get all users failed:", error);
      return {
        error: {
          message:
            error.response?.data?.message ||
            error.message ||
            "Lấy danh sách thông kke thất bại",
        },
      };
    }
  },
};

export default userApi;
