import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Paper,
  Avatar,
  Divider,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PaymentIcon from "@mui/icons-material/Payment";
import { useNavigate } from "react-router-dom";

const OrderDetailPage: React.FC = () => {
  const navigate = useNavigate();

  const order = {
    id: 123,
    customerName: "Nguyễn Văn A",
    phone: "0909 123 456",
    address: "123 Đường Lý Thường Kiệt, Quận 10, TP.HCM",
    storeAddress: "456 Đường Nguyễn Trãi, Quận 5, TP.HCM",
    status: "Đang giao",
    paymentStatus: "Chưa thanh toán",
    paymentMethod: "Tiền mặt khi nhận hàng",
    items: [
      {
        name: "Trà sữa",
        quantity: 2,
        price: 30000,
        image: "https://via.placeholder.com/60?text=TS",
      },
      {
        name: "Lipton",
        quantity: 1,
        price: 20000,
        image: "https://via.placeholder.com/60?text=LT",
      },
    ],
    total: 80000,
    createdAt: "2025-07-21 10:30",
  };

  const amountToCollect =
    order.paymentStatus === "Chưa thanh toán" ? order.total : 0;

  return (
    <Box sx={{ px: 2, pb: 5 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/shipper")}
        sx={{ mb: 3 }}
      >
        Quay lại
      </Button>

      <Typography variant="h5" fontWeight={700} gutterBottom>
        🧾 Chi tiết đơn hàng #{order.id}
      </Typography>

      {/* Thông tin đơn hàng */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography gutterBottom fontWeight={600}>
              👤 Thông tin khách hàng
            </Typography>
            <Typography>
              <PhoneIcon fontSize="small" /> {order.customerName}
            </Typography>
            <Typography>
              <PhoneIcon fontSize="small" /> {order.phone}
            </Typography>
            <Typography>
              <LocationOnIcon fontSize="small" /> {order.address}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography gutterBottom fontWeight={600}>
              🏪 Cửa hàng & Trạng thái
            </Typography>
            <Typography>
              <LocationOnIcon fontSize="small" /> {order.storeAddress}
            </Typography>
            <Typography>
              <LocalShippingIcon fontSize="small" /> Trạng thái:{" "}
              <strong>{order.status}</strong>
            </Typography>
            <Typography>
              <PaymentIcon fontSize="small" /> Thanh toán:{" "}
              <strong>{order.paymentStatus}</strong>
            </Typography>
            <Typography>
              <PaymentIcon fontSize="small" /> Hình thức: {order.paymentMethod}
            </Typography>
            <Typography>🕒 Ngày tạo: {order.createdAt}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Danh sách sản phẩm */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          📦 Danh sách sản phẩm
        </Typography>
        <Grid container spacing={2}>
          {order.items.map((item, idx) => (
            <Grid key={idx} item xs={12} sm={6} md={4}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  borderRadius: 2,
                  transition: "0.3s",
                  "&:hover": {
                    boxShadow: 3,
                    backgroundColor: "#f5f5f5",
                  },
                }}
              >
                <Avatar
                  src={item.image}
                  alt={item.name}
                  sx={{ width: 60, height: 60 }}
                  variant="rounded"
                />
                <Box>
                  <Typography fontWeight={600}>{item.name}</Typography>
                  <Typography variant="body2">
                    Số lượng: {item.quantity}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Giá: {(item.quantity * item.price).toLocaleString()}đ
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Tổng tiền */}
      <Card
        sx={{
          p: 3,
          borderRadius: 3,
          backgroundColor: "#fefefe",
          border: "1px solid #ddd",
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={600}>
            💰 Tổng tiền:{" "}
            <span style={{ color: "#1976d2" }}>
              {order.total.toLocaleString()}đ
            </span>
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography
            variant="h6"
            fontWeight={700}
            color={amountToCollect > 0 ? "error.main" : "success.main"}
          >
            Số tiền cần thu: {amountToCollect.toLocaleString()}đ
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OrderDetailPage;
