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
  };
  orderItems: OrderItem[];
}

function OrderDetail() {
  const { id } = useParams();
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

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handlePickedUp = () => {
    alert("✅ Đã xác nhận lấy hàng.");
  };

  const handleReport = () => {
    alert("⚠️ Báo cáo đơn hàng (chức năng này sẽ được cập nhật sau).");
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

            <Typography>
              <strong>Trạng thái:</strong>{" "}
              <Chip label={order.status} color="info" />
            </Typography>

            <Typography>
              <strong>Thanh toán:</strong> {order.paymentMethod} -{" "}
              <Chip label={order.paymentStatus} color="warning" />
            </Typography>

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
                {/* Ảnh sản phẩm */}
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

                {/* Nội dung sản phẩm */}
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600}>{item.productName}</Typography>

                  {/* Phân loại sản phẩm */}
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

                  {/* Giá và SL */}
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
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleCall(order.user.phoneNumber)}
              >
                📞 Gọi người mua
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleCall(order.store.phoneNumber)}
              >
                🏪 Gọi cửa hàng
              </Button>

              <Button
                variant="contained"
                color="success"
                onClick={handlePickedUp}
              >
                ✅ Đã lấy hàng
              </Button>

              <Button variant="contained" color="error" onClick={handleReport}>
                ⚠️ Báo cáo đơn hàng
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default OrderDetail;
