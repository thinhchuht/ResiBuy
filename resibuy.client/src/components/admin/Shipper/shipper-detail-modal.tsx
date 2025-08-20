import { useState, useEffect } from "react";
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
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Close,
  LocalShipping as ShipperIcon,
  ShoppingCart as OrderIcon,
  AccountBalanceWallet as WalletIcon,
  Edit,
  Delete,
  Visibility,
} from "@mui/icons-material";
import {
  formatCurrency,
  formatDate,
  formatOrderStatus,
  getOrderStatusColor,
  formatWorkTime,
  useShippersLogic,
} from "./seg/utlis";
import orderApi from "../../../api/order.api";
import { useToastify } from "../../../hooks/useToastify";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from "date-fns";
import type { Shipper, Order } from "../../../types/models";
import CustomTable from "../../../components/CustomTable";

interface ShipperDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipper: Shipper | null;
  onEdit?: (shipper: Shipper) => void;
  onDelete?: (shipperId: string) => void;
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
            <Typography sx={{ color: "grey.900" }}>{order.store?.name || "N/A"}</Typography>
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

export function ShipperDetailModal({
  isOpen,
  onClose,
  shipper,
  onEdit,
  onDelete,
}: ShipperDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "shipping-fee">("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [orderPagination, setOrderPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
  });
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [todayFee, setTodayFee] = useState<number>(0);
  const [weekFee, setWeekFee] = useState<number>(0);
  const [monthFee, setMonthFee] = useState<number>(0);
  const [yearFee, setYearFee] = useState<number>(0);
  const [customFee, setCustomFee] = useState<number>(0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const { getShipperOrders, isShipperAvailable } = useShippersLogic();
  const toast = useToastify();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen || !shipper?.id) return;

    let isMounted = true;

    const fetchData = async () => {
      try {
        // Fetch total revenue
        try {
          const revenueResponse = await orderApi.getTotalShippingFeeshipper({
            shipperId: shipper.id,
          });
          console.log("Total revenue response:", revenueResponse);
          if (isMounted) setTotalRevenue(Number(revenueResponse.data) || 0);
        } catch (error: any) {
          console.error("Total revenue error:", error);
          if (isMounted) {
            setTotalRevenue(0);
            toast.error(error.message || "Lỗi khi lấy tổng doanh thu");
          }
        }

        try {
          const countResponse = await orderApi.countOrder({
            shipperId: shipper.id,
          });
          console.log("Total orders response:", countResponse);
          if (isMounted) setTotalOrders(Number(countResponse.data) || 0);
        } catch (error: any) {
          console.error("Total orders error:", error);
          if (isMounted) {
            setTotalOrders(0);
            toast.error(error.message || "Lỗi khi lấy tổng đơn hàng");
          }
        }

        // Fetch orders for orders tab
        if (activeTab === "orders") {
          setLoadingOrders(true);
          try {
            const orderResponse = await getShipperOrders(shipper.id, orderPagination.pageNumber, orderPagination.pageSize);
            console.log("Orders response:", orderResponse);
            if (isMounted) {
              setOrders(orderResponse.items || []);
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
              toast.error(error.message || "Lỗi khi lấy danh sách đơn hàng");
            }
          } finally {
            if (isMounted) setLoadingOrders(false);
          }
        }

        // Fetch shipping fees for shipping-fee tab
        if (activeTab === "shipping-fee") {
          const currentDate = startOfDay(new Date());

          // Today
          try {
            const todayStart = format(currentDate, "yyyy-MM-dd'T'HH:mm:ss");
            const todayEnd = format(endOfDay(currentDate), "yyyy-MM-dd'T'HH:mm:ss");
            const todayResponse = await orderApi.getTotalShippingFeeshipper({
              shipperId: shipper.id,
              startDate: todayStart,
              endDate: todayEnd,
            });
            console.log("Today fee response:", todayResponse);
            if (isMounted) setTodayFee(Number(todayResponse.data) || 0);
          } catch (error: any) {
            console.error("Today fee error:", error);
            if (isMounted) setTodayFee(0);
          }

          // Week
          try {
            const weekStart = format(startOfWeek(currentDate, { weekStartsOn: 1 }), "yyyy-MM-dd'T'HH:mm:ss");
            const weekEnd = format(endOfWeek(currentDate, { weekStartsOn: 1 }), "yyyy-MM-dd'T'HH:mm:ss");
            const weekResponse = await orderApi.getTotalShippingFeeshipper({
              shipperId: shipper.id,
              startDate: weekStart,
              endDate: weekEnd,
            });
            console.log("Week fee response:", weekResponse);
            if (isMounted) setWeekFee(Number(weekResponse.data) || 0);
          } catch (error: any) {
            console.error("Week fee error:", error);
            if (isMounted) setWeekFee(0);
          }

          // Month
          try {
            const monthStart = format(startOfMonth(currentDate), "yyyy-MM-dd'T'HH:mm:ss");
            const monthEnd = format(endOfMonth(currentDate), "yyyy-MM-dd'T'HH:mm:ss");
            const monthResponse = await orderApi.getTotalShippingFeeshipper({
              shipperId: shipper.id,
              startDate: monthStart,
              endDate: monthEnd,
            });
            console.log("Month fee response:", monthResponse);
            if (isMounted) setMonthFee(Number(monthResponse.data) || 0);
          } catch (error: any) {
            console.error("Month fee error:", error);
            if (isMounted) setMonthFee(0);
          }

          // Year
          try {
            const yearStart = format(startOfYear(currentDate), "yyyy-MM-dd'T'HH:mm:ss");
            const yearEnd = format(endOfYear(currentDate), "yyyy-MM-dd'T'HH:mm:ss");
            const yearResponse = await orderApi.getTotalShippingFeeshipper({
              shipperId: shipper.id,
              startDate: yearStart,
              endDate: yearEnd,
            });
            console.log("Year fee response:", yearResponse);
            if (isMounted) setYearFee(Number(yearResponse.data) || 0);
          } catch (error: any) {
            console.error("Year fee error:", error);
            if (isMounted) setYearFee(0);
          }
        }
      } catch (error: any) {
        console.error("Fetch data error:", error);
        if (isMounted) toast.error(error.message || "Lỗi khi lấy dữ liệu");
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, shipper?.id, activeTab, orderPagination.pageNumber, orderPagination.pageSize, ]);

  const handleCustomFeeSearch = async () => {
    if (!startDate || !endDate) {
      toast.error("Vui lòng chọn cả ngày bắt đầu và ngày kết thúc");
      return;
    }
    if (startDate > endDate) {
      toast.error("Ngày bắt đầu phải trước ngày kết thúc");
      return;
    }
    try {
      const start = format(startOfDay(startDate), "yyyy-MM-dd'T'HH:mm:ss");
      const end = format(endOfDay(endDate), "yyyy-MM-dd'T'HH:mm:ss");
      const response = await orderApi.getTotalShippingFeeshipper({
        shipperId: shipper!.id,
        startDate: start,
        endDate: end,
      });
      setCustomFee(Number(response.data) || 0);
    } catch (error: any) {
      console.error("Fetch custom shipping fee error:", error);
      toast.error(error.message || "Lỗi khi lấy phí giao hàng tùy chỉnh");
      setCustomFee(0);
    }
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

  const formatShippingAddress = (order: Order): string => {
    const { roomQueryResult } = order;
    if (!roomQueryResult) return "Không có thông tin địa chỉ";
    const { name, buildingName, areaName } = roomQueryResult;
    return `${name}, ${buildingName}, ${areaName}`;
  };

  const orderColumns = [
    {
      key: "id" as keyof Order,
      label: "ID Đơn Hàng",
      render: (row) => (
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.875rem", color: "primary.main" }}>
          {row.id}
        </Typography>
      ),
    },
    {
      key: "status" as keyof Order,
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
      key: "totalPrice" as keyof Order,
      label: "Tổng Tiền",
      render: (row) => (
        <Typography sx={{ fontSize: "0.875rem", color: "grey.900" }}>
          {formatCurrency(row.totalPrice)}
        </Typography>
      ),
    },
    {
      key: "shippingFee" as keyof Order,
      label: "Phí Giao Hàng",
      render: (row) => (
        <Typography sx={{ fontSize: "0.875rem", color: "grey.900" }}>
          {formatCurrency(row.shippingFee)}
        </Typography>
      ),
    },
    {
      key: "shippingAddress" as keyof Order,
      label: "Địa Chỉ Giao Hàng",
      render: (row) => (
        <Typography sx={{ fontSize: "0.875rem", color: "grey.900" }}>
          {formatShippingAddress(row)}
        </Typography>
      ),
    },
    {
      key: "createAt" as keyof Order,
      label: "Ngày Tạo",
      render: (row) => (
        <Typography sx={{ fontSize: "0.875rem", color: "grey.900" }}>
          {formatDate(row.createAt)}
        </Typography>
      ),
    },
    {
      key: "actions" as keyof Order,
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

  if (!isOpen || !shipper) return null;

  const currentDate = startOfDay(new Date());

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
              Chi Tiết Shipper
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "grey.500" }}
            >
              ID Shipper: {shipper.id}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {onEdit && (
              <Button
                onClick={() => onEdit(shipper)}
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
            {onDelete && (
              <Button
                onClick={() => onDelete(shipper.id)}
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
                {shipper.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h5"
                sx={{ color: "grey.900", fontWeight: "bold", mb: 1 }}
              >
                {shipper.fullName}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "grey.500" }}
              >
                {shipper.email}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                textAlign: "left",
              }}
            >
              <Box>
                <Typography
                  variant="h5"
                  sx={{ color: "primary.main", fontWeight: "bold" }}
                >
                  {totalOrders}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "grey.500" }}
                >
                  Tổng Đơn Hàng
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{ color: "success.main", fontWeight: "bold" }}
                >
                  {formatCurrency(totalRevenue)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "grey.500" }}
                >
                  Tổng Doanh Thu
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
              { id: "overview", label: "Tổng Quan", icon: <ShipperIcon sx={{ fontSize: 16 }} /> },
              { id: "orders", label: "Đơn Hàng", icon: <OrderIcon sx={{ fontSize: 16 }} /> },
              { id: "shipping-fee", label: "Thu nhập từ đơn hoàn thành", icon: <WalletIcon sx={{ fontSize: 16 }} /> },
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
              <Typography
                variant="h6"
                sx={{ color: "grey.900", mb: 2 }}
              >
                Thông Tin Shipper
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
                    ID
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {shipper.id}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", fontWeight: "medium" }}
                  >
                    Họ Tên
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {shipper.fullName}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", fontWeight: "medium" }}
                  >
                    Email
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {shipper.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", fontWeight: "medium" }}
                  >
                    Số Điện Thoại
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {shipper.phoneNumber}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", fontWeight: "medium" }}
                  >
                    Ngày Sinh
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {formatDate(shipper.dateOfBirth)}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", fontWeight: "medium" }}
                  >
                    CMND/CCCD
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {shipper.identityNumber}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", fontWeight: "medium" }}
                  >
                    Trạng Thái
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {isShipperAvailable(shipper) ? "Đã khóa" : "Chưa khóa"}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", fontWeight: "medium" }}
                  >
                    Trạng Thái Hoạt Động
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {shipper.isOnline ? "Đang Online" : "Offline"}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", fontWeight: "medium" }}
                  >
                    Trạng Thái Giao Hàng
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {shipper.isShipping ? "Đang Giao Hàng" : "Không Giao Hàng"}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", fontWeight: "medium" }}
                  >
                    Số Lần Báo Cáo
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {shipper.reportCount}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", fontWeight: "medium" }}
                  >
                    Thời Gian Làm Việc
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {formatWorkTime(shipper.startWorkTime)} - {formatWorkTime(shipper.endWorkTime)}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", fontWeight: "medium" }}
                  >
                    ID Vị Trí Cuối
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {shipper.lastLocationId}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", fontWeight: "medium" }}
                  >
                    Tên Vị Trí Cuối
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {shipper.lastLocationName}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", fontWeight: "medium" }}
                  >
                    Ngày Tạo
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {formatDate(shipper.createdAt)}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", fontWeight: "medium" }}
                  >
                    Ngày Cập Nhật
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {formatDate(shipper.updatedAt)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {activeTab === "orders" && (
            <Box>
              <Typography
                variant="h6"
                sx={{ color: "grey.900", mb: 2 }}
              >
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
                  <OrderIcon sx={{ fontSize: 48, color: "grey.300", mb: 2 }} />
                  <Typography>Không tìm thấy đơn hàng cho shipper này</Typography>
                </Box>
              )}
            </Box>
          )}

          {activeTab === "shipping-fee" && (
            <Box>
              <Typography variant="h6" sx={{ color: "grey.900", mb: 2 }}>
                Thu nhập từ đơn hoàn thành
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mb: 4 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                    Hôm Nay ({format(currentDate, "dd/MM/yyyy")})
                  </Typography>
                  <Typography sx={{ color: "grey.900", fontSize: "1.25rem", fontWeight: "bold" }}>
                    {formatCurrency(todayFee)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                    Tuần Này ({format(startOfWeek(currentDate, { weekStartsOn: 1 }), "dd/MM/yyyy")} - {format(endOfWeek(currentDate, { weekStartsOn: 1 }), "dd/MM/yyyy")})
                  </Typography>
                  <Typography sx={{ color: "grey.900", fontSize: "1.25rem", fontWeight: "bold" }}>
                    {formatCurrency(weekFee)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                    Tháng Này ({format(startOfMonth(currentDate), "dd/MM/yyyy")} - {format(endOfMonth(currentDate), "dd/MM/yyyy")})
                  </Typography>
                  <Typography sx={{ color: "grey.900", fontSize: "1.25rem", fontWeight: "bold" }}>
                    {formatCurrency(monthFee)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                    Năm Nay ({format(startOfYear(currentDate), "dd/MM/yyyy")} - {format(endOfYear(currentDate), "dd/MM/yyyy")})
                  </Typography>
                  <Typography sx={{ color: "grey.900", fontSize: "1.25rem", fontWeight: "bold" }}>
                    {formatCurrency(yearFee)}
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="h6"
                sx={{ color: "grey.900", mb: 2 }}
              >
                Tùy Chỉnh Khoảng Thời Gian
              </Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Ngày Bắt Đầu"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        sx={{ width: 200 }}
                      />
                    )}
                  />
                  <DatePicker
                    label="Ngày Kết Thúc"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        sx={{ width: 200 }}
                      />
                    )}
                  />
                </LocalizationProvider>
                <Button
                  variant="contained"
                  onClick={handleCustomFeeSearch}
                  sx={{
                    px: 3,
                    py: 1,
                    bgcolor: "primary.main",
                    color: "white",
                    borderRadius: 2,
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  Áp dụng
                </Button>
              </Box>
              {startDate && endDate && (
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", fontWeight: "medium" }}
                  >
                    Thu nhập từ đơn hoàn thành ({format(startDate, "dd/MM/yyyy")} - {format(endDate, "dd/MM/yyyy")})
                  </Typography>
                  <Typography sx={{ color: "grey.900", fontSize: "1.25rem", fontWeight: "bold" }}>
                    {formatCurrency(customFee)}
                  </Typography>
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