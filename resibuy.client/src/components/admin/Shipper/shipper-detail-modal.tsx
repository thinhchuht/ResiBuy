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
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  TextField,
} from "@mui/material";
import {  useNavigate } from "react-router-dom";
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
            <Typography sx={{ color: "grey.900" }}>{order.shipper.phoneNumber}</Typography>
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
  const { toast } = useToastify();

  // Tải dữ liệu khi modal mở và shipper có giá trị
  useEffect(() => {
    if (isOpen && shipper?.id) {
      const fetchData = async () => {
        try {
          // Lấy danh sách đơn hàng
          const fetchedOrders = await getShipperOrders(shipper.id);
          setOrders(fetchedOrders);

          // Lấy tổng số đơn hàng
          const countResponse = await orderApi.countOrder({ shipperId: shipper.id });
          setTotalOrders(countResponse.data || 0);

          // Lấy tổng doanh thu (tổng phí giao hàng)
          const revenueResponse = await orderApi.getTotalShippingFeeshipper({ shipperId: shipper.id });
          setTotalRevenue(revenueResponse.data || 0);
        } catch (error: any) {
          console.error("Fetch data error:", error);
          toast.error(error.message || "Lỗi khi lấy dữ liệu shipper");
          setOrders([]);
          setTotalOrders(0);
          setTotalRevenue(0);
        }
      };
      fetchData();
    } else {
      setOrders([]);
      setTotalOrders(0);
      setTotalRevenue(0);
    }
  }, [isOpen,  toast]);

  // Tải phí giao hàng cho các khoảng thời gian khi chuyển sang tab "shipping-fee"
  useEffect(() => {
    if (isOpen && shipper?.id && activeTab === "shipping-fee") {
      const fetchShippingFees = async () => {
        try {
          const currentDate = new Date('2025-07-27'); // Ngày hiện tại: 27/07/2025

          // Hôm nay
          const todayStart = format(startOfDay(currentDate), "yyyy-MM-dd'T'HH:mm:ss");
          const todayEnd = format(endOfDay(currentDate), "yyyy-MM-dd'T'HH:mm:ss");
          const todayResponse = await orderApi.getTotalShippingFeeshipper({
            shipperId: shipper.id,
            startDate: todayStart,
            endDate: todayEnd,
          });
          setTodayFee(todayResponse.data || 0);

          // Tuần này (21/07/2025 - 27/07/2025)
          const weekStart = format(startOfWeek(currentDate, { weekStartsOn: 1 }), "yyyy-MM-dd'T'HH:mm:ss");
          const weekEnd = format(endOfWeek(currentDate, { weekStartsOn: 1 }), "yyyy-MM-dd'T'HH:mm:ss");
          const weekResponse = await orderApi.getTotalShippingFeeshipper({
            shipperId: shipper.id,
            startDate: weekStart,
            endDate: weekEnd,
          });
          setWeekFee(weekResponse.data || 0);

          // Tháng này (01/07/2025 - 31/07/2025)
          const monthStart = format(startOfMonth(currentDate), "yyyy-MM-dd'T'HH:mm:ss");
          const monthEnd = format(endOfMonth(currentDate), "yyyy-MM-dd'T'HH:mm:ss");
          const monthResponse = await orderApi.getTotalShippingFeeshipper({
            shipperId: shipper.id,
            startDate: monthStart,
            endDate: monthEnd,
          });
          setMonthFee(monthResponse.data || 0);

          // Năm nay (01/01/2025 - 31/12/2025)
          const yearStart = format(startOfYear(currentDate), "yyyy-MM-dd'T'HH:mm:ss");
          const yearEnd = format(endOfYear(currentDate), "yyyy-MM-dd'T'HH:mm:ss");
          const yearResponse = await orderApi.getTotalShippingFeeshipper({
            shipperId: shipper.id,
            startDate: yearStart,
            endDate: yearEnd,
          });
          setYearFee(yearResponse.data || 0);
        } catch (error: any) {
          console.error("Fetch shipping fees error:", error);
          toast.error(error.message || "Lỗi khi lấy phí giao hàng");
          setTodayFee(0);
          setWeekFee(0);
          setMonthFee(0);
          setYearFee(0);
        }
      };
      fetchShippingFees();
    }
  }, [isOpen, shipper?.id, activeTab, toast]);

  // Xử lý tìm kiếm phí giao hàng tùy chỉnh
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
      setCustomFee(response.data || 0);
    } catch (error: any) {
      console.error("Fetch custom shipping fee error:", error);
      toast.error(error.message || "Lỗi khi lấy phí giao hàng tùy chỉnh");
      setCustomFee(0);
    }
  };

  if (!isOpen || !shipper) return null;

  const formatShippingAddress = (order: Order): string => {
    const { roomQueryResult } = order;
    if (!roomQueryResult) return "Không có thông tin địa chỉ";
    const { name, buildingName, areaName } = roomQueryResult;
    return `${name}, ${buildingName}, ${areaName}`;
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  const handleCloseOrderDetail = () => {
    setIsOrderDetailOpen(false);
    setSelectedOrder(null);
  };

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
              { id: "shipping-fee", label: " Thu nhập từ đơn hoàn thành", icon: <WalletIcon sx={{ fontSize: 16 }} /> },
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
                    {isShipperAvailable(shipper) ? "Sẵn Sàng" : "Không Sẵn Sàng"}
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
              {orders.length > 0 ? (
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
                  <OrderIcon sx={{ fontSize: 48, color: "grey.300", mb: 2 }} />
                  <Typography>Không tìm thấy đơn hàng cho shipper này</Typography>
                </Box>
              )}
            </Box>
          )}

          {activeTab === "shipping-fee" && (
            <Box>
              <Typography
                variant="h6"
                sx={{ color: "grey.900", mb: 2 }}
              >
                 Thu nhập từ đơn hoàn thành
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 3,
                  mb: 4,
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", fontWeight: "medium" }}
                  >
                    Hôm Nay (27/07/2025)
                  </Typography>
                  <Typography sx={{ color: "grey.900", fontSize: "1.25rem", fontWeight: "bold" }}>
                    {formatCurrency(todayFee)}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", fontWeight: "medium" }}
                  >
                    Tuần Này (21/07/2025 - 27/07/2025)
                  </Typography>
                  <Typography sx={{ color: "grey.900", fontSize: "1.25rem", fontWeight: "bold" }}>
                    {formatCurrency(weekFee)}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", fontWeight: "medium" }}
                  >
                    Tháng Này (01/07/2025 - 31/07/2025)
                  </Typography>
                  <Typography sx={{ color: "grey.900", fontSize: "1.25rem", fontWeight: "bold" }}>
                    {formatCurrency(monthFee)}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", fontWeight: "medium" }}
                  >
                    Năm Nay (01/01/2025 - 31/12/2025)
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