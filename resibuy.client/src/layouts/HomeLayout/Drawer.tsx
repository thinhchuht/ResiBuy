import React from "react";
import { Drawer as MuiDrawer, Toolbar, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider } from "@mui/material";
import { Dashboard, ShoppingCart, LocalShipping, Person, Settings } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Logo from "../../assets/images/Logo.png";

interface DrawerProps {
  open: boolean;
  drawerWidth: number;
}

const Drawer: React.FC<DrawerProps> = ({ open, drawerWidth }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { text: "Trang chủ", icon: <Dashboard />, path: "/" },
    { text: "Giỏ hàng", icon: <ShoppingCart />, path: user ? "/orders" : "/login" },
    { text: "Shipping", icon: <LocalShipping />, path: user ? "/shipping" : "/login" },
    { text: "Quản lí tài khoản", icon: <Person />, path: user ? "/profile" : "/login" },
    { text: "Cài đặt", icon: <Settings />, path: "/settings" },
  ];

  return (
    <MuiDrawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
      variant="persistent"
      anchor="left"
      open={open}>
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
          <img src={Logo} alt="ResiBuy Logo" style={{ height: 40, marginRight: 8 }} />
          <Typography variant="h6" noWrap component="div">
            ResiBuy
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <Box sx={{ overflow: "auto" }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => navigate(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </MuiDrawer>
  );
};

export default Drawer;
