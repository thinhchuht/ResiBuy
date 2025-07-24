import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  CssBaseline,
  Drawer,
  Toolbar,
  Typography,
} from "@mui/material";
import ShipperSidebar from "./component/ShipperSidebar";
import OrderAlertPopup from "../../components/shipper/OrderAlertPopup"; // Component popup

const drawerWidth = 240;

const ShipperLayout: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname.replace("/shipper/", "") || "orders";

  const [showPopup, setShowPopup] = useState(false);
  const [order, setOrder] = useState<{
    id: number;
    customerName: string;
    address: string;
    storeAddress: string;
  }>();

  // Giả lập đơn hàng mới mỗi 40s
  useEffect(() => {
    const interval = setInterval(() => {
      setOrder({
        id: Math.floor(Math.random() * 10000),
        customerName: "Nguyễn Văn A",
        address: "123 Lý Thường Kiệt, Q10, TP.HCM",
        storeAddress: "456 Nguyễn Trãi, Q5, TP.HCM",
      });
      setShowPopup(true);
    }, 40000); // mỗi 40s

    return () => clearInterval(interval);
  }, []);

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

      {/* Main content */}
      <Box sx={{ flexGrow: 1 }}>
        {/* AppBar */}
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
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {getPageTitle(currentPath)}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setOrder({
                  id: 9999,
                  customerName: "Trần Thị B",
                  address: "789 Cách Mạng Tháng Tám, Q3",
                  storeAddress: "12 Hai Bà Trưng, Q1",
                });
                setShowPopup(true);
              }}
            >
              Test Popup
            </Button>
          </Toolbar>
        </AppBar>

        {/* Nội dung chính */}
        <Box
          component="main"
          sx={{
            p: 3,
            mt: 8,
            bgcolor: "#f5f5f5",
            minHeight: "100vh",
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Popup thông báo đơn hàng */}
      <OrderAlertPopup open={showPopup} onClose={() => setShowPopup(false)} order={order} />
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
