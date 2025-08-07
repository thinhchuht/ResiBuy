import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  Toolbar,
  Typography,
  useTheme,
  Paper,
} from "@mui/material";
import ShipperSidebar from "./component/ShipperSidebar";
import OrderAlertPopup from "../../components/shipper/OrderAlertPopup";
const drawerWidth = 240;

const ShipperLayout: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname.replace("/shipper/", "") || "orders";
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", bgcolor: "#f0f2f5" }}>
      <CssBaseline />

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: theme.palette.background.paper,
            borderRight: "1px solid #e0e0e0",
          },
        }}
      >
        <ShipperSidebar />
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1 }}>
        {/* Top AppBar */}
        <AppBar
          position="fixed"
          elevation={1}
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
            <Typography variant="h6" fontWeight={600}>
              {getPageTitle(currentPath)}
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Page Container */}
        <Box
          component="main"
          sx={{
            mt: 8,
            p: 3,
            minHeight: "100vh",
            bgcolor: "#f0f2f5",
          }}
        >
          {/* Inner card-style content */}
          <Paper
            elevation={1}
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: "white",
              minHeight: "calc(100vh - 100px)",
            }}
          >
            <Outlet />
          </Paper>
        </Box>
      </Box>
      <OrderAlertPopup />
    </Box>
  );
};

function getPageTitle(path: string) {
  switch (path) {
    case "orders":
      return "📦 Lịch sử đơn hàng";
    case "":
    case "shipper":
      return "🚀 Trang chủ";
    default:
      return "📝 Đơn hàng";
  }
}

export default ShipperLayout;
