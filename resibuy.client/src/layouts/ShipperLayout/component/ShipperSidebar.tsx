import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Typography,
  Divider,
  Avatar,
  Stack,
} from "@mui/material";
import { Link } from "react-router-dom";

const drawerWidth = 240;

const ShipperSidebar: React.FC = () => {
  const user = {
    name: "Nguyễn Văn A",
    status: "Đang hoạt động",
    avatar: "https://i.pravatar.cc/100?img=3",
  };

  return (
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
      <Box sx={{ p: 2, textAlign: "center" }}>
        {/* Logo App */}
        <Typography variant="h6" fontWeight="bold">
          ResiBuy Shipper
        </Typography>

        {/* Avatar + Info */}
        <Stack alignItems="center" spacing={1} mt={2}>
          <Avatar
            src={user.avatar}
            alt={user.name}
            sx={{ width: 64, height: 64 }}
          />
          <Typography variant="subtitle1">{user.name}</Typography>
          <Typography variant="caption" color="green">
            ● {user.status}
          </Typography>
        </Stack>
      </Box>

      <Divider />

      {/* Menu */}
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/shipper">
            <ListItemText primary="Trang chủ" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/shipper/orders">
            <ListItemText primary="Lịch sử đơn hàng" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/">
            <ListItemText primary="Quay lại trang chủ" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default ShipperSidebar;
