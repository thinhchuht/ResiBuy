import React, { useState, useEffect, useCallback } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Switch,
  Chip,
  Divider,
  Alert,
  Snackbar,
  Skeleton,
  Tooltip,
  IconButton,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import {
  Store as StoreIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  LocalOffer as VoucherIcon,
  ShoppingCart as OrdersIcon,
  BarChart as AnalyticsIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  CheckCircle as OpenIcon,
  Cancel as ClosedIcon,
} from "@mui/icons-material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "../../api/base.api";

interface Store {
  id: string;
  name: string;
  isOpen: boolean;
  address?: string;
  phone?: string;
  description?: string;
}

interface SidebarProps {
  open: boolean;
  onClose?: () => void;
  variant?: "permanent" | "persistent" | "temporary";
  width?: number;
}

const menuItems = [
  {
    id: "dashboard",
    label: "Tổng quan",
    icon: <DashboardIcon />,
    path: "",
  },
  {
    id: "products",
    label: "Sản phẩm",
    icon: <InventoryIcon />,
    path: "productPage",
  },
  {
    id: "orders",
    label: "Đơn hàng",
    icon: <OrdersIcon />,
    path: "orders",
  },
  {
    id: "vouchers",
    label: "Voucher",
    icon: <VoucherIcon />,
    path: "vouchers",
  },
  {
    id: "analytics",
    label: "Báo cáo",
    icon: <AnalyticsIcon />,
    path: "chart-view",
  },
  // {
  //   id: "settings",
  //   label: "Cài đặt",
  //   icon: <SettingsIcon />,
  //   path: "settings",
  // },
];

const Sidebar: React.FC<SidebarProps> = ({
  open = true,
  onClose,
  variant = "permanent",
  width = 280,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { storeId } = useParams<{ storeId: string }>();

  // State management
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch store information
  const fetchStoreInfo = useCallback(async () => {
    if (!storeId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/Store/${storeId}`);
      setStore(response.data.data || response.data);
    } catch (error: any) {
      console.error("Failed to fetch store info:", error);
      setError("Không thể tải thông tin cửa hàng");
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  // Toggle store status
  const handleToggleStoreStatus = async () => {
    if (!store || !storeId) return;

    try {
      setStatusLoading(true);
      setError(null);

      // Call API to toggle store status
      await axios.put(`/api/Store/${storeId}/status`, {
        storeId: storeId,
        isLocked: store.isOpen, // If store is open, we want to lock it (close it)
        isOpen: !store.isOpen, // Toggle the current status
      });

      // Update local state
      setStore((prev) => (prev ? { ...prev, isOpen: !prev.isOpen } : null));

      // Show success message
      setSuccess(
        store.isOpen
          ? "Đã đóng cửa hàng thành công"
          : "Đã mở cửa hàng thành công"
      );
    } catch (error: any) {
      console.error("Failed to toggle store status:", error);
      setError("Không thể thay đổi trạng thái cửa hàng. Vui lòng thử lại.");
    } finally {
      setStatusLoading(false);
    }
  };

  // Navigation handler
  const handleNavigation = (path: string) => {
    const targetPath = path ? `/store/${storeId}/${path}` : `/store/${storeId}`;
    navigate(targetPath);
    if (onClose && variant === "temporary") {
      onClose();
    }
  };

  // Check if current path is active
  const isActive = (path: string) => {
    const currentPath = location.pathname;
    const targetPath = path ? `/store/${storeId}/${path}` : `/store/${storeId}`;

    // Exact match for dashboard (empty path)
    if (!path) {
      return (
        currentPath === `/store/${storeId}` ||
        currentPath === `/store/${storeId}/`
      );
    }

    // For other paths, check if current path starts with the target path
    // This will highlight parent menu when on child routes (like product-create under products)
    if (path === "productPage") {
      return (
        currentPath.includes("/productPage") ||
        currentPath.includes("/product-create") ||
        currentPath.includes("/product-update")
      );
    }

    if (path === "vouchers") {
      return (
        currentPath.includes("/vouchers") ||
        currentPath.includes("/voucher-create") ||
        currentPath.includes("/voucher-update")
      );
    }

    return currentPath.includes(`/${path}`);
  };

  // Load store info on mount
  useEffect(() => {
    fetchStoreInfo();
  }, [fetchStoreInfo]);

  // Render store status section
  const renderStoreStatus = () => {
    if (loading) {
      return (
        <Card sx={{ mx: 2, mb: 2 }}>
          <CardContent>
            <Stack spacing={1}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="rectangular" height={40} />
            </Stack>
          </CardContent>
        </Card>
      );
    }

    if (!store) {
      return (
        <Alert severity="warning" sx={{ mx: 2, mb: 2 }}>
          Không thể tải thông tin cửa hàng
        </Alert>
      );
    }

    return (
      <Card sx={{ mx: 2, mb: 2 }} elevation={2}>
        <CardContent>
          <Stack spacing={2}>
            {/* Store name */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <StoreIcon color="primary" />
              <Typography variant="h6" noWrap>
                {store.name}
              </Typography>
              <Tooltip title="Làm mới">
                <IconButton
                  size="small"
                  onClick={fetchStoreInfo}
                  disabled={loading}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>

            {/* Store status toggle */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                {store.isOpen ? (
                  <OpenIcon color="success" fontSize="small" />
                ) : (
                  <ClosedIcon color="error" fontSize="small" />
                )}
                <Typography variant="body2">Trạng thái cửa hàng</Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <Chip
                  label={store.isOpen ? "Đang mở" : "Đã đóng"}
                  size="small"
                  color={store.isOpen ? "success" : "error"}
                  variant="filled"
                />
                <Switch
                  checked={store.isOpen}
                  onChange={handleToggleStoreStatus}
                  disabled={statusLoading}
                  color="success"
                  size="small"
                />
              </Stack>
            </Stack>

            {/* Additional store info */}
            {store.address && (
              <Typography variant="caption" color="text.secondary" noWrap>
                📍 {store.address}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  // Drawer content
  const drawerContent = (
    <Box
      sx={{
        width: width,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Quản lý cửa hàng
        </Typography>
      </Box>

      {/* Store status section */}
      <Box sx={{ py: 2 }}>{renderStoreStatus()}</Box>

      <Divider />

      {/* Navigation menu */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <List sx={{ py: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  "&.Mui-selected": {
                    backgroundColor: "primary.light",
                    color: "primary.contrastText",
                    "& .MuiListItemIcon-root": {
                      color: "primary.contrastText",
                    },
                  },
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.9rem",
                    fontWeight: isActive(item.path) ? "medium" : "normal",
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          display="block"
        >
          Store Management v1.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant={variant}
        open={open}
        onClose={onClose}
        sx={{
          width: width,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: width,
            boxSizing: "border-box",
            backgroundColor: "background.paper",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Sidebar;
