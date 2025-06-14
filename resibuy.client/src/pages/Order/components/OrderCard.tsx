import { Box, Paper, Typography, Chip, Button, Divider, Avatar } from "@mui/material";
import { formatPrice } from "../../../utils/priceUtils";

import { useNavigate } from "react-router-dom";
import { OrderStatus, type Order } from "../../../types/models";
import { fakeBuildings } from "../../../fakeData/fakeRoomData";

interface OrderCardProps {
  order: Order;
}

const OrderCard = ({ order }: OrderCardProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return "#FFA500";
      case OrderStatus.Processing:
        return "#2196F3";
      case OrderStatus.Delivered:
        return "#4CAF50";
      case OrderStatus.Cancelled:
        return "#F44336";
      default:
        return "#666";
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return "Chờ xác nhận";
      case OrderStatus.Processing:
        return "Đang xử lý";
      case OrderStatus.Shipped:
        return "Đang giao";
      case OrderStatus.Delivered:
        return "Đã giao";
      case OrderStatus.Cancelled:
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 2,
        borderRadius: 2,
        border: "1px solid #e8e8e8",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          transform: "translateY(-2px)",
        },
      }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ color: "#666", mb: 0.5 }}>
            Mã đơn hàng: #{order.id}
          </Typography>
          <Typography variant="subtitle2" sx={{ color: "#666" }}>
            Ngày đặt: {new Date(order.createAt).toLocaleDateString("vi-VN")}
          </Typography>
        </Box>
        <Chip
          label={getStatusText(order.status)}
          sx={{
            backgroundColor: `${getStatusColor(order.status)}15`,
            color: getStatusColor(order.status),
            fontWeight: 600,
            height: 32,
          }}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {order.items.map((item) => (
        <Box
          key={item.id}
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
          }}>
          <Avatar src={item.product?.productImages[0]?.thumbUrl} variant="rounded" sx={{ width: 80, height: 80, mr: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              {item.product?.name}
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Số lượng: {item.quantity}
            </Typography>
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#FF385C" }}>
            {formatPrice(item.price)}
          </Typography>
        </Box>
      ))}

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ color: "#666", mb: 0.5 }}>
          Địa chỉ giao hàng:
        </Typography>
        {(() => {
          const room = order.shipAddress;
          const building = fakeBuildings.find((b) => b.id === room.buildingId);
          return (
            <Typography variant="body2">
              {room.name}
              {building && `, ${building.name}${building.address ? ", " + building.address : ""}`}
            </Typography>
          );
        })()}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <Box>
          <Typography variant="subtitle2" sx={{ color: "#666", mb: 0.5 }}>
            Tổng tiền:
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#FF385C" }}>
            {formatPrice(order.totalPrice)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          {order.status === OrderStatus.Pending && (
            <Button
              variant="outlined"
              color="error"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                px: 3,
              }}>
              Hủy đơn
            </Button>
          )}
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#FF385C",
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              "&:hover": {
                backgroundColor: "#E62E4D",
              },
            }}
            onClick={() => navigate(`/orders/${order.id}`)}>
            Chi tiết
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default OrderCard;
