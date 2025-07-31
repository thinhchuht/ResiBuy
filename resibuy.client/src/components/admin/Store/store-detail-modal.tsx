
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Chip,
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
  Visibility,
} from "@mui/icons-material";
import {
  formatCurrency,
  formatDate,
  formatOrderStatus,
  getOrderStatusColor,
  useStoresLogic,
} from "../../../components/admin/Store/seg/utlis";
import orderApi from "../../../api/order.api";
import type { Store, Order } from "../../../types/models";
import { useToastify } from "../../../hooks/useToastify";

interface StoreDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store | null;
  onEdit?: (store: Store) => void;
  onDelete?: (storeId: string) => void;
  onToggleStatus?: (storeId: string) => void;
}

interface OrderDetailDialogProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
}

const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({ open, onClose, order }) => {
  const navigate = useNavigate();
  if (!open || !order) return null;

  const formatShippingAddress = (order: Order): string => {
    const { roomQueryResult } = order;
    if (!roomQueryResult) return "Không có thông tin địa chỉ";
    const { name, buildingName, areaName } = roomQueryResult;
    return `${name}, ${buildingName}, ${areaName}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 2,
          boxShadow: 24,
          p: 2,
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" sx={{ color: "grey.900" }}>
          Chi Tiết Đơn Hàng
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "grey.500" }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              ID Người Dùng
            </Typography>
            <Typography sx={{ color: "grey.900" }}>{order.userId}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              Số Điện Thoại Shipper
            </Typography>
            <Typography sx={{ color: "grey.900" }}>{order.shipper?.phoneNumber || "N/A"}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              Ngày Tạo
            </Typography>
            <Typography sx={{ color: "grey.900" }}>{formatDate(order.createAt)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              Ngày Cập Nhật
            </Typography>
            <Typography sx={{ color: "grey.900" }}>{formatDate(order.updateAt)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              Trạng Thái
            </Typography>
            <Chip
              label={formatOrderStatus(order.status)}
              sx={{
                bgcolor: getOrderStatusColor(order.status).bgcolor,
                color: getOrderStatusColor(order.status).color,
                fontSize: "0.75rem",
                height: 24,
              }}
            />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              Trạng Thái Thanh Toán
            </Typography>
            <Typography sx={{ color: "grey.900" }}>{order.paymentStatus}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              Phương Thức Thanh Toán
            </Typography>
            <Typography sx={{ color: "grey.900" }}>{order.paymentMethod}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              Tổng Tiền
            </Typography>
            <Typography sx={{ color: "grey.900" }}>{formatCurrency(order.totalPrice)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              Phí Vận Chuyển
            </Typography>
            <Typography sx={{ color: "grey.900" }}>{formatCurrency(order.shippingFee)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              Ghi Chú
            </Typography>
            <Typography sx={{ color: "grey.900" }}>{order.note || "Không có ghi chú"}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              Địa Chỉ Giao Hàng
            </Typography>
            <Typography sx={{ color: "grey.900" }}>{formatShippingAddress(order)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              Cửa Hàng
            </Typography>
            <Typography sx={{ color: "grey.900" }}>{order.store.name}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium", mb: 1 }}>
              Sản Phẩm
            </Typography>
            {order.orderItems.length > 0 ? (
              <Table sx={{ border: 1, borderColor: "grey.200", borderRadius: 1 }}>
                <TableHead sx={{ bgcolor: "grey.50" }}>
                  <TableRow>
                    <TableCell sx={{ fontSize: "0.75rem", color: "grey.500", fontWeight: "medium" }}>
                      Tên Sản Phẩm
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.75rem", color: "grey.500", fontWeight: "medium" }}>
                      Số Lượng
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.75rem", color: "grey.500", fontWeight: "medium" }}>
                      Giá
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.orderItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell
                        sx={{
                          px: 2,
                          py: 1.5,
                          fontSize: "0.875rem",
                          color: "primary.main",
                          cursor: "pointer",
                          textDecoration: "none",
                          transition: "all 0.3s ease-in-out",
                          "&:hover": {
                            backgroundImage: "linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          },
                        }}
                        onClick={() => navigate(`/products?id=${item.productId}`)}
                      >
                        {item.productName}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.875rem" }}>{item.quantity}</TableCell>
                      <TableCell sx={{ fontSize: "0.875rem" }}>{formatCurrency(item.price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography sx={{ color: "grey.500" }}>Không có sản phẩm</Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const navigate = useNavigate();
  const toast  = useToastify();
  const {
    getProductsByStoreId,
    countProductsByStoreId,
    countSoldProductsByStoreId,
    formatOrderStatus,
    getOrderStatusColor,
  } = useStoresLogic();

  useEffect(() => {
    if (isOpen && store?.id) {
      const fetchData = async () => {
        try {
          // Fetch total orders
          try {
            const countResponse = await orderApi.countOrder({
              storeId: store.id,
            });
            console.log("Total orders response:", countResponse);
            setTotalOrders(Number(countResponse.data) || 0);
          } catch (error: any) {
            console.error("Total orders error:", error);
            setTotalOrders(0);
            toast.error(error.message || "Lỗi khi lấy tổng đơn hàng");
          }

          // Fetch total revenue (assuming an API exists or calculating from orders)
          try {
            const ordersData = await orderApi.getAll(undefined, undefined, undefined, store.id, undefined, undefined, 1, 100000);
            console.log("Orders for revenue calculation:", ordersData);
            const revenue = ordersData.items.reduce((sum: number, order: Order) => sum + (order.totalPrice || 0), 0);
            setTotalRevenue(revenue);
          } catch (error: any) {
            console.error("Total revenue error:", error);
            setTotalRevenue(0);
            toast.error(error.message || "Lỗi khi lấy tổng doanh thu");
          }

          // Fetch products for products tab
          if (activeTab === "products") {
            setLoadingProducts(true);
            try {
              const [productsData, totalCount] = await Promise.all([
                getProductsByStoreId(store.id),
                countProductsByStoreId(store.id),
              ]);
              setProducts(productsData);
              setTotalProducts(totalCount);
            } catch (error: any) {
              console.error("Fetch products error:", error);
              setProducts([]);
              setTotalProducts(0);
              toast.error(error.message || "Lỗi khi lấy danh sách sản phẩm");
            } finally {
              setLoadingProducts(false);
            }
          }

          // Fetch orders for orders tab
          if (activeTab === "orders") {
            setLoadingOrders(true);
            try {
              const ordersData = await orderApi.getAll(undefined, undefined, undefined, store.id, undefined, undefined, 1, 100000);
              console.log("Orders response:", ordersData);
              setOrders(ordersData.items || []);
            } catch (error: any) {
              console.error("Fetch orders error:", error);
              setOrders([]);
              toast.error(error.message || "Lỗi khi lấy danh sách đơn hàng");
            } finally {
              setLoadingOrders(false);
            }
          }
        } catch (error: any) {
          console.error("Fetch data error:", error);
          toast.error(error.message || "Lỗi khi lấy dữ liệu");
        }
      };
      fetchData();
    }
  }, [isOpen, store?.id, activeTab,  ]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  const handleCloseOrderDetail = () => {
    setIsOrderDetailOpen(false);
    setSelectedOrder(null);
  };

  const getStatusIcon = (isLocked: boolean) => {
    return isLocked ? (
      <ToggleOff sx={{ fontSize: 20, color: "error.main" }} />
    ) : (
      <CheckCircle sx={{ fontSize: 20, color: "success.main" }} />
    );
  };

  const formatShippingAddress = (order: Order): string => {
    const { roomQueryResult } = order;
    if (!roomQueryResult) return "Không có thông tin địa chỉ";
    const { name, buildingName, areaName } = roomQueryResult;
    return `${name}, ${buildingName}, ${areaName}`;
  };

  if (!isOpen || !store) return null;

  return (
    <>
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
                  background: "linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)",
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
                <Box>
                  <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                    Số Điện Thoại
                  </Typography>
                  <Typography sx={{ color: "grey.600" }}>
                    {store.phoneNumber || "N/A"}
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
                    Số Điện Thoại
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {store.phoneNumber || "N/A"}
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
                  <Typography sx={{ color: "grey.900" }}>{countSoldProductsByStoreId(store.id)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                    Giá Trị Đơn Hàng Trung Bình
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {totalOrders > 0 ? formatCurrency(totalRevenue / totalOrders) : "0 ₫"}
                  </Typography>
                </Box>
              </Box>
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
                              textDecoration: "none",
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
                Đơn Hàng ({totalOrders} đơn hàng)
              </Typography>
              {loadingOrders ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : orders.length > 0 ? (
                <Box sx={{ border: 1, borderColor: "grey.200", borderRadius: 2, overflow: "hidden" }}>
                  <Table>
                    <TableHead sx={{ bgcolor: "grey.50" }}>
                      <TableRow>
                        <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                          ID Đơn Hàng
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                          Trạng Thái
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                          Tổng Tiền
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                          Phí Giao Hàng
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                          Địa Chỉ Giao Hàng
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                          Ngày Tạo
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
                          <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem" }}>
                            <Chip
                              label={formatOrderStatus(order.status)}
                              sx={{
                                bgcolor: getOrderStatusColor(order.status).bgcolor,
                                color: getOrderStatusColor(order.status).color,
                                fontSize: "0.75rem",
                                height: 24,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                            {formatCurrency(order.totalPrice)}
                          </TableCell>
                          <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                            {formatCurrency(order.shippingFee)}
                          </TableCell>
                          <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                            {formatShippingAddress(order)}
                          </TableCell>
                          <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                            {formatDate(order.createAt)}
                          </TableCell>
                          <TableCell sx={{ px: 2, py: 1.5 }}>
                            <IconButton
                              onClick={() => handleViewOrder(order)}
                              sx={{ color: "primary.main" }}
                            >
                              <Visibility sx={{ fontSize: 20 }} />
                            </IconButton>
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
        </DialogContent>
      </Dialog>
      <OrderDetailDialog
        open={isOrderDetailOpen}
        onClose={handleCloseOrderDetail}
        order={selectedOrder}
      />
    </>
  );
}
