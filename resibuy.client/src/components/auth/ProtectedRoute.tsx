import React from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const params = useParams();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user) {
    const hasAnyAllowedRole = allowedRoles.some((role) => user.roles.includes(role));
    const isShipperOnlyRoute = allowedRoles.length > 0 && allowedRoles.every((r) => r === "SHIPPER");
    const requiresUnlockedShipper = isShipperOnlyRoute && user.roles.includes("SHIPPER") && user.shipperIsLocked === true;

    const isSellerOnlyRoute = allowedRoles.length > 0 && allowedRoles.every((r) => r === "SELLER");
    const storeId = (params.storeId as string) || undefined;
    let violatesSellerStoreAccess = false;
    if (isSellerOnlyRoute && !!storeId && user.roles.includes("SELLER")) {
      const ownedStore = (user.stores || []).find((s) => s.id === storeId);
      if (!ownedStore) {
        violatesSellerStoreAccess = true;
      } else if (ownedStore.isLocked === true) {
        violatesSellerStoreAccess = true;
      }
    }

    const isAuthorized = hasAnyAllowedRole && !requiresUnlockedShipper && !violatesSellerStoreAccess;
    if (!isAuthorized) {
      return <Navigate to="/forbidden" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
