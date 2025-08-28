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
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  Store as StoreIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  LocalOffer as VoucherIcon,
  ShoppingCart as OrdersIcon,
  BarChart as AnalyticsIcon,
  Refresh as RefreshIcon,
  CheckCircle as OpenIcon,
  Cancel as ClosedIcon,
  Payment as PaymentIcon,
  CheckCircle as PaidIcon,
} from "@mui/icons-material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "../../api/base.api";
import vnPayApi from "../../api/vnpay.api";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface Store {
  id: string;
  name: string;
  isOpen: boolean;
  isPayFee: boolean; // ✅ Thêm field IsPayFee
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
    label: "Thống kê",
    icon: <AnalyticsIcon />,
    path: "chart-view",
  },
];

const Sidebar: React.FC<SidebarProps> = ({ open = true, onClose, variant = "permanent", width = 280 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { storeId } = useParams<{ storeId: string }>();

  // State management
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false); // ✅ Loading cho payment
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);

  // Fetch store information
  const fetchStoreInfo = useCallback(async () => {
    if (!storeId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<Store | { data: Store }>(`/api/Store/${storeId}`);
      setStore("data" in response.data ? response.data.data : response.data);
    } catch (error: unknown) {
      console.error("Failed to fetch store info:", error);
      setError("Không thể tải thông tin cửa hàng");
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  // Handle store payment
  const handleStorePayment = async () => {
    if (!storeId) return;

    try {
      setPaymentLoading(true);
      setError(null);

      const result = await vnPayApi.getStorePaymentUrl(storeId);

      if (result.success && result.data?.paymentUrl?.result) {
        // Redirect to VNPay for payment
        window.location.href = result.data.paymentUrl.result;
      } else {
        const errorMessage = result.error?.response?.data?.message || "Không thể tạo thanh toán";
        setError(errorMessage);
      }
    } catch (error: unknown) {
      console.error("Payment creation failed:", error);
      setError("Có lỗi xảy ra khi tạo thanh toán");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Open status confirmation dialog
  const handleOpenStatusDialog = () => {
    setOpenStatusDialog(true);
  };

  // Close status confirmation dialog
  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
  };

  // Toggle store status
  const handleToggleStoreStatus = async () => {
    if (!store || !storeId) return;

    try {
      setStatusLoading(true);
      setError(null);

      await axios.put(`/api/Store/${storeId}/status`, {
        storeId: storeId,
        isOpen: !store.isOpen,
      });

      setStore((prev) => (prev ? { ...prev, isOpen: !prev.isOpen } : null));
      setSuccess(store.isOpen ? "Đã đóng cửa hàng thành công" : "Đã mở cửa hàng thành công");
      setOpenStatusDialog(false);
    } catch (error: unknown) {
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

    if (!path) {
      return currentPath === `/store/${storeId}` || currentPath === `/store/${storeId}/`;
    }

    if (path === "productPage") {
      return currentPath.includes("/productPage") || currentPath.includes("/product-create") || currentPath.includes("/product-update");
    }

    if (path === "vouchers") {
      return currentPath.includes("/vouchers") || currentPath.includes("/voucher-create") || currentPath.includes("/voucher-update");
    }

    return currentPath.includes(`/${path}`);
  };

  // ✅ Check for payment success in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    const token = urlParams.get("token");

    if (paymentStatus && token) {
      // Verify token
      vnPayApi.verifyPaymentToken(token).then((result) => {
        if (result.success && result.data.isValid) {
          if (paymentStatus === "success") {
            setSuccess("Thanh toán phí cửa hàng thành công!");
            // Refresh store info để cập nhật isPayFee
            fetchStoreInfo();
          } else if (paymentStatus === "failed") {
            setError("Thanh toán thất bại, vui lòng thử lại!");
          } else if (paymentStatus === "error") {
            setError("Có lỗi xảy ra trong quá trình thanh toán!");
          }

          // Clean up URL và invalidate token
          window.history.replaceState({}, "", `/store/${storeId}`);
          vnPayApi.invalidatePaymentToken(token);
        }
      });
    }
  }, [storeId, fetchStoreInfo]);

  // Load store info on mount
  useEffect(() => {
    fetchStoreInfo();
  }, [fetchStoreInfo]);

  // ✅ Render payment fee section
  const renderPaymentSection = () => {
    if (loading || !store) return null;

    return (
      <Box sx={{ mx: 2, mb: 2 }}>
        {store.isPayFee ? (
          // ✅ Đã thanh toán - Hiển thị trạng thái và vô hiệu hóa
          <Button
            fullWidth
            variant="outlined"
            disabled
            startIcon={<PaidIcon />}
            sx={{
              color: "success.main",
              borderColor: "success.main",
              "&.Mui-disabled": {
                color: "success.main",
                borderColor: "success.light",
              },
            }}>
            Đã thanh toán phí
          </Button>
        ) : (
          // ✅ Chưa thanh toán - Hiển thị nút thanh toán
          <Button
            fullWidth
            variant="contained"
            color="warning"
            startIcon={paymentLoading ? <CircularProgress size={18} color="inherit" /> : <PaymentIcon />}
            onClick={handleStorePayment}
            disabled={paymentLoading}
            sx={{
              backgroundColor: "warning.main",
              "&:hover": {
                backgroundColor: "warning.dark",
              },
            }}>
            {paymentLoading ? "Đang xử lý..." : "Thanh toán phí cửa hàng"}
          </Button>
        )}
      </Box>
    );
  };

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
                <IconButton size="small" onClick={fetchStoreInfo} disabled={loading}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>

            {/* ✅ Payment status chip */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2">Phí cửa hàng:</Typography>
              <Chip
                label={store.isPayFee ? "Đã thanh toán" : "Chưa thanh toán"}
                size="small"
                color={store.isPayFee ? "success" : "warning"}
                variant="filled"
                icon={store.isPayFee ? <PaidIcon /> : <PaymentIcon />}
              />
            </Stack>

            {/* Store status toggle */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1}>
                {store.isOpen ? <OpenIcon color="success" fontSize="small" /> : <ClosedIcon color="error" fontSize="small" />}
                <Typography variant="body2">Trạng thái cửa hàng</Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <Chip label={store.isOpen ? "Đang mở" : "Đã đóng"} size="small" color={store.isOpen ? "success" : "error"} variant="filled" />
                <Switch checked={store.isOpen} onChange={handleOpenStatusDialog} color="success" disabled={statusLoading} inputProps={{ "aria-label": "controlled" }} />
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

  // Render status dialog
  const renderStatusDialog = () => (
    <Dialog
      open={openStatusDialog}
      onClose={handleCloseStatusDialog}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          minWidth: "400px",
          maxWidth: "450px",
          width: "100%",
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.1)",
        },
      }}>
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            bgcolor: store?.isOpen ? "#ffebee" : "#e8f5e9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
          }}>
          {store?.isOpen ? <WarningIcon sx={{ color: "#f44336", fontSize: 36 }} /> : <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 36 }} />}
        </Box>

        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: "1.5rem",
            p: 0,
            mb: 1,
          }}>
          {store?.isOpen ? "Đóng cửa hàng" : "Mở cửa hàng"}
        </DialogTitle>

        <DialogContent sx={{ p: 0, mb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            {store?.isOpen ? `Bạn có chắc muốn đóng cửa hàng?` : `Bạn có chắc muốn mở cửa hàng?`}
          </Typography>

          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: "rgba(0,0,0,0.02)",
              borderRadius: 2,
              textAlign: "left",
              border: "1px dashed rgba(0,0,0,0.1)",
            }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <StoreIcon sx={{ fontSize: 16, mr: 1, opacity: 0.7 }} />
              <span>
                Tên cửa hàng: <strong>{store?.name}</strong>
              </span>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center" }}>
              {store?.isOpen ? <OpenIcon sx={{ fontSize: 16, mr: 1, color: "#4caf50" }} /> : <ClosedIcon sx={{ fontSize: 16, mr: 1, color: "#f44336" }} />}
              <span>
                Trạng thái hiện tại: <strong>{store?.isOpen ? "Đang mở" : "Đã đóng"}</strong>
              </span>
            </Typography>
          </Box>

          {store?.isOpen && (
            <Alert severity="warning" sx={{ mt: 2, textAlign: "left", borderRadius: 2 }}>
              <Typography variant="body2">Khi đóng cửa hàng, khách hàng sẽ không thể xem hoặc đặt hàng từ cửa hàng của bạn.</Typography>
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", gap: 2, p: 0, mt: 2 }}>
          <Button
            onClick={handleCloseStatusDialog}
            variant="outlined"
            disabled={statusLoading}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              borderColor: "#e0e0e0",
              color: "text.primary",
              textTransform: "none",
              "&:hover": {
                borderColor: "#bdbdbd",
                bgcolor: "rgba(0,0,0,0.02)",
              },
            }}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleToggleStoreStatus}
            variant="contained"
            disabled={statusLoading}
            startIcon={statusLoading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              bgcolor: store?.isOpen ? "#f44336" : "#4caf50",
              color: "white",
              textTransform: "none",
              "&:hover": {
                bgcolor: store?.isOpen ? "#e53935" : "#43a047",
              },
              "&.Mui-disabled": {
                bgcolor: "rgba(0, 0, 0, 0.12)",
                color: "rgba(0, 0, 0, 0.26)",
              },
            }}>
            {statusLoading ? "Đang xử lý..." : store?.isOpen ? "Xác nhận đóng cửa" : "Xác nhận mở cửa"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );

  // Drawer content
  const drawerContent = (
    <Box
      sx={{
        width: width,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Quản lý cửa hàng
        </Typography>
      </Box>

      {/* Store status section */}
      <Box sx={{ py: 2 }}>{renderStoreStatus()}</Box>

      {/* ✅ Payment section */}
      {renderPaymentSection()}

      <Divider />

      {/* Navigation menu */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <List sx={{ py: 1 }}>
          {menuItems.map((menuItem) => (
            <ListItem key={menuItem.id} disablePadding>
              <ListItemButton selected={isActive(menuItem.path)} onClick={() => handleNavigation(menuItem.path)}>
                <ListItemIcon>{menuItem.icon}</ListItemIcon>
                <ListItemText primary={menuItem.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
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
          boxSizing: "border-box",
          backgroundColor: "background.paper",
          "& .MuiDrawer-paper": {
            width: width,
            boxSizing: "border-box",
          },
        }}>
        {drawerContent}
      </Drawer>

      {renderStatusDialog()}

      {/* Error Snackbar */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: "100%" }}>
          {success}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Sidebar;
