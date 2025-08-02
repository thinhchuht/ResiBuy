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
  Tabs,
  Tab,
  Pagination,
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

// ✅ CHỈ 2 trạng thái theo yêu cầu
const STATUS_OPTIONS = [

    { value: "Assigned", label: "Chờ lấy hàng" },
  { value: "Shipped", label: "🚚 Đang giao" },
  { value: "CustomerNotAvailable", label: "Không liên lạc được với khách" },
];

function ShipperHome() {
  const { user } = useAuth();
  const { lastConfirmedOrderId } = useOrderEvent();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("Shipped");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const navigate = useNavigate();

  const fetchOrders = async (status: string, page: number = 1) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await orderApi.getAll(
        status,
        "None",
        "None",
        undefined,
        undefined,
        user.id,
        page,
        3
      );
      setOrders(res.items || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reset về trang 1 khi đổi trạng thái
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus]);

  // Gọi API khi trạng thái hoặc trang thay đổi
  useEffect(() => {
    fetchOrders(selectedStatus, currentPage);
  }, [user?.id, selectedStatus, currentPage]);

  // Reload lại khi có đơn hàng mới được xác nhận
  useEffect(() => {
    if (lastConfirmedOrderId) {
      fetchOrders(selectedStatus, currentPage);
    }
  }, [lastConfirmedOrderId]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        🚚 Đơn hàng của bạn
      </Typography>

      <Tabs
        value={selectedStatus}
        onChange={(e, newValue) => setSelectedStatus(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        {STATUS_OPTIONS.map((opt) => (
          <Tab key={opt.value} label={opt.label} value={opt.value} />
        ))}
      </Tabs>

      {loading ? (
        <CircularProgress />
      ) : orders.length === 0 ? (
        <Typography color="text.secondary">Không có đơn hàng nào.</Typography>
      ) : (
        <>
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
                            : order.status === "CustomerNotAvailable"
                            ? "error"
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

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(e, page) => setCurrentPage(page)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default ShipperHome;
