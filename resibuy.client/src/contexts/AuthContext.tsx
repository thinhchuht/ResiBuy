import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import authApi from "../api/auth.api";

interface User {
  id: string;
  email: string;
  fullName: string;
  rooms: [
    {
      roomId: string;
      roomName: string;
      buildingName: string;
      areaName: string;
    }
  ];
  phoneNumber: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  login: (phoneNumber: string, password: string) => Promise<{ success: boolean; error?: { message: string } }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      localStorage.removeItem("user"); // Clean up invalid data
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem("refreshToken"));
  // Set up axios default headers
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
      console.log(response);
      if (response.success) {
        console.log("fdasfasdfas");
        const { token, user, refreshToken } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        setToken(token);
        setRefreshToken(refreshToken);
        setUser(user);
      }
      return response;
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: {
          message: "Error has occurred, contact website owner",
        },
      };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      console.log("logout", refreshToken);

      if (refreshToken) {
        const response = await authApi.logout(refreshToken);
        if (response.success) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          setToken(null);
          setRefreshToken(null);
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
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
