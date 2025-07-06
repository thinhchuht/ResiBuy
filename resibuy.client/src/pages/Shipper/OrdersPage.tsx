import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, CircularProgress } from "@mui/material";

interface Order {
  id: number;
  customerName: string;
  address: string;
  status: string;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập gọi API
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders/shipper"); // hoặc axios
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Lỗi lấy đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Đơn hàng cần giao
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        orders.map((order) => (
          <Paper
            key={order.id}
            sx={{
              p: 2,
              mb: 2,
              borderLeft: "4px solid #1976d2",
              bgcolor: "#fff",
            }}
          >
            <Typography variant="subtitle1">Khách: {order.customerName}</Typography>
            <Typography variant="body2">Địa chỉ: {order.address}</Typography>
            <Typography variant="body2">Trạng thái: {order.status}</Typography>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default OrdersPage;
