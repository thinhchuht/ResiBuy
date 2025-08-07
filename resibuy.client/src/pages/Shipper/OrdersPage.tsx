import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Chip,
  Divider,
  Typography,
  Avatar,
  Alert,
  Tabs,
  Tab,
  Pagination,
  Stack,
} from "@mui/material";
import {
  Store,
  Person,
  Phone,
  Room,
  ShoppingCart,
  Payment,
} from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { vi } from "date-fns/locale";
import orderApi from "../../api/order.api";
import { useAuth } from "../../contexts/AuthContext";
import { format } from "date-fns";

const OrderStatusTabs = [
  { label: "Đã giao hàng", value: "Delivered" },
  { label: "Đã hủy", value: "Cancelled" },
  { label: "Bị tố cáo", value: "Reported" },
];

const getStatusLabel = (status: string) => {
  switch (status) {
    case "Delivered":
      return "Đã giao hàng";
    case "Cancelled":
      return "Đã hủy";
    case "Reported":
      return "Bị tố cáo";
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Delivered":
      return "success";
    case "Cancelled":
      return "error";
    case "Reported":
      return "warning";
    default:
      return "default";
  }
};

const getPaymentStatusLabel = (status: string) => {
  switch (status) {
    case "Pending":
      return "Chưa thanh toán";
    case "Paid":
      return "Đã thanh toán";
    case "Failed":
      return "Thanh toán thất bại";
    case "Refunded":
      return "Đã hoàn tiền";
    default:
      return status;
  }
};

const getPaymentMethodLabel = (method: string) => {
  switch (method) {
    case "COD":
      return "Thanh toán khi nhận hàng";
    case "BankTransfer":
      return "Chuyển khoản";
    default:
      return method;
  }
};

interface OrderItem {
  id: number;
  image?: { thumbUrl?: string };
  productName: string;
  quantity: number;
  price: number;
}

interface Store {
  name?: string;
}

interface Order {
  id: string;
  userId: string;
  user: {
    id: string;
    fullName: string;
    phoneNumber: string;
  };
  shipper: {
    id: string;
    phoneNumber: string;
  };
  createAt: string;
  updateAt: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalPrice: number;
  shippingFee: number;
  cancelReason: string;
  note: string;
  store: {
    id: string;
    name: string;
    phoneNumber: string;
  };
  roomQueryResult: {
    id: string;
    name: string;
    buildingName: string;
    areaName: string;
  };
  orderItems: OrderItem[];
}

const ShipperOrderHistory: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [dateError, setDateError] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Delivered");

  const fetchOrders = async () => {
    if (!user?.id || dateError) return;

    try {
      const formattedStartDate = startDate
        ? format(startDate, "yyyy-MM-dd")
        : undefined;
      const formattedEndDate = endDate
        ? format(endDate, "yyyy-MM-dd")
        : undefined;

      const res = await orderApi.getAll(
        statusFilter,
        "None",
        "None",
        undefined,
        undefined,
        user.id,
        page,
        10,
        formattedStartDate,
        formattedEndDate
      );
      setOrders(res.items || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.id, page, startDate, endDate, statusFilter, dateError]);

  const handleStartDateChange = (date: Date | null) => {
    if (endDate && date && date > endDate) {
      setDateError(true);
    } else {
      setDateError(false);
      setStartDate(date);
      setPage(1);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (startDate && date && date < startDate) {
      setDateError(true);
    } else {
      setDateError(false);
      setEndDate(date);
      setPage(1);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setStatusFilter(newValue);
    setPage(1);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Box p={2}>
        <Tabs value={statusFilter} onChange={handleTabChange} sx={{ mb: 2 }}>
          {OrderStatusTabs.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>

        <Box display="flex" gap={2} mb={2}>
          <DatePicker
            label="Từ ngày"
            value={startDate}
            onChange={handleStartDateChange}
            maxDate={endDate || new Date()}
            slotProps={{ textField: { fullWidth: true } }}
          />
          <DatePicker
            label="Đến ngày"
            value={endDate}
            onChange={handleEndDateChange}
            minDate={startDate || undefined}
            maxDate={new Date()}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Box>

        {dateError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.
          </Alert>
        )}

        {orders.length === 0 ? (
          <Typography>Không có đơn hàng nào.</Typography>
        ) : (
          <>
            {orders.map((order) => (
              <Card key={order.id} variant="outlined" sx={{ mb: 3, p: 3 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6" color="primary">
                    Mã đơn: <strong>{order.id}</strong>
                  </Typography>
                  <Chip
                    label={getStatusLabel(order.status)}
                    color={getStatusColor(order.status)}
                    variant="filled"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  🕓 Ngày giao: {new Date(order.updateAt).toLocaleString()}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1}>
                  <Typography>
                    <Room fontSize="small" sx={{ mr: 1 }} />
                    <strong>Phòng:</strong> {order.roomQueryResult?.name} -{" "}
                    {order.roomQueryResult?.buildingName} (
                    {order.roomQueryResult?.areaName})
                  </Typography>

                  <Typography variant="subtitle1" fontWeight="bold">
                    <Store fontSize="small" sx={{ mr: 1 }} />
                    Cửa hàng: {order.store?.name || "Không rõ"}
                  </Typography>
                  <Typography color="text.secondary">
                    <Phone fontSize="small" sx={{ mr: 1 }} />
                    {order.store?.phoneNumber || "Không có SĐT"}
                  </Typography>

                  <Typography variant="subtitle1" fontWeight="bold">
                    <Person fontSize="small" sx={{ mr: 1 }} />
                    Người mua: {order.user?.fullName || "Không rõ"}
                  </Typography>
                  <Typography color="text.secondary">
                    <Phone fontSize="small" sx={{ mr: 1 }} />
                    {order.user?.phoneNumber || "Không có SĐT"}
                  </Typography>

                  <Typography>
                    <Payment fontSize="small" sx={{ mr: 1 }} />
                    <strong>Thanh toán:</strong>{" "}
                    {getPaymentMethodLabel(order.paymentMethod)} -{" "}
                    <Chip
                      label={getPaymentStatusLabel(order.paymentStatus)}
                      color="warning"
                      size="small"
                    />
                  </Typography>

                  <Typography>
                    <strong>Phí giao hàng:</strong>{" "}
                    {order.shippingFee?.toLocaleString()}đ
                  </Typography>
                  <Typography>
                    <strong>Tổng tiền hàng:</strong>{" "}
                    {order.totalPrice.toLocaleString()}đ
                  </Typography>
                  <Typography variant="h6" color="error" mt={1}>
                    <strong>Tổng cộng:</strong>{" "}
                    {(
                      order.totalPrice + (order.shippingFee || 0)
                    ).toLocaleString()}
                    đ
                  </Typography>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  <ShoppingCart fontSize="small" sx={{ mr: 1 }} />
                  Sản phẩm:
                </Typography>

                {order.orderItems.map((item) => (
                  <Box key={item.id} display="flex" alignItems="center" mt={1}>
                    <Avatar
                      src={item.image?.thumbUrl}
                      variant="rounded"
                      sx={{ width: 56, height: 56, mr: 2 }}
                    />
                    <Box>
                      <Typography>{item.productName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        SL: {item.quantity} | {item.price.toLocaleString()}đ
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Card>
            ))}

            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, val) => setPage(val)}
              />
            </Box>
          </>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default ShipperOrderHistory;
