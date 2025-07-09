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


const drawerWidth = 240;

const ShipperLayout: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname.replace("/shipper/", "") || "orders";

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Sidebar */}
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

      {/* Nội dung chính */}
      <Box sx={{ flexGrow: 1 }}>
        {/* Top bar */}
        <AppBar
          position="fixed"
          sx={{
            ml: `${drawerWidth}px`,
            width: `calc(100% - ${drawerWidth}px)`,
            bgcolor: "white",
            color: "black",
            boxShadow: "none",
            borderBottom: "1px solid #ddd",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <Typography variant="h6">{getPageTitle(currentPath)}</Typography>
          </Toolbar>
        </AppBar>

        {/* Nội dung bên dưới AppBar */}
        <Box
          component="main"
          sx={{
            p: 3,
            mt: 8, // đẩy xuống dưới AppBar
            bgcolor: "#f5f5f5",
            minHeight: "100vh",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

function getPageTitle(path: string) {
  switch (path) {
    case "orders":
      return "Lịch sử đơn hàng";
    default:
      return "Trang chủ";
  }
}

export default ShipperLayout;
