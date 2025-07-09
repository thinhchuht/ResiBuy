import { useState, useEffect } from "react";
import {  useNavigate } from "react-router-dom";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
} from "@mui/material";
import {
  Close,
  Store as StoreIcon,
  Inventory,
  ShoppingCart,
  Edit,
  Delete,
  ToggleOff,
  CheckCircle,
} from "@mui/icons-material";
import {
  formatCurrency,
  formatDate,
  useStoresLogic,
} from "../../../components/admin/Store/seg/utlis";
import type { Store } from "../../../types/models";

interface StoreDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store | null;
  onEdit?: (store: Store) => void;
  onDelete?: (storeId: string) => void;
  onToggleStatus?: (storeId: string) => void;
}

export function StoreDetailModal({
  isOpen,
  onClose,
  store,
  onEdit,
  onDelete,
  onToggleStatus,
}: StoreDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders">("overview");
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const {
    getProductsByStoreId,
    countProductsByStoreId,
    countSoldProductsByStoreId,
    countOrdersByStoreId,
    calculateStoreRevenue,
    getOrderStatusCounts,
    formatOrderStatus,
    getOrderStatusColor,
    handleViewOrderDetails,
    getStoreOrders,
  } = useStoresLogic();

  useEffect(() => {
    if (isOpen && store && activeTab === "products") {
      setLoadingProducts(true);
      Promise.all([
        getProductsByStoreId(store.id),
        countProductsByStoreId(store.id),
      ])
        .then(([productsData, totalCount]) => {
          setProducts(productsData);
          setTotalProducts(totalCount);
          setLoadingProducts(false);
        })
        .catch(() => {
          setProducts([]);
          setTotalProducts(0);
          setLoadingProducts(false);
        });
    }
  }, [isOpen, store, activeTab,]);

  if (!isOpen || !store) return null;

  const totalSoldProducts = countSoldProductsByStoreId(store.id);
  const totalOrders = countOrdersByStoreId(store.id);
  const totalRevenue = calculateStoreRevenue(store.id);
  const orderStatusCounts = getOrderStatusCounts(store.id);

  const getStatusIcon = (isLocked: boolean) => {
    return isLocked ? (
      <ToggleOff sx={{ fontSize: 20, color: "error.main" }} />
    ) : (
      <CheckCircle sx={{ fontSize: 20, color: "success.main" }} />
    );
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          maxWidth: "80rem",
          height: "90vh",
          margin: 0,
          borderRadius: 0,
          boxShadow: 24,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease-in-out",
          display: "flex",
          flexDirection: "column",
        },
      }}
      PaperProps={{ sx: { bgcolor: "background.paper" } }}
    >
      <DialogTitle
        sx={{
          p: 3,
          borderBottom: 1,
          borderColor: "grey.200",
          bgcolor: "background.paper",
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ color: "grey.900", fontWeight: "medium" }}
          >
            Chi Tiết Cửa Hàng
          </Typography>
          <Typography variant="body2" sx={{ color: "grey.500" }}>
            ID Cửa Hàng: {store.id}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {onEdit && (
            <Button
              onClick={() => onEdit(store)}
              startIcon={<Edit sx={{ fontSize: 16 }} />}
              sx={{
                px: 1.5,
                py: 1,
                bgcolor: "primary.main",
                color: "white",
                borderRadius: 2,
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              Sửa
            </Button>
          )}
          {onToggleStatus && (
            <Button
              onClick={() => onToggleStatus(store.id)}
              startIcon={getStatusIcon(store.isLocked)}
              sx={{
                px: 1.5,
                py: 1,
                bgcolor: store.isLocked ? "success.main" : "error.main",
                color: "white",
                borderRadius: 2,
                "&:hover": {
                  bgcolor: store.isLocked ? "success.dark" : "error.dark",
                },
              }}
            >
              {store.isLocked ? "Mở Khóa" : "Khóa"}
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={() => onDelete(store.id)}
              startIcon={<Delete sx={{ fontSize: 16 }} />}
              sx={{
                px: 1.5,
                py: 1,
                bgcolor: "error.main",
                color: "white",
                borderRadius: 2,
                "&:hover": { bgcolor: "error.dark" },
              }}
            >
              Xóa
            </Button>
          )}
          <IconButton
            onClick={onClose}
            sx={{
              color: "grey.400",
              bgcolor: "background.paper",
              p: 1,
              borderRadius: 2,
              "&:hover": {
                color: "grey.600",
                bgcolor: "grey.100",
              },
            }}
          >
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 3,
          bgcolor: "grey.50",
          borderBottom: 1,
          borderColor: "grey.200",
          flex: "0 0 auto",
        }}
      >
        <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
  <Box sx={{ width: 80, height: 80 }}>
    <Box
      sx={{
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)", // ✅ Sửa chỗ này
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "1.5rem",
        fontWeight: "bold",
      }}
    >
      {store.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()}
    </Box>
  </Box>


          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <Typography
                variant="h5"
                sx={{ color: "grey.900", fontWeight: "bold" }}
              >
                {store.name}
              </Typography>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1,
                  py: 0.5,
                  fontSize: "0.75rem",
                  fontWeight: "medium",
                  borderRadius: 1,
                  bgcolor: store.isLocked ? "error.light" : "success.light",
                  color: store.isLocked ? "error.dark" : "success.dark",
                }}
              >
                {getStatusIcon(store.isLocked)}
                {store.isLocked ? "Khóa" : "Hoạt Động"}
              </Box>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
                fontSize: "0.875rem",
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                  Ngày Tạo
                </Typography>
                <Typography sx={{ color: "grey.600" }}>
                  {formatDate(store.createdAt)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                  Mở Cửa
                </Typography>
                <Typography sx={{ color: "grey.600" }}>
                  {store.isOpen ? "Mở" : "Đóng"}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 2,
              textAlign: "center",
            }}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{ color: "primary.main", fontWeight: "bold" }}
              >
                {totalProducts}
              </Typography>
              <Typography variant="caption" sx={{ color: "grey.500" }}>
                Tổng Sản Phẩm
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{ color: "success.main", fontWeight: "bold" }}
              >
                {formatCurrency(totalRevenue)}
              </Typography>
              <Typography variant="caption" sx={{ color: "grey.500" }}>
                Tổng Doanh Thu
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{ color: "secondary.main", fontWeight: "bold" }}
              >
                {totalOrders}
              </Typography>
              <Typography variant="caption" sx={{ color: "grey.500" }}>
                Tổng Đơn Hàng
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <Box
        sx={{
          borderBottom: 1,
          borderColor: "grey.200",
          position: "sticky",
          top: 0,
          zIndex: 9,
          bgcolor: "background.paper",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ "& .MuiTabs-indicator": { bgcolor: "primary.main" } }}
        >
          {[
            { id: "overview", label: "Tổng Quan", icon: <StoreIcon sx={{ fontSize: 16 }} /> },
            { id: "products", label: "Sản Phẩm", icon: <Inventory sx={{ fontSize: 16 }} /> },
            { id: "orders", label: "Đơn Hàng", icon: <ShoppingCart sx={{ fontSize: 16 }} /> },
          ].map((tab) => (
            <Tab
              key={tab.id}
              value={tab.id}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {tab.icon}
                  {tab.label}
                </Box>
              }
              sx={{
                px: 3,
                py: 2,
                fontSize: "0.875rem",
                fontWeight: "medium",
                color: activeTab === tab.id ? "primary.main" : "grey.500",
                "&:hover": { color: "grey.700" },
              }}
            />
          ))}
        </Tabs>
      </Box>

      <DialogContent
        sx={{
          p: 3,
          flex: 1,
          overflowY: "auto",
          minHeight: "300px",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {activeTab === "overview" && (
          <Box>
            <Typography variant="h6" sx={{ color: "grey.900", mb: 2 }}>
              Thông Tin Cửa Hàng
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 3,
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                  Mô Tả
                </Typography>
                <Typography sx={{ color: "grey.900" }}>
                  {store.description || "Không có mô tả"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                  Trạng Thái Hoạt Động
                </Typography>
                <Typography sx={{ color: "grey.900" }}>
                  {store.isLocked ? "Khóa" : "Hoạt Động"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                  Tổng Sản Phẩm Đã Bán
                </Typography>
                <Typography sx={{ color: "grey.900" }}>{totalSoldProducts}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                  Giá Trị Đơn Hàng Trung Bình
                </Typography>
                <Typography sx={{ color: "grey.900" }}>
                  {totalOrders > 0 ? formatCurrency(totalRevenue / totalOrders) : "0 VNĐ"}
                </Typography>
              </Box>
            </Box>

            {orderStatusCounts && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ color: "grey.900", mb: 2 }}>
                  Tóm Tắt Trạng Thái Đơn Hàng
                </Typography>
                <Typography sx={{ color: "grey.500" }}>
                  N/A - API trạng thái đơn hàng chưa được triển khai
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {activeTab === "products" && (
          <Box>
            <Typography variant="h6" sx={{ color: "grey.900", mb: 2 }}>
              Sản Phẩm ({totalProducts} sản phẩm)
            </Typography>
            {loadingProducts ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : products.length > 0 ? (
              <Box sx={{ border: 1, borderColor: "grey.200", borderRadius: 2, overflow: "hidden" }}>
                <Table>
                  <TableHead sx={{ bgcolor: "grey.50" }}>
                    <TableRow>
                      <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                        ID Sản Phẩm
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                        Tên
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                        Giá
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                        Trạng Thái
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                        Đã Bán
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody sx={{ "& tr:hover": { bgcolor: "grey.50" } }}>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell sx={{ px: 2, py: 1.5, fontFamily: "monospace", fontSize: "0.875rem", color: "primary.main" }}>
                          {product.id}
                        </TableCell>
<TableCell
  sx={{
    px: 2,
    py: 1.5,
    fontSize: "0.875rem",
    color: "primary.main",
    cursor: "pointer",
    textDecoration: "none", // ❌ Bỏ gạch chân
    transition: "all 0.3s ease-in-out",
    "&:hover": {
      backgroundImage: "linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
  }}
  onClick={() => navigate(`/products?id=${product.id}`)}
>
  {product.name}
</TableCell>


                        <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                          {product.productDetails[0] ? formatCurrency(product.productDetails[0].price) : "N/A"}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                          {product.productDetails[0]
                            ? product.productDetails[0].isOutOfStock
                              ? "Hết hàng"
                              : "Còn hàng"
                            : "N/A"}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                          {product.productDetails[0] ? product.productDetails[0].sold : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4, color: "grey.500" }}>
                <Inventory sx={{ fontSize: 48, color: "grey.300", mb: 2 }} />
                <Typography>Không tìm thấy sản phẩm cho cửa hàng này</Typography>
              </Box>
            )}
          </Box>
        )}

        {activeTab === "orders" && (
          <Box>
            <Typography variant="h6" sx={{ color: "grey.900", mb: 2 }}>
              Lịch Sử Đơn Hàng (N/A)
            </Typography>
            <Box sx={{ textAlign: "center", py: 4, color: "grey.500" }}>
              <ShoppingCart sx={{ fontSize: 48, color: "grey.300", mb: 2 }} />
              <Typography>Không có dữ liệu đơn hàng - API chưa được triển khai</Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}