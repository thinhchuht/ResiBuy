import Logo from "../../../assets/Images/Logo.png";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Box, Typography, Avatar, Divider, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Stack, Paper } from "@mui/material";
import { Settings, Logout, ShoppingBag } from "@mui/icons-material";
import { menuItems } from "../../../constants/share";
import { useCallback, useMemo } from "react";
import { HubEventType, useEventHub, type HubEventHandler } from "../../../hooks/useEventHub";
import { useToastify } from "../../../hooks/useToastify";
import { useAuth } from "../../../contexts/AuthContext";

export function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const toast = useToastify();
  const { user, logout } = useAuth();

  const handleOrderReported = useCallback(() => {
    toast.success("Vừa có 1 báo cáo mới được tạo");
  }, [toast]);

  const eventHandlers = useMemo(
    () => ({
      [HubEventType.OrderReported]: handleOrderReported,
    }),
    [handleOrderReported]
  );

  useEventHub(eventHandlers as Partial<Record<HubEventType, HubEventHandler>>);

  const handleLogout = async () => {
    try {
      await logout();
      // toast.success("Đăng xuất thành công!");
      // navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Lỗi khi đăng xuất");
    }
  };

  // Lấy tên và email người dùng, hoặc giá trị mặc định nếu user là null
  const displayName = user?.fullName || "Admin User";
  const displayEmail = user?.email || "admin@b";
  const avatarInitials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD";

  return (
    <Paper
      elevation={0}
      sx={{
        width: 256,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #e0e0e0",
      }}>
      {/* Header */}
      <Box sx={{ px: 1, py: 2, borderBottom: "1px solid #e0e0e0" }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            <img src={Logo} alt="Logo" width={100} height={72} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Administrator
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Trang quản trị
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Main Menu */}
      <Box sx={{ flex: 1, py: 2, px: 2 }}>
        <List disablePadding>
          {menuItems.map((item) => {
            const isActive = pathname === item.url;
            const Icon = item.icon;

            return (
              <ListItemButton
                key={item.title}
                component={Link}
                to={item.url}
                selected={isActive}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  color: isActive ? "primary.main" : "text.secondary",
                  "&:hover": {
                    backgroundColor: "action.hover",
                    color: "text.primary",
                  },
                }}>
                <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                  <Icon sx={{ fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText primary={item.title} primaryTypographyProps={{ fontSize: 14 }} />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Divider />
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          <Avatar sx={{ bgcolor: "grey.200", width: 32, height: 32 }}>
            <Typography fontSize={12}>{avatarInitials}</Typography>
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap fontWeight={500}>
              {displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {displayEmail}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1}>
          {/* <IconButton size="small" sx={{ color: "text.secondary" }}>
            <Settings sx={{ width: 16, height: 16 }} />
          </IconButton> */}
          <IconButton size="small" sx={{ color: "text.secondary" }} onClick={handleLogout}>
            <Logout sx={{ width: 16, height: 16 }} />
          </IconButton>
        </Stack>
      </Box>
    </Paper>
  );
}

export default Sidebar;
