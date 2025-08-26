import React from "react";
import { useEventHub, HubEventType, type HubEventData } from "../hooks/useEventHub";
import { useAuth } from "../contexts/AuthContext";
import { useToastify } from "../hooks/useToastify";
import { useLocation, useNavigate } from "react-router-dom";
import userApi from "../api/user.api";

const UserLockListener: React.FC = () => {
  const { user, logout, setUser } = useAuth();
  const toast = useToastify();
  const location = useLocation();
  const navigate = useNavigate();

  const refreshUser = async () => {
    try {
      const id = user?.id || localStorage.getItem("userId");
      if (!id) return;
      const res = await userApi.getById(id);
      if (res?.data) setUser(res.data);
    } catch (err) {
      console.error("Failed to refresh user after lock event", err);
    }
  };

  useEventHub({
    [HubEventType.UserLocked]: (data: HubEventData) => {
      const d = data as { UserId?: string; userId?: string };
      const targetId = d.UserId ?? d.userId;
      const currentUserId = user?.id || localStorage.getItem("userId");
      if (!targetId || (currentUserId && targetId === currentUserId)) {
        void logout();
        toast.error("Tài khoản của bạn đã bị khóa");
      }
    },
    [HubEventType.ShipperLocked]: () => {
      if (location.pathname.startsWith("/shipper")) {
        navigate("/", { replace: true });
      }
      void refreshUser();
    },
    [HubEventType.StoreLocked]: (data: HubEventData) => {
      const d = data as { storeId?: string; storeName?: string };
      const path = location.pathname;
      const m = path.match(/\/(?:seller\/)?store\/([^/]+)/i);
      const currentStoreId = m?.[1];
      if (path.includes("/store/") || path.includes("/seller/store/")) {
        if (!d.storeId || (currentStoreId && d.storeId === currentStoreId)) {
          navigate("/", { replace: true });
        }
      }
      void refreshUser();
    },
    [HubEventType.ShipperUnlocked]: () => {
      void refreshUser();
    },
    [HubEventType.StoreUnlocked]: () => {
      void refreshUser();
    },
  });

  return null;
};

export default UserLockListener;
