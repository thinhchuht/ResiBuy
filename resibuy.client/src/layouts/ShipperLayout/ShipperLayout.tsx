// layouts/ShipperLayout/ShipperLayout.tsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  Toolbar,
  Typography,
} from "@mui/material";
import ShipperSidebar from "./component/ShipperSidebar";
import OrderAlertPopup from "../../components/shipper/OrderAlertPopup";
const drawerWidth = 240;

const ShipperLayout: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname.replace("/shipper/", "") || "orders";

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <ShipperSidebar />
      </Drawer>

      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position="fixed"
          sx={{
            ml: `${drawerWidth}px`,
            width: `calc(100% - ${drawerWidth}px)`,
            bgcolor: "white",
            color: "black",
            borderBottom: "1px solid #ddd",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {getPageTitle(currentPath)}
            </Typography>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{ p: 3, mt: 8, bgcolor: "#f5f5f5", minHeight: "100vh" }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* ✅ Popup nhận đơn hàng mới */}
      <OrderAlertPopup />
    </Box>
  );
};

function getPageTitle(path: string) {
  switch (path) {
    case "orders":
      return "Lịch sử đơn hàng";
    case "":
    case "shipper":
      return "Trang chủ";
    default:
      return "Đơn hàng";
  }
}

export default ShipperLayout;
