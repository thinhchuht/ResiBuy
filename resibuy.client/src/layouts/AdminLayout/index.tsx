// layouts/AdminLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom"; // Import Outlet
import Sidebar from "./components/Sidebar";

export default function AdminLayout() {
  return (
    <div className="flex h-screen">

      <Sidebar />
      
      <main className="flex-1 overflow-auto bg-gray-50">
        <Outlet /> {/* Render nested routes here */}
      </main>
    </div>
  );
}