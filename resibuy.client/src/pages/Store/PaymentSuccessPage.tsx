import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Avatar,
  Stack,
} from "@mui/material";
import { CheckCircle, Receipt, Home } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy thông tin từ state (có thể được truyền từ trang thanh toán)
  const orderInfo = location.state?.orderInfo || {};
  const {
    orderId = "N/A",
    totalAmount = 0,
    paymentMethod = "Tiền mặt",
    orderDate = new Date().toLocaleString("vi-VN"),
  } = orderInfo;

  const handleBackToSelling = () => {
    navigate("/store/44444444-4444-4444-4444-444444444444/sell");
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="80vh"
      >
        <Card
          sx={{
            width: "100%",
            textAlign: "center",
            boxShadow: 3,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {/* Header với icon thành công */}
          <Box
            sx={{
              bgcolor: "success.main",
              color: "white",
              py: 3,
              position: "relative",
            }}
          >
            <Avatar
              sx={{
                bgcolor: "white",
                color: "success.main",
                width: 80,
                height: 80,
                mx: "auto",
                mb: 2,
              }}
            >
              <CheckCircle sx={{ fontSize: 50 }} />
            </Avatar>
            <Typography variant="h4" fontWeight="bold">
              Thanh toán thành công!
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9, mt: 1 }}>
              Đơn hàng của bạn đã được xử lý thành công
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {/* Thông tin đơn hàng */}
            <Stack spacing={3} sx={{ mb: 4 }}>
              <Box>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Thông tin đơn hàng
                </Typography>
                <Box
                  sx={{
                    bgcolor: "grey.50",
                    borderRadius: 2,
                    p: 2,
                    textAlign: "left",
                  }}
                >
                  <Stack spacing={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Mã đơn hàng:
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {orderId}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Tổng tiền:
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="600"
                        color="success.main"
                      >
                        {totalAmount.toLocaleString()} VND
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Phương thức:
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {paymentMethod}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Thời gian:
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {orderDate}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Box>

              {/* Message */}
              <Box>
                <Typography variant="body1" color="text.secondary">
                  Cảm ơn bạn đã mua hàng! Đơn hàng sẽ được xử lý và giao đến bạn
                  sớm nhất.
                </Typography>
              </Box>
            </Stack>

            {/* Action buttons */}
            <Stack spacing={2}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Home />}
                onClick={handleBackToSelling}
                sx={{
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                Quay lại trang bán hàng
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Footer message */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 3, textAlign: "center" }}
        >
          Nếu có bất kỳ vấn đề gì, vui lòng liên hệ với chúng tôi
        </Typography>
      </Box>
    </Container>
  );
};

export default PaymentSuccessPage;
