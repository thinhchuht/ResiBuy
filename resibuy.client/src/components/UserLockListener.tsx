import React from "react";
import { useEventHub, HubEventType, type HubEventData } from "../hooks/useEventHub";
import { useAuth } from "../contexts/AuthContext";
import { useToastify } from "../hooks/useToastify";

const UserLockListener: React.FC = () => {
  const { user, logout } = useAuth();
  const toast = useToastify();

  useEventHub({
    [HubEventType.UserLocked]: (data: HubEventData) => {
      const d = data as { UserId?: string; userId?: string };
      const targetId = d.UserId ?? d.userId;
      const currentUserId = user?.id || localStorage.getItem("userId");
      if (!targetId || (currentUserId && targetId === currentUserId)) {
        void logout();
        toast.error("Tài khoản bị khóa");
      }
    },
  });

  return null;
};

export default UserLockListener;
