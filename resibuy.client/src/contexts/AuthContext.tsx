import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import authApi from "../api/auth.api";
import userApi from "../api/user.api";
import type { User } from "../types/models";

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  setUser: (user: User | null) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  login: (phoneNumber: string, password: string) => Promise<{ success: boolean; error?: { message: string }, data?: any }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem("refreshToken"));
  const [userId, setUserId] = useState<string | null>(localStorage.getItem("userId"));

  useEffect(() => {
    const fetchUser = async () => { 
      if (token && userId) {
        try {
          const response = await userApi.getById(userId);
          if (response.data) {
            console.log(response.data)
            setUser(response.data);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUser();
  }, [token, userId]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = async (phoneNumber: string, password: string) => {
    try {
      const response = await authApi.login(phoneNumber, password);
      if (response.success) {
        const { token, refreshToken, user } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userId", user.id);
        setToken(token);
        setRefreshToken(refreshToken);
        setUserId(user.id);
      }
      return response;
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: {
          message: "Error has occurred, contact website owner",
        },
        data : null
      };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        const response = await authApi.logout(refreshToken);
        if (response.success) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userId");
          setToken(null);
          setRefreshToken(null);
          setUserId(null);
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Logout failed with error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        setUser,
        login,
        logout,
        isAuthenticated: !!token,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
