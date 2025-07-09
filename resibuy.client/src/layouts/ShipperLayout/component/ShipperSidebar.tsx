import React, { useEffect, useState } from "react";
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
import { useAuth } from "../../../contexts/AuthContext";
import userApi from "../../../api/user.api";
import shipperApi from "../../../api/ship.api";

const drawerWidth = 240;

interface ShipperUser {
  fullName: string;
  avatar?: {
    url?: string;
  };
}

interface ShipperInfo {
  isOnline: boolean;
  user: ShipperUser;
  // Add other fields from shipperRes.data if needed
}

const ShipperSidebar: React.FC = () => {
  const { user } = useAuth();
  const [shipperInfo, setShipperInfo] = useState<ShipperInfo | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      const [shipperRes, userRes] = await Promise.all([
        shipperApi.getByUserId(user.id),
        userApi.getById(user.id),
      ]);

      if (!shipperRes.error && !userRes.error) {
        setShipperInfo({
          ...shipperRes.data,
          user: {
            ...shipperRes.data.user,
            avatar: userRes.data.avatar, // Gộp avatar từ userApi
          },
        });
      }
    };

    fetchData();
  }, [user]);

  if (!shipperInfo) return null;

  const isOnline = shipperInfo.isOnline;
  const avatarUrl = shipperInfo.user.avatar?.url;
  const fullName = shipperInfo.user.fullName;

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
        <Typography variant="h6" fontWeight="bold">
          ResiBuy Shipper
        </Typography>

        <Stack alignItems="center" spacing={1} mt={2}>
          <Avatar
            src={avatarUrl}
            alt={fullName}
            sx={{ width: 64, height: 64 }}
          />
          <Typography variant="subtitle1">{fullName}</Typography>
          <Typography variant="caption" color={isOnline ? "green" : "gray"}>
            ● {isOnline ? "Đang hoạt động" : "Ngoại tuyến"}
          </Typography>
        </Stack>
      </Box>

      <Divider />

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
