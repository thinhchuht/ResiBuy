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
      <CheckCircle sx={{ fontSize: 20, color: "success.main" }} /> // Thay w-5 h-5 text-green-600
    ) : (
      <ToggleOff sx={{ fontSize: 20, color: "error.main" }} /> // Thay w-5 h-5 text-red-600
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
          maxWidth: "80rem", // Thay max-w-5xl
          height: "100%",
          margin: 0,
          borderRadius: 0,
          boxShadow: 24, // Thay shadow-2xl
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease-in-out", // Thay transition-transform duration-300 ease-in-out
        },
      }}
      PaperProps={{ sx: { bgcolor: "background.paper" } }}
    >
      {/* Backdrop */}
      {/* <Box
        sx={{
          position: "fixed",
          inset: 0,
          bgcolor: "rgba(0, 0, 0, 0.6)", // Thay bg-black bg-opacity-60
          zIndex: 9998,
          transition: "opacity 0.3s", // Thay transition-opacity duration-300
          opacity: isOpen ? 1 : 0,
        }}
        onClick={onClose}
      /> */}

      <DialogTitle
        sx={{
          p: 3, // Thay p-6
          borderBottom: 1,
          borderColor: "grey.200", // Thay border-b border-gray-200
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
            sx={{ color: "grey.900", fontWeight: "medium" }} // Thay text-xl font-semibold text-gray-900
          >
            Chi Tiết Cửa Hàng
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "grey.500" }} // Thay text-sm text-gray-500
          >
            ID Cửa Hàng: {store.id}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}> {/* Thay gap-2 */}
          {onEdit && (
            <Button
              onClick={() => onEdit(store)}
              startIcon={<Edit sx={{ fontSize: 16 }} />} // Thay w-4 h-4
              sx={{
                px: 1.5, // Thay px-3
                py: 1, // Thay py-2
                bgcolor: "primary.main", // Thay bg-blue-600
                color: "white", // Thay text-white
                borderRadius: 2, // Thay rounded-lg
                "&:hover": { bgcolor: "primary.dark" }, // Thay hover:bg-blue-700
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
              } // Thay w-4 h-4
              sx={{
                px: 1.5,
                py: 1,
                bgcolor: store.isActive ? "warning.main" : "success.main", // Thay bg-yellow-600, bg-green-600
                color: "white",
                borderRadius: 2,
                "&:hover": {
                  bgcolor: store.isActive ? "warning.dark" : "success.dark", // Thay hover:bg-yellow-700, hover:bg-green-700
                },
              }}
            >
              {store.isActive ? "Vô Hiệu Hóa" : "Kích Hoạt"}
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={() => onDelete(store.id)}
              startIcon={<Delete sx={{ fontSize: 16 }} />} // Thay w-4 h-4
              sx={{
                px: 1.5,
                py: 1,
                bgcolor: "error.main", // Thay bg-red-600
                color: "white",
                borderRadius: 2,
                "&:hover": { bgcolor: "error.dark" }, // Thay hover:bg-red-700
              }}
            >
              Xóa
            </Button>
          )}
          <IconButton
            onClick={onClose}
            sx={{
              color: "grey.400", // Thay text-gray-400
              bgcolor: "background.paper",
              p: 1, // Thay p-2
              borderRadius: 2, // Thay rounded-lg
              "&:hover": {
                color: "grey.600", // Thay hover:text-gray-600
                bgcolor: "grey.100", // Thay hover:bg-gray-100
              },
            }}
          >
            <Close sx={{ fontSize: 20 }} /> {/* Thay h-5 w-5 */}
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 3, // Thay p-6
          bgcolor: "grey.50", // Thay bg-gray-50
          borderBottom: 1,
          borderColor: "grey.200", // Thay border-b border-gray-200
        }}
      >
        {/* Store Summary */}
        <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}> {/* Thay gap-6 */}
          <Box sx={{ width: 80, height: 80 }}> {/* Thay w-20 h-20 */}
            {store.imageUrl ? (
              <Avatar
                src={store.imageUrl}
                alt={store.name}
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%", // Thay rounded-full
                }}
                imgProps={{
                  onError: (e) => {
                    e.currentTarget.src = "/images/default-store.png"; // Hình ảnh mặc định
                  },
                }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  bgcolor: "linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)", // Thay bg-gradient-to-br from-blue-500 to-purple-600
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "1.5rem", // Thay text-2xl
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}> {/* Thay gap-3 mb-2 */}
              <Typography
                variant="h5"
                sx={{ color: "grey.900", fontWeight: "bold" }} // Thay text-2xl font-bold text-gray-900
              >
                {store.name}
              </Typography>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5, // Thay gap-1
                  px: 1, // Thay px-2
                  py: 0.5, // Thay py-1
                  fontSize: "0.75rem", // Thay text-xs
                  fontWeight: "medium",
                  borderRadius: 1, // Thay rounded-full
                  bgcolor: store.isActive ? "success.light" : "error.light", // Thay bg-green-100, bg-red-100
                  color: store.isActive ? "success.dark" : "error.dark", // Thay text-green-800, text-red-800
                }}
              >
                {getStatusIcon(store.isActive)}
                {store.isActive ? "Hoạt Động" : "Không Hoạt Động"}
              </Box>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, // Thay grid-cols-1 md:grid-cols-2
                gap: 2, // Thay gap-4
                fontSize: "0.875rem", // Thay text-sm
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}> {/* Thay gap-2 */}
                <Email sx={{ fontSize: 16, color: "grey.400" }} /> {/* Thay w-4 h-4 text-gray-400 */}
                <Typography sx={{ color: "grey.600" }}>{store.email}</Typography> {/* Thay text-gray-600 */}
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
              gridTemplateColumns: "1fr 1fr 1fr", // Thay grid-cols-3
              gap: 2, // Thay gap-4
              textAlign: "center",
            }}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{ color: "primary.main", fontWeight: "bold" }} // Thay text-2xl font-bold text-blue-600
              >
                {totalProducts}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "grey.500" }} // Thay text-xs text-gray-500
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
                sx={{ color: "secondary.main", fontWeight: "bold" }} // Thay text-2xl font-bold text-purple-600
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
          borderColor: "grey.200", // Thay border-b border-gray-200
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ "& .MuiTabs-indicator": { bgcolor: "primary.main" } }} // Thay border-blue-500
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
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}> {/* Thay gap-2 */}
                  {tab.icon}
                  {tab.label}
                </Box>
              }
              sx={{
                px: 3, // Thay px-6
                py: 2, // Thay py-4
                fontSize: "0.875rem", // Thay text-sm
                fontWeight: "medium",
                color: activeTab === tab.id ? "primary.main" : "grey.500", // Thay text-blue-600, text-gray-500
                "&:hover": { color: "grey.700" }, // Thay hover:text-gray-700
                bgcolor: "background.paper",
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}> {/* Thay p-6 space-y-6 */}
        {activeTab === "overview" && (
          <Box>
            <Typography
              variant="h6"
              sx={{ color: "grey.900", mb: 2 }} // Thay text-lg font-medium text-gray-900 mb-4
            >
              Thông Tin Cửa Hàng
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, // Thay grid-cols-1 md:grid-cols-2
                gap: 3, // Thay gap-6
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: "grey.500", fontWeight: "medium" }} // Thay text-sm font-medium text-gray-500
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
                    bgcolor: "grey.50", // Thay bg-gray-50
                    borderRadius: 2, // Thay rounded-lg
                    p: 2, // Thay p-4
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr" }, // Thay grid-cols-2 md:grid-cols-3
                      gap: 2, // Thay gap-4
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
                <Inventory sx={{ fontSize: 48, color: "grey.300", mb: 2 }} /> {/* Thay w-12 h-12 */}
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
                              px: 1, // Thay px-2
                              py: 0.5, // Thay py-1
                              fontSize: "0.75rem", // Thay text-xs
                              fontWeight: "medium",
                              borderRadius: 1, // Thay rounded-full
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
                              color: "primary.main", // Thay text-blue-600
                              textTransform: "none",
                              fontSize: "0.875rem", // Thay text-sm
                              bgcolor: "background.paper",
                              "&:hover": { textDecoration: "underline" }, // Thay hover:underline
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
    onClick={(e) => e.stopPropagation()} // Ngăn sự kiện lan truyền
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