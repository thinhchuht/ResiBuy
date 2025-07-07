/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosClient from "./base.api";
const authUrl = "/api/auth";
const authApi = {
  login: async (phoneNumber: string, password: string) => {
    try {
      const response = await axiosClient.post(authUrl + "/login", {
        phoneNumber,
        password,
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("Login failed:", error);
      return {
        success: false,
        error: {
          message:
            error.response?.data?.message || error.message || "Login failed",
        },
      };
    }
  },
  logout: async (refreshToken: string) => {
    try {
      await axiosClient.post(authUrl + "/logout", refreshToken);
      return { success: true };
    } catch (error) {
      console.error("Logout failed:", error);
      return { success: false, error };
    }
  },
  forgetPass: async (phoneNumber: string) => {
      const response = await axiosClient.post(authUrl + "/forget-pass", JSON.stringify(phoneNumber),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
  },
  confirmCode: async (code: string) => {
      const response = await axiosClient.post(authUrl + "/confirm-code", JSON.stringify(code), {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
  },
};

export default authApi;
