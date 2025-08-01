import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";
import orderApi from "../../api/order.api";
import { useAuth } from "../../contexts/AuthContext";
import { useToastify } from "../../hooks/useToastify";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  image?: {
    id: string;
    url: string;
    thumbUrl: string;
    name: string;
  };
  addtionalData: {
    id: number;
    key: string;
    value: string;
  }[];
}

interface Order {
  id: string;
  totalPrice: number;
  shippingFee: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  note: string;
  user: {
    fullName: string;
    phoneNumber: string;
  };
  store: {
    name: string;
    phoneNumber: string;
  };
  roomQueryResult: {
    name: string;
    buildingName: string;
    areaName: string;
    areaId: string;
  };
  orderItems: OrderItem[];
}

function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToastify();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderApi.getById(id as string);
        setOrder(res);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết đơn hàng:", error);
      }
    };
    fetchOrder();
  }, [id]);

  if (!order) return <Typography>Đang tải...</Typography>;

  const deliveryAddress = `${order.roomQueryResult.areaName}, ${order.roomQueryResult.buildingName}, ${order.roomQueryResult.name}`;

  const handlePickedUp = async () => {
    if (!user?.id || !order?.id) {
      toast.error("Thiếu thông tin người dùng hoặc đơn hàng");
      return;
    }
    try {
      await orderApi.updateOrderStatusShip(order.id, "Shipped", user.id);
      toast.success(" Đã xác nhận lấy hàng");
      setOrder((prev) => prev && { ...prev, status: "Shipped" });
    } catch (err) {
      console.error(" Lỗi khi cập nhật trạng thái đơn hàng:", err);
      toast.error("Không thể cập nhật trạng thái!");
    }
  };

  const handleDelivered = async () => {
    if (!user?.id || !order?.id) {
      toast.error("Thiếu thông tin");
      return;
    }

    try {
      await orderApi.updateOrderStatusShip(order.id, "Delivered", user.id);
      toast.success("Giao hàng thành công");
      setOrder((prev) => prev && { ...prev, status: "Delivered" });
    } catch (err) {
      console.error(err);
      toast.error("Không thể cập nhật trạng thái!");
    }
  };

  const handleCustomerNotAvailable = async () => {
    if (!user?.id || !order?.id) {
      toast.error("Thiếu thông tin");
      return;
    }

    try {
      await orderApi.updateOrderStatusShip(
        order.id,
        "CustomerNotAvailable",
        user.id
      );
      toast.success("Xác nhận không liên lạc được với khách hàng thành công");
      setOrder((prev) => prev && { ...prev, status: "CustomerNotAvailable" });
    } catch (err) {
      console.error(err);
      toast.error("Không thể cập nhật trạng thái!");
    }
  };

  const handleCancelled = async () => {
    if (!user?.id || !order?.id) {
      toast.error("Thiếu thông tin");
      return;
    }

    try {
      await orderApi.updateOrderSatus(
        user.id,
        order.id,
        "Cancelled",
        "Không liên lạc được với khách hàng"
      );
      toast.success("Xác nhận hủy đơn thành công");
      setOrder((prev) => prev && { ...prev, status: "Cancelled" });
    } catch (err) {
      console.error(err);
      toast.error("Không thể cập nhật trạng thái!");
    }
  };

  const handleReport = () => {
    alert("⚠️ Báo cáo đơn hàng (chức năng này sẽ được cập nhật sau).");
  };

  const getOrderStatusLabel = (status: string): string => {
    switch (status) {
      case "Pending":
        return "🕒 Chờ cửa hàng xác nhận";
      case "Processing":
        return "🔄 Cửa hàng đã xác nhận";
      case "Assigned":
        return "📦 Đã gán cho shipper";
      case "Shipped":
        return "🚚 Đang giao hàng";
      case "Delivered":
        return "✅ Đã giao hàng";
      case "CustomerNotAvailable":
        return "📞 Không liên lạc được với khách";
      case "Cancelled":
        return "❌ Đã hủy";
      case "Reported":
        return "⚠️ Đã báo cáo";
      case "None":
      default:
        return "Không xác định";
    }
  };

  const getPaymentMethodLabel = (method: string): string => {
    switch (method) {
      case "COD":
        return "💵 Thanh toán khi nhận hàng";
      case "BankTransfer":
        return "🏦 Chuyển khoản ngân hàng";
      default:
        return "Không xác định";
    }
  };

  const getPaymentStatusLabel = (status: string): string => {
    switch (status) {
      case "Pending":
        return "⏳ Chưa thanh toán";
      case "Paid":
        return "✅ Đã thanh toán";
      case "Failed":
        return "❌ Thanh toán thất bại";
      case "Refunded":
        return "↩️ Đã hoàn tiền";
      default:
        return "Không xác định";
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        📦 Chi tiết đơn hàng
      </Typography>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography>
              <strong>Mã đơn:</strong> {order.id}
            </Typography>
            <Typography>
              <strong>Người đặt:</strong> {order.user.fullName} (
              {order.user.phoneNumber})
            </Typography>
            <Typography>
              <strong>Cửa hàng:</strong> {order.store.name} (
              {order.store.phoneNumber})
            </Typography>
            <Typography>
              <strong>Địa chỉ giao hàng:</strong> {deliveryAddress}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">
                <strong>Trạng thái:</strong>
              </Typography>
              <Chip
                label={getOrderStatusLabel(order.status)}
                color={
                  order.status === "Shipped"
                    ? "success"
                    : order.status === "Assigned"
                    ? "info"
                    : order.status === "Delivered"
                    ? "default"
                    : order.status === "Cancelled"
                    ? "error"
                    : order.status === "Reported"
                    ? "warning"
                    : "default"
                }
                size="small"
              />
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">
                <strong>Thanh toán:</strong>{" "}
                {getPaymentMethodLabel(order.paymentMethod)}
              </Typography>
              <Chip
                label={getPaymentStatusLabel(order.paymentStatus)}
                color={
                  order.paymentStatus === "Paid"
                    ? "success"
                    : order.paymentStatus === "Failed"
                    ? "error"
                    : order.paymentStatus === "Refunded"
                    ? "default"
                    : "warning"
                }
                size="small"
              />
            </Stack>

            <Typography>
              <strong>Tổng tiền:</strong> {order.totalPrice.toLocaleString()} đ
            </Typography>
            <Typography>
              <strong>Phí ship:</strong> {order.shippingFee?.toLocaleString()} đ
            </Typography>
            {order.paymentMethod === "COD" ? (
              <Typography>
                <strong>Tổng tiền thu:</strong>{" "}
                {(order.totalPrice + order.shippingFee).toLocaleString()} đ
              </Typography>
            ) : order.paymentMethod === "BankTransfer" &&
              order.paymentStatus === "Paid" ? (
              <Typography>
                <strong>Tổng tiền thu:</strong> 0 đ
              </Typography>
            ) : null}

            {order.note && (
              <Typography>
                <strong>Ghi chú:</strong> {order.note}
              </Typography>
            )}

            <Divider />

            <Typography variant="subtitle1" fontWeight={600}>
              🧾 Danh sách sản phẩm:
            </Typography>

            {order.orderItems.map((item) => (
              <Card
                key={item.id}
                variant="outlined"
                sx={{ mb: 2, p: 1.5, display: "flex", alignItems: "center" }}
              >
                {item.image?.thumbUrl && (
                  <Box
                    component="img"
                    src={item.image.url}
                    alt={item.productName}
                    sx={{
                      width: 72,
                      height: 72,
                      objectFit: "cover",
                      borderRadius: 1,
                      mr: 2,
                    }}
                  />
                )}

                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600}>{item.productName}</Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    sx={{ mt: 0.5, mb: 1 }}
                  >
                    {item.addtionalData.map((ad) => (
                      <Chip
                        key={ad.id}
                        label={`${ad.key}: ${ad.value}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Số lượng: <strong>{item.quantity}</strong> | Giá:{" "}
                    <strong>{item.price.toLocaleString()} đ</strong>
                  </Typography>
                </Box>
              </Card>
            ))}

            <Divider sx={{ my: 2 }} />

            <Stack
              direction="row"
              spacing={2}
              justifyContent="space-between"
              flexWrap="wrap"
            >
              {order.status === "Assigned" && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={handlePickedUp}
                >
                  Đã lấy hàng
                </Button>
              )}

              {order.status === "Shipped" && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDelivered}
                >
                  Đã giao hàng
                </Button>
              )}

              {order.status === "Shipped" && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleCustomerNotAvailable}
                >
                  Không liên lạc được với khách
                </Button>
              )}

              {order.status === "CustomerNotAvailable" && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleCancelled}
                >
                  Hủy đơn hàng
                </Button>
              )}

              <Button variant="contained" color="error" onClick={handleReport}>
                Báo cáo đơn hàng
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default OrderDetail;
