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
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { useAuth } from "../../../contexts/AuthContext";
import userApi from "../../../api/user.api";
import shipperApi from "../../../api/ship.api";
import { useShipper } from "../../../contexts/ShipperContext";
const drawerWidth = 240;

const ShipperSidebar: React.FC = () => {
  const { user } = useAuth();
  const { shipperInfo, setShipperInfo } = useShipper();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      setLoading(true);

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

      setLoading(false);
    };

    fetchData();
  }, [user, setShipperInfo]);

  if (!shipperInfo || loading) return null;

  const { isOnline, user: shipperUser } = shipperInfo;
  const avatarUrl = shipperUser.avatar?.url;
  const fullName = shipperUser.fullName;

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
         Giao Hàng ResiBuy 
        </Typography>

        <Stack alignItems="center" spacing={1} mt={3}>
          <Avatar src={avatarUrl} alt={fullName} sx={{ width: 72, height: 72 }} />
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
          <ListItemButton component={Link} to="/shipper/attendance">
            <ListItemIcon>
              <AccessTimeIcon />
            </ListItemIcon>
            <ListItemText primary="Điểm danh" />
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
          <ListItemButton component={Link} to="/shipper/statistical">
            <ListItemIcon>
              <MonetizationOnIcon />
            </ListItemIcon>
            <ListItemText primary="Thu nhập" />
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
