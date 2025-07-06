import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Login from "../components/auth/Login";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import TestHub from "../components/test/TestHub";
import Home from "../pages/Home/Home";
import HomeLayout from "../layouts/HomeLayout/HomeLayout";
import Products from "../pages/Product/Products";
import ScrollToTop from "../components/ScrollToTop";
import Cart from "../pages/Cart/Cart";
import Checkout from "../pages/Checkout/Checkout";
import Unauthorized from "../components/Unauthorized";
import Forbidden from "../components/Forbidden";
import CheckoutSuccess from "../pages/CheckoutSuccess/CheckoutSuccess";
import CheckoutFailed from "../pages/CheckoutFailed/CheckoutFailed";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/Admin/dashboard/Dashboard";
import StoresPage from "../pages/Admin/Store/page";
import CategoriesPage from "../pages/Admin/Category/page";
import ShippersPage from "../pages/Admin/Shipper/page";
import Orders from "../pages/Order/Orders";
import Profile from "../pages/Profile/Profile";
import Store from "../pages/Store/StorePage";
import AreasPage from "../components/admin/Area/AreasPage";
import OverviewPage from "../pages/Admin/Resi/page";
import BuildingsPage from "../components/admin/Building/BuildingPage";
import RoomsPage from "../components/admin/Room/RoomPage";
import ListStore from "../pages/Store/ListStore";
import ShipperLayout from "../layouts/ShipperLayout/ShipperLayout";
import OrdersPage from "../pages/Shipper/OrdersPage";
const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route
          path="/"
          element={
            <HomeLayout>
              <Home />
            </HomeLayout>
          }
        />
        <Route
          path="/products"
          element={
            <HomeLayout>
              <Products />
            </HomeLayout>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <HomeLayout>
                <Orders />
              </HomeLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/store/:storeId/*"
          element={
            <HomeLayout>
              <Store />
            </HomeLayout>
          }
        />
        <Route
          path="/my-stores"
          element={
            <ProtectedRoute allowedRoles={["SELLER", "ADMIN"]}>
              <HomeLayout>
                <ListStore />
              </HomeLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER", "ADMIN"]}>
              <HomeLayout>
                <Profile />
              </HomeLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout-success"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <HomeLayout>
                <CheckoutSuccess />
              </HomeLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout-failed"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <HomeLayout>
                <CheckoutFailed />
              </HomeLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <HomeLayout>
                <Cart />
              </HomeLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <HomeLayout>
                <Checkout />
              </HomeLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/test-hub"
          element={
            <ProtectedRoute>
              <TestHub />
            </ProtectedRoute>
          }
        />
        {
          /* <Route

        <Route path="/test-hub" element={<TestHub />} />
        <Route

          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <div>Admin Dashboard</div>
            </ProtectedRoute>
          }
        /> */
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />

            <Route path="dashboard" element={<Dashboard />} />
            <Route path="Shipper" element={<ShippersPage />} />
            <Route path="Category" element={<CategoriesPage />} />
            <Route path="Store" element={<StoresPage />} />
            <Route path="area" element={<AreasPage />} />
            <Route path="resi" element={<OverviewPage />} />
            <Route path="buildings/:areaId" element={<BuildingsPage />} />
            <Route path="rooms/:buildingId" element={<RoomsPage />} />
          </Route>
        }
        <Route
          path="/seller/*"
          element={
            <ProtectedRoute allowedRoles={["SELLER"]}>
              <div>Seller Dashboard</div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/shipper"
          element={
            <ProtectedRoute allowedRoles={["SHIPPER"]}>
              <ShipperLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<OrdersPage />} />
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
