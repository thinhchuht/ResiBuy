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
import CustomTable from "../../../components/CustomTable";

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
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium", mb: 1 }}>
              Sản Phẩm
            </Typography>
            {order.orderItems.length > 0 ? (
              <table style={{ border: "1px solid #e0e0e0", borderRadius: "4px", width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ backgroundColor: "#f5f5f5" }}>
                  <tr>
                    <th style={{ padding: "8px", fontSize: "0.75rem", color: "#6b7280", fontWeight: "medium", textTransform: "uppercase" }}>
                      Tên Sản Phẩm
                    </th>
                    <th style={{ padding: "8px", fontSize: "0.75rem", color: "#6b7280", fontWeight: "medium", textTransform: "uppercase" }}>
                      Số Lượng
                    </th>
                    <th style={{ padding: "8px", fontSize: "0.75rem", color: "#6b7280", fontWeight: "medium", textTransform: "uppercase" }}>
                      Giá
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item) => (
                    <tr key={item.id}>
                      <td
                        style={{
                          padding: "8px",
                          fontSize: "0.875rem",
                          color: "#3b82f6",
                          cursor: "pointer",
                          textDecoration: "none",
                          transition: "all 0.3s ease-in-out",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundImage = "linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)";
                          e.currentTarget.style.webkitBackgroundClip = "text";
                          e.currentTarget.style.webkitTextFillColor = "transparent";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundImage = "";
                          e.currentTarget.style.webkitBackgroundClip = "";
                          e.currentTarget.style.webkitTextFillColor = "";
                          e.currentTarget.style.color = "#3b82f6";
                        }}
                        onClick={() => navigate(`/products?id=${item.productId}`)}
                      >
                        {item.productName}
                      </td>
                      <td style={{ padding: "8px", fontSize: "0.875rem" }}>{item.quantity}</td>
                      <td style={{ padding: "8px", fontSize: "0.875rem" }}>{formatCurrency(item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [productPagination, setProductPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
  });
  const [orderPagination, setOrderPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
  });
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const navigate = useNavigate();
  const toast = useToastify();
  const {
    getProductsByStoreId,
    getOrdersByStoreId,
    countProductsByStoreId,
    formatOrderStatus,
    getOrderStatusColor,
  } = useStoresLogic();

  useEffect(() => {
    if (!isOpen || !store?.id) return;

    let isMounted = true;

    const fetchData = async () => {
      try {
        setError(null);

        // Fetch total products
        try {
          const totalCount = await countProductsByStoreId(store.id);
          console.log("Total products response:", totalCount);
          if (isMounted) setTotalProducts(Number(totalCount) || 0);
        } catch (error: any) {
          console.error("Total products error:", error);
          if (isMounted) {
            setTotalProducts(0);
            setError(error.message || "Lỗi khi lấy tổng sản phẩm");
            toast.error(error.message || "Lỗi khi lấy tổng sản phẩm");
          }
        }

        // Fetch total revenue
        try {
          const revenueResponse = await orderApi.getTotalOrderAmount({ storeId: store.id });
          console.log("Total revenue response:", revenueResponse);
          if (revenueResponse.code === 0) {
            if (isMounted) setTotalRevenue(Number(revenueResponse.data.totalOrderAmount) || 0);
          } else {
            throw new Error(revenueResponse.message || "Lỗi khi lấy tổng doanh thu");
          }
        } catch (error: any) {
          console.error("Total revenue error:", error);
          if (isMounted) {
            setTotalRevenue(0);
            setError(error.message || "Lỗi khi lấy tổng doanh thu");
            toast.error(error.message || "Lỗi khi lấy tổng doanh thu");
          }
        }

        // Fetch total orders
        try {
          const countResponse = await orderApi.countOrder({ storeId: store.id });
          console.log("Total orders response:", countResponse);
          if (isMounted) setTotalOrders(Number(countResponse.data) || 0);
        } catch (error: any) {
          console.error("Total orders error:", error);
          if (isMounted) {
            setTotalOrders(0);
            setError(error.message || "Lỗi khi lấy tổng đơn hàng");
            toast.error(error.message || "Lỗi khi lấy tổng đơn hàng");
          }
        }

        // Fetch products for products tab
        if (activeTab === "products") {
          setLoadingProducts(true);
          try {
            const productResponse = await getProductsByStoreId(store.id, productPagination.pageNumber, productPagination.pageSize);
            console.log("Products response:", productResponse);
            const productsData = Array.isArray(productResponse.items) ? productResponse.items : [];
            if (isMounted) {
              setProducts(productsData);
              setProductPagination({
                pageNumber: productResponse.pageNumber || 1,
                pageSize: productResponse.pageSize || 10,
                totalCount: productResponse.totalCount || 0,
                totalPages: productResponse.totalPages || 1,
              });
            }
          } catch (error: any) {
            console.error("Fetch products error:", error);
            if (isMounted) {
              setProducts([]);
              setProductPagination((prev) => ({ ...prev, totalCount: 0, totalPages: 1 }));
              setError(error.message || "Lỗi khi lấy danh sách sản phẩm");
              toast.error(error.message || "Lỗi khi lấy danh sách sản phẩm");
            }
          } finally {
            if (isMounted) setLoadingProducts(false);
          }
        }

        // Fetch orders for orders tab
        if (activeTab === "orders") {
          setLoadingOrders(true);
          try {
            const orderResponse = await getOrdersByStoreId(store.id, orderPagination.pageNumber, orderPagination.pageSize);
            console.log("Orders response:", orderResponse);
            const ordersData = Array.isArray(orderResponse.items) ? orderResponse.items : [];
            if (isMounted) {
              setOrders(ordersData);
              setOrderPagination({
                pageNumber: orderResponse.pageNumber || 1,
                pageSize: orderResponse.pageSize || 10,
                totalCount: orderResponse.totalCount || 0,
                totalPages: orderResponse.totalPages || 1,
              });
            }
          } catch (error: any) {
            console.error("Fetch orders error:", error);
            if (isMounted) {
              setOrders([]);
              setOrderPagination((prev) => ({ ...prev, totalCount: 0, totalPages: 1 }));
              setError(error.message || "Lỗi khi lấy danh sách đơn hàng");
              toast.error(error.message || "Lỗi khi lấy danh sách đơn hàng");
            }
          } finally {
            if (isMounted) setLoadingOrders(false);
          }
        }
      } catch (error: any) {
        console.error("Fetch data error:", error);
        if (isMounted) {
          setError(error.message || "Lỗi khi lấy dữ liệu");
          toast.error(error.message || "Lỗi khi lấy dữ liệu");
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, store?.id, activeTab, productPagination.pageNumber, productPagination.pageSize, orderPagination.pageNumber, orderPagination.pageSize ]);

  const handleProductPageChange = (pageNumber: number) => {
    setProductPagination((prev) => ({ ...prev, pageNumber }));
  };

  const handleOrderPageChange = (pageNumber: number) => {
    setOrderPagination((prev) => ({ ...prev, pageNumber }));
  };

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

  const productColumns = [
    {
      key: "id",
      label: "ID Sản Phẩm",
      render: (row) => (
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.875rem", color: "primary.main" }}>
          {row.id}
        </Typography>
      ),
    },
    {
      key: "name",
      label: "Tên",
      render: (row) => (
        <Typography
          sx={{
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
          onClick={() => navigate(`/products?id=${row.id}`)}
        >
          {row.name}
        </Typography>
      ),
    },
    {
      key: "price",
      label: "Giá",
      render: (row) => (
        <Typography sx={{ fontSize: "0.875rem", color: "grey.900" }}>
          {row.productDetails?.[0] ? formatCurrency(row.productDetails[0].price) : "N/A"}
        </Typography>
      ),
    },
    {
      key: "isOutOfStock",
      label: "Trạng Thái",
      render: (row) => (
        <Typography sx={{ fontSize: "0.875rem", color: "grey.900" }}>
          {row.productDetails?.[0]
            ? row.productDetails[0].isOutOfStock
              ? "Hết hàng"
              : "Còn hàng"
            : "N/A"}
        </Typography>
      ),
    },
    
  ];

  const orderColumns = [
    {
      key: "id",
      label: "ID Đơn Hàng",
      render: (row) => (
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.875rem", color: "primary.main" }}>
          {row.id}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Trạng Thái",
      render: (row) => (
        <Chip
          label={formatOrderStatus(row.status)}
          sx={{
            bgcolor: getOrderStatusColor(row.status).bgcolor,
            color: getOrderStatusColor(row.status).color,
            fontSize: "0.75rem",
            height: 24,
          }}
        />
      ),
    },
    {
      key: "totalPrice",
      label: "Tổng Tiền",
      render: (row) => (
        <Typography sx={{ fontSize: "0.875rem", color: "grey.900" }}>
          {formatCurrency(row.totalPrice)}
        </Typography>
      ),
    },
    {
      key: "shippingFee",
      label: "Phí Giao Hàng",
      render: (row) => (
        <Typography sx={{ fontSize: "0.875rem", color: "grey.900" }}>
          {formatCurrency(row.shippingFee)}
        </Typography>
      ),
    },
    {
      key: "shippingAddress",
      label: "Địa Chỉ Giao Hàng",
      render: (row) => (
        <Typography sx={{ fontSize: "0.875rem", color: "grey.900" }}>
          {formatShippingAddress(row)}
        </Typography>
      ),
    },
    {
      key: "createAt",
      label: "Ngày Tạo",
      render: (row) => (
        <Typography sx={{ fontSize: "0.875rem", color: "grey.900" }}>
          {formatDate(row.createAt)}
        </Typography>
      ),
    },
    {
      key: "actions",
      label: "Hành Động",
      render: (row) => (
        <IconButton
          onClick={() => handleViewOrder(row)}
          sx={{ color: "primary.main" }}
        >
          <Visibility sx={{ fontSize: 20 }} />
        </IconButton>
      ),
    },
  ];

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
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
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
                <CustomTable
                  columns={productColumns}
                  data={products}
                  headerTitle="Danh Sách Sản Phẩm"
                  totalCount={productPagination.totalCount}
                  itemsPerPage={productPagination.pageSize}
                  onPageChange={handleProductPageChange}
                />
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
                <CustomTable
                  columns={orderColumns}
                  data={orders}
                  headerTitle="Danh Sách Đơn Hàng"
                  totalCount={orderPagination.totalCount}
                  itemsPerPage={orderPagination.pageSize}
                  onPageChange={handleOrderPageChange}
                />
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