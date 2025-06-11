import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { HubProvider } from "./contexts/HubContext";
import Login from "./components/auth/Login";
import "./App.css";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import TestHub from "./components/test/TestHub";
import Home from "./pages/Home/Home";
import HomeLayout from "./layouts/HomeLayout/HomeLayout";
import Products from "./pages/Product/Products";
import ScrollToTop from "./components/ScrollToTop";
import Cart from "./pages/Cart/Cart";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HubProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/login" element={<Login />} />
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
              path="/cart"
              element={
                <ProtectedRoute>
                  <HomeLayout>
                    <Cart />
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
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <div>Admin Dashboard</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/*"
              element={
                <ProtectedRoute allowedRoles={["SELLER"]}>
                  <div>Seller Dashboard</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/shipper/*"
              element={
                <ProtectedRoute allowedRoles={["SHIPPER"]}>
                  <div>Shipper Dashboard</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/*"
              element={
                <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                  <div>Customer Dashboard</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/unauthorized"
              element={<div>Unauthorized Access</div>}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </HubProvider>
    </AuthProvider>
  );
};

export default App;
