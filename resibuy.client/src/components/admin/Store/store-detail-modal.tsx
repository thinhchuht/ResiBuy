import { useState } from "react";
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
  Avatar,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  Close,
  Store as StoreIcon,
  Email,
  Phone,
  LocationOn,
  CalendarMonth,
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
import type { Store, Order } from "../../../types/models";

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
  const {
    countProductsByStoreId,
    countSoldProductsByStoreId,
    countOrdersByStoreId,
    getStoreOrders,
    calculateStoreRevenue,
    getOrderStatusCounts,
    formatOrderStatus,
    getOrderStatusColor,
    handleViewOrderDetails,
    selectedOrder,
    getUserById,
  } = useStoresLogic();

  if (!isOpen || !store) return null;

  const totalProducts = countProductsByStoreId(store.id);
  const totalSoldProducts = countSoldProductsByStoreId(store.id);
  const totalOrders = countOrdersByStoreId(store.id);
  const totalRevenue = calculateStoreRevenue(store.id);
  const orders = getStoreOrders(store.id);
  const orderStatusCounts = getOrderStatusCounts(store.id);

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle sx={{ fontSize: 20, color: "success.main" }} />
    ) : (
      <ToggleOff sx={{ fontSize: 20, color: "error.main" }} />
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
          height: "90vh", // Giới hạn chiều cao modal
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
          <Typography
            variant="body2"
            sx={{ color: "grey.500" }}
          >
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
              startIcon={
                store.isActive ? (
                  <ToggleOff sx={{ fontSize: 16 }} />
                ) : (
                  <CheckCircle sx={{ fontSize: 16 }} />
                )
              }
              sx={{
                px: 1.5,
                py: 1,
                bgcolor: store.isActive ? "warning.main" : "success.main",
                color: "white",
                borderRadius: 2,
                "&:hover": {
                  bgcolor: store.isActive ? "warning.dark" : "success.dark",
                },
              }}
            >
              {store.isActive ? "Vô Hiệu Hóa" : "Kích Hoạt"}
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
          flex: "0 0 auto", // Không cho phép phần tóm tắt mở rộng
        }}
      >
        {/* Store Summary */}
        <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
          <Box sx={{ width: 80, height: 80 }}>
            {store.imageUrl ? (
              <Avatar
                src={store.imageUrl}
                alt={store.name}
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                }}
                imgProps={{
                  onError: (e) => {
                    e.currentTarget.src = "/images/default-store.png";
                  },
                }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  bgcolor: "linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)",
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
            )}
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
                  bgcolor: store.isActive ? "success.light" : "error.light",
                  color: store.isActive ? "success.dark" : "error.dark",
                }}
              >
                {getStatusIcon(store.isActive)}
                {store.isActive ? "Hoạt Động" : "Không Hoạt Động"}
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Email sx={{ fontSize: 16, color: "grey.400" }} />
                <Typography sx={{ color: "grey.600" }}>{store.email}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Phone sx={{ fontSize: 16, color: "grey.400" }} />
                <Typography sx={{ color: "grey.600" }}>{store.phoneNumber}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationOn sx={{ fontSize: 16, color: "grey.400" }} />
                <Typography sx={{ color: "grey.600" }}>{store.address}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarMonth sx={{ fontSize: 16, color: "grey.400" }} />
                <Typography sx={{ color: "grey.600" }}>
                  Tạo {formatDate(store.createdAt)}
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
              <Typography
                variant="caption"
                sx={{ color: "grey.500" }}
              >
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

      {/* Tabs */}
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

      {/* Tab Content */}
      <DialogContent
        sx={{
          p: 3,
          flex: 1,
          overflowY: "auto",
          minHeight: "300px", // Đảm bảo chiều cao tối thiểu
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {activeTab === "overview" && (
          <Box>
            <Typography
              variant="h6"
              sx={{ color: "grey.900", mb: 2 }}
            >
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
                <Typography
                  variant="body2"
                  sx={{ color: "grey.500", fontWeight: "medium" }}
                >
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
                <Typography sx={{ color: "grey.900", textTransform: "capitalize" }}>
                  {store.isActive ? "Hoạt Động" : "Không Hoạt Động"}
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
                <Box
                  sx={{
                    bgcolor: "grey.50",
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                        Chờ Xử Lý
                      </Typography>
                      <Typography sx={{ color: "grey.900" }}>{orderStatusCounts.pending}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                        Đang Xử Lý
                      </Typography>
                      <Typography sx={{ color: "grey.900" }}>{orderStatusCounts.processing}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                        Đã Giao
                      </Typography>
                      <Typography sx={{ color: "grey.900" }}>{orderStatusCounts.shipped}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                        Đã Giao Hàng
                      </Typography>
                      <Typography sx={{ color: "grey.900" }}>{orderStatusCounts.delivered}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                        Đã Hủy
                      </Typography>
                      <Typography sx={{ color: "grey.900" }}>{orderStatusCounts.cancelled}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {activeTab === "products" && (
          <Box>
            <Typography variant="h6" sx={{ color: "grey.900", mb: 2 }}>
              Sản Phẩm ({totalProducts} sản phẩm)
            </Typography>
            {store.products.length > 0 ? (
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
                        Số Lượng
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                        Đã Bán
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody sx={{ "& tr:hover": { bgcolor: "grey.50" } }}>
                    {store.products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell sx={{ px: 2, py: 1.5, fontFamily: "monospace", fontSize: "0.875rem", color: "primary.main" }}>
                          {product.id}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                          {product.name}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                          {formatCurrency(product.price)}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                          {product.quantity}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                          {product.sold}
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
              Lịch Sử Đơn Hàng ({orders.length} đơn hàng)
            </Typography>
            {orders.length > 0 ? (
              <Box sx={{ border: 1, borderColor: "grey.200", borderRadius: 2, overflow: "hidden" }}>
                <Table>
                  <TableHead sx={{ bgcolor: "grey.50" }}>
                    <TableRow>
                      <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                        ID Đơn Hàng
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                        Ngày
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                        Trạng Thái
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                        Tổng Cộng
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                        Hành Động
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody sx={{ "& tr:hover": { bgcolor: "grey.50" } }}>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell sx={{ px: 2, py: 1.5, fontFamily: "monospace", fontSize: "0.875rem", color: "primary.main" }}>
                          {order.id}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          <Box
                            sx={{
                              display: "inline-flex",
                              px: 1,
                              py: 0.5,
                              fontSize: "0.75rem",
                              fontWeight: "medium",
                              borderRadius: 1,
                              ...getOrderStatusColor(order.status),
                            }}
                          >
                            {formatOrderStatus(order.status)}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", fontWeight: "medium", color: "grey.900" }}>
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          <Button
                            onClick={() => handleViewOrderDetails(order.id)}
                            sx={{
                              color: "primary.main",
                              textTransform: "none",
                              fontSize: "0.875rem",
                              bgcolor: "background.paper",
                              "&:hover": { textDecoration: "underline" },
                            }}
                          >
                            Xem Chi Tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4, color: "grey.500" }}>
                <ShoppingCart sx={{ fontSize: 48, color: "grey.300", mb: 2 }} />
                <Typography>Không tìm thấy đơn hàng cho cửa hàng này</Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <Dialog
            open={!!selectedOrder}
            onClose={() => handleViewOrderDetails("")}
            maxWidth="sm"
            fullWidth
            sx={{
              "& .MuiDialog-paper": {
                borderRadius: 2,
                boxShadow: 24,
                p: 3,
                bgcolor: "background.paper",
              },
            }}
            BackdropProps={{
              sx: {
                bgcolor: "rgba(0, 0, 0, 0.5)",
              },
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography
              variant="h6"
              sx={{ color: "grey.900", fontWeight: "medium", mb: 2 }}
            >
              Chi Tiết Đơn Hàng #{selectedOrder.id}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                  Người Đặt Hàng
                </Typography>
                <Typography sx={{ color: "grey.900" }}>
                  {getUserById(selectedOrder.userId)?.fullName || "Không xác định"}
                </Typography>
                <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium", mt: 1 }}>
                  Tổng Số Tiền
                </Typography>
                <Typography sx={{ color: "grey.900" }}>
                  {formatCurrency(selectedOrder.totalAmount)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                  Trạng Thái
                </Typography>
                <Typography sx={{ color: "grey.900" }}>
                  {formatOrderStatus(selectedOrder.status)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                  Địa Chỉ Giao Hàng
                </Typography>
                <Typography sx={{ color: "grey.900" }}>{selectedOrder.shippingAddress}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                  Ngày Tạo
                </Typography>
                <Typography sx={{ color: "grey.900" }}>{formatDate(selectedOrder.createdAt)}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                  Sản Phẩm Đơn Hàng
                </Typography>
                {selectedOrder.orderItems.length > 0 ? (
                  <List sx={{ pl: 2 }}>
                    {selectedOrder.orderItems.map((item) => {
                      const product = store.products.find((p) => p.id === item.productId);
                      return (
                        <ListItem key={item.id} sx={{ color: "grey.900" }}>
                          <ListItemText
                            primary={`${product ? product.name : "Sản phẩm không xác định"} - Số lượng: ${item.quantity} - Giá: ${formatCurrency(item.price)}`}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                ) : (
                  <Typography sx={{ color: "grey.500" }}>Không tìm thấy sản phẩm</Typography>
                )}
              </Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              <Button
                onClick={() => handleViewOrderDetails("")}
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: "grey.100",
                  color: "grey.700",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "grey.200" },
                }}
              >
                Đóng
              </Button>
            </Box>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}