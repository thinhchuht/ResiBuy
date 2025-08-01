import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Divider,
  Avatar,
  Chip,
  Pagination,
  TextField,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import orderApi from "../../api/order.api";
import { useAuth } from "../../contexts/AuthContext";

const OrderStatusTabs = [
  { label: "Đã giao hàng", value: "Delivered" },
  { label: "Đã hủy", value: "Cancelled" },
];

const getStatusLabel = (status: string) => {
  switch (status) {
    case "Delivered":
      return "Đã giao hàng";
    case "Cancelled":
      return "Đã hủy";
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
    default:
      return "default";
  }
};

const getToday = () => new Date().toLocaleDateString("sv-SE"); // YYYY-MM-DD

interface OrderItem {
  id: number;
  image?: { thumbUrl?: string };
  productName: string;
  quantity: number;
  price: number;
}

interface RoomQueryResult {
  name?: string;
  buildingName?: string;
  areaName?: string;
}

interface Store {
  name?: string;
}

interface Order {
  id: number;
  status: string;
  createAt: string;
  roomQueryResult?: RoomQueryResult;
  store?: Store;
  shippingFee: number;
  paymentStatus: string;
  paymentMethod: string;
  totalPrice: number;
  orderItems: OrderItem[];
}

const ShipperOrderHistory: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Delivered");

  const fetchOrders = async () => {
    if (!user?.id) return;
    try {
      const res = await orderApi.getAll(
        statusFilter,
        "None",
        "None",
        undefined,
        undefined,
        user.id,
        page,
        10,
        startDate || undefined,
        endDate || undefined
      );
      setOrders(res.items || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  };

  useEffect(() => {
    if (user?.id && !dateError) {
      fetchOrders();
    }
  }, [user?.id, page, startDate, endDate, statusFilter, dateError]);

  const handleStartDateChange = (value: string) => {
    if (endDate && new Date(value) > new Date(endDate)) {
      setDateError(true);
    } else {
      setDateError(false);
      setStartDate(value);
      setPage(1);
    }
  };

  const handleEndDateChange = (value: string) => {
    if (startDate && new Date(value) < new Date(startDate)) {
      setDateError(true);
    } else {
      setDateError(false);
      setEndDate(value);
      setPage(1);
    }
  };

  const handleTabChange = (_: any, newValue: string) => {
    setStatusFilter(newValue);
    setPage(1);
  };

  return (
    <Box p={2}>
      <Tabs value={statusFilter} onChange={handleTabChange} sx={{ mb: 2 }}>
        {OrderStatusTabs.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
      </Tabs>

      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Từ ngày"
          type="date"
          value={startDate}
          onChange={(e) => handleStartDateChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: getToday() }}
          fullWidth
        />
        <TextField
          label="Đến ngày"
          type="date"
          value={endDate}
          onChange={(e) => handleEndDateChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: getToday() }}
          fullWidth
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
            <Card key={order.id} variant="outlined" sx={{ mb: 3, p: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6" color="primary">
                  Đơn hàng #{order.id}
                </Typography>
                <Chip
                  label={getStatusLabel(order.status)}
                  color={getStatusColor(order.status)}
                />
              </Box>

              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Ngày tạo: {new Date(order.createAt).toLocaleString()}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography>
                <strong>Phòng:</strong> {order.roomQueryResult?.name} -{" "}
                {order.roomQueryResult?.buildingName} (
                {order.roomQueryResult?.areaName})
              </Typography>
              <Typography>
                <strong>Cửa hàng:</strong> {order.store?.name}
              </Typography>
              <Typography>
                <strong>Thanh toán:</strong> {order.paymentStatus} |{" "}
                {order.paymentMethod}
              </Typography>
              <Typography mt={1}>
                <strong>Phí giao hàng:</strong>{" "}
                {order.shippingFee?.toLocaleString()}đ
              </Typography>
              <Typography>
                <strong>Tổng tiền hàng:</strong>{" "}
                {order.totalPrice.toLocaleString()}đ
              </Typography>
              <Typography mt={1}>
                <strong>Tổng cộng:</strong>{" "}
                {(order.totalPrice + (order.shippingFee || 0)).toLocaleString()}đ
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2">Sản phẩm:</Typography>
              {order.orderItems.map((item: OrderItem) => (
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
  );
};

export default ShipperOrderHistory;
