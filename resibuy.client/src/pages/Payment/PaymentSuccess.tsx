import React from "react";
import {
  Container,
  Paper,
  Stack,
  Typography,
  Box,
  Button,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HomeIcon from "@mui/icons-material/Home";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useNavigate } from "react-router-dom";

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 6, borderRadius: 4 }}>
        <Stack spacing={4} alignItems="center">
          <CheckCircleOutlineIcon sx={{ fontSize: 96, color: "#4caf50" }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Thanh toán thành công
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "#666", textAlign: "center", maxWidth: 640 }}
          >
            Giao dịch của bạn đã được xử lý thành công. Cảm ơn bạn đã sử dụng
            dịch vụ.
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<ReceiptLongIcon />}
              onClick={() => navigate("/orders")}
            >
              Xem đơn hàng
            </Button>
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={() => navigate("/")}
            >
              Tiếp tục mua sắm
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default PaymentSuccess;
