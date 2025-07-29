import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Stack,
  Button,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import orderApi from "../../api/order.api";
import { useAuth } from "../../contexts/AuthContext";
import { useOrderEvent } from "../../contexts/OrderEventContext";

interface Order {
  id: string;
  totalPrice: number;
  status: string;
  roomQueryResult: {
    name: string;
    buildingName: string;
    areaName: string;
  };
  store: {
    name: string;
  };
  user: {
    fullName: string;
  } | null;
}

function ShipperHome() {
  const { user } = useAuth();
  const { lastConfirmedOrderId } = useOrderEvent(); // ✅ đưa vào đây
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const res = await orderApi.getAllShip(
        "ShippedAccepted",
        "Shipped",
        "None",
        "None",
        undefined,
        undefined,
        user.id,
        1,
        20
      );
      setOrders(res.items || []);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(); // 📦 lần đầu load dữ liệu
  }, [user?.id]);

  useEffect(() => {
    if (lastConfirmedOrderId) {
      fetchOrders(); // 🔁 khi xác nhận đơn mới
    }
  }, [lastConfirmedOrderId]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        🚚 Đơn đang giao ({orders.length})
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : orders.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          Không có đơn hàng nào đang giao.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {orders.map((order) => (
            <Card key={order.id} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="subtitle1" fontWeight={600} noWrap>
                    Mã đơn: {order.id}
                  </Typography>

                  <Typography variant="body2">
                    <strong>Người mua:</strong> {order.user?.fullName || "---"}
                  </Typography>

                  <Typography variant="body2">
                    <strong>Địa chỉ giao:</strong>{" "}
                    {`${order.roomQueryResult.name}, ${order.roomQueryResult.buildingName}, ${order.roomQueryResult.areaName}`}
                  </Typography>

                  <Typography variant="body2">
                    <strong>Cửa hàng:</strong> {order.store.name}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2">
                      <strong>Trạng thái:</strong>
                    </Typography>
                    <Chip
                      label={order.status}
                      color={
                        order.status === "Shipped"
                          ? "success"
                          : order.status === "ShippedAccepted"
                          ? "info"
                          : "default"
                      }
                      size="small"
                    />
                  </Stack>

                  <Typography variant="body2" color="primary">
                    <strong>Tổng tiền:</strong>{" "}
                    {order.totalPrice.toLocaleString()} đ
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      fullWidth
                      onClick={() => navigate(`/shipper/order/${order.id}`)}
                    >
                      Xem chi tiết
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default ShipperHome;
