import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Container, Paper, CircularProgress } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useNavigate, useSearchParams } from "react-router-dom";
import vnPayApi from "../../api/vnpay.api";
import NotFound from "../../components/NotFound";

const CheckoutFailed: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await vnPayApi.verifyPaymentToken(token);
        if (response.success && response.data.isValid) {
          setIsValid(true);
          // Invalidate token after verification
          await vnPayApi.invalidatePaymentToken(token);
        }
      } catch (error) {
        console.error("Error verifying token:", error);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [searchParams]);

  const handleTryAgain = async () => {
    const token = searchParams.get("token");
    if (token) {
      try {
        await vnPayApi.invalidatePaymentToken(token);
      } catch (error) {
        console.error("Error invalidating token:", error);
      }
    }
    navigate("/cart");
  };

  const handleBackToHome = async () => {
    const token = searchParams.get("token");
    if (token) {
      try {
        await vnPayApi.invalidatePaymentToken(token);
      } catch (error) {
        console.error("Error invalidating token:", error);
      }
    }
    navigate("/");
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!isValid) {
    return <NotFound />;
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 4,
          textAlign: "center",
          bgcolor: "#fff",
        }}
      >
        <ErrorOutlineIcon
          sx={{
            fontSize: 80,
            color: "#ff4d4f",
            mb: 3,
          }}
        />
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#333" }}
        >
          Thanh toán thất bại
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "#666", mb: 4, maxWidth: "600px", mx: "auto" }}
        >
          Rất tiếc, quá trình thanh toán của bạn không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
        </Typography>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleTryAgain}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1.1rem",
            }}
          >
            Thử lại
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={handleBackToHome}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1.1rem",
            }}
          >
            Về trang chủ
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CheckoutFailed; 