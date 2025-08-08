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

  const clearAuthData = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    setToken(null);
    setRefreshToken(null);
    setUserId(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  const setAuthData = (tokenValue: string, refreshTokenValue: string, userIdValue: string) => {
    localStorage.setItem("token", tokenValue);
    localStorage.setItem("refreshToken", refreshTokenValue);
    localStorage.setItem("userId", userIdValue);
    setToken(tokenValue);
    setRefreshToken(refreshTokenValue);
    setUserId(userIdValue);
    
    window.dispatchEvent(new CustomEvent('auth-login', {
      detail: { token: tokenValue, refreshToken: refreshTokenValue, userId: userIdValue }
    }));
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        if (e.newValue === null && token !== null) {
          clearAuthData();
          window.location.reload();
        } else if (e.newValue !== null && e.newValue !== token) {
          window.location.reload();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [token]);

  useEffect(() => {
    const handleAuthLogin = () => {
      window.location.reload();
    };

    const handleAuthLogout = () => {
      clearAuthData();
      window.location.reload();
    };

    window.addEventListener("auth-login", handleAuthLogin as EventListener);
    window.addEventListener("auth-logout", handleAuthLogout);

    return () => {
      window.removeEventListener("auth-login", handleAuthLogin as EventListener);
      window.removeEventListener("auth-logout", handleAuthLogout);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (token && userId) {
        try {
          const response = await userApi.getById(userId);
          if (response.data) {
            setUser(response.data);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            clearAuthData();
          }
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
        setAuthData(token, refreshToken, user.id);
        
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
      return response;
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: {
          message: "Error has occurred, contact website owner",
        },
        data: null
      };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        const response = await authApi.logout(refreshToken);
        if (response.success) {
          clearAuthData();
          
          window.dispatchEvent(new CustomEvent('auth-logout'));
          
          window.location.reload();
        }
      } else {
        clearAuthData();
        window.dispatchEvent(new CustomEvent('auth-logout'));
        window.location.reload();
      }
    } catch (error) {
      console.error("Logout failed with error:", error);
      clearAuthData();
      window.dispatchEvent(new CustomEvent('auth-logout'));
      window.location.reload();
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