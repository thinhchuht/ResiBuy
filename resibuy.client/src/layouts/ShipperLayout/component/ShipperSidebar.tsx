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
  ListItemIcon,
  Chip,
} from "@mui/material";
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import HistoryIcon from "@mui/icons-material/History";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
            avatar: userRes.data.avatar,
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
          backgroundColor: "#fff",
          borderRight: "1px solid #e0e0e0",
        },
      }}
    >
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" fontWeight="bold">
          ResiBuy Shipper
        </Typography>

        <Stack alignItems="center" spacing={1} mt={3}>
          <Avatar
            src={avatarUrl}
            alt={fullName}
            sx={{ width: 72, height: 72 }}
          />
          <Typography variant="subtitle1" fontWeight={600}>
            {fullName}
          </Typography>
          <Chip
            label={isOnline ? "Đang hoạt động" : "Ngoại tuyến"}
            size="small"
            color={isOnline ? "success" : "default"}
            variant="outlined"
          />
        </Stack>
      </Box>

      <Divider sx={{ my: 2 }} />

      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/shipper">
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Trang giao hàng" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={Link} to="/shipper/orders">
            <ListItemIcon>
              <HistoryIcon />
            </ListItemIcon>
            <ListItemText primary="Lịch sử đơn hàng" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={Link} to="/">
            <ListItemIcon>
              <ArrowBackIcon />
            </ListItemIcon>
            <ListItemText primary="Quay lại trang chủ" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default ShipperSidebar;
