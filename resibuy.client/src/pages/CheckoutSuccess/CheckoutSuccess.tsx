import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  CircularProgress,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import NotFound from "../../components/NotFound";
import vnPayApi from "../../api/vnpay.api";

const CheckoutSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOrderSuccess } = (location.state as {
    isOrderSuccess: boolean;
  }) || { isOrderSuccess: false };
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      // If no token and no isOrderSuccess, show NotFound
      if (!token && !isOrderSuccess) {
        setIsValid(false);
        setIsVerifying(false);
        return;
      }

      if (!token) {
        if (isOrderSuccess) {
          setIsValid(true);
        }
        setIsVerifying(false);
        return;
      }

      try {
        const response = await vnPayApi.verifyPaymentToken(token);
        setIsValid(response.success && response.data.isValid);
      } catch (error) {
        console.error('Error verifying token:', error);
        setIsValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token, isOrderSuccess]);

  const invalidateToken = async () => {
    if (token) {
      try {
        await vnPayApi.invalidatePaymentToken(token);
      } catch (error) {
        console.error('Error invalidating token:', error);
      }
    }
  };

  if (isVerifying) {
    return (
      <Container maxWidth="md" sx={{ py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!isValid) {
    return <NotFound />;
  }

  const handleViewOrders = async () => {
    await invalidateToken();
    window.history.replaceState({}, "");
    navigate('/orders');
  };

  const handleContinueShopping = async () => {
    await invalidateToken();
    window.history.replaceState({}, "");
    navigate('/');
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 6,
            borderRadius: 4,
            background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          }}
        >
          <Stack spacing={4} alignItems="center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2,
              }}
            >
              <CheckCircleOutlineIcon
                sx={{
                  fontSize: 100,
                  color: "#4CAF50",
                  filter: "drop-shadow(0 4px 8px rgba(76, 175, 80, 0.3))",
                }}
              />
            </motion.div>

            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: "bold",
                color: "#2c3e50",
                textAlign: "center",
              }}
            >
              Đặt hàng thành công!
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "#666",
                textAlign: "center",
                maxWidth: "600px",
              }}
            >
              Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn ngay
              lập tức và gửi thông tin cập nhật qua email.
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 4,
                flexWrap: "wrap",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  width: "200px",
                  textAlign: "center",
                  background: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(10px)",
                  transition: "transform 0.2s",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 8px 24px rgba(33, 150, 243, 0.15)",
                  },
                }}
                onClick={handleViewOrders}
              >
                <LocalShippingIcon
                  sx={{ fontSize: 40, color: "#2196F3", mb: 1 }}
                />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", color: "#2c3e50" }}
                >
                  Theo dõi đơn hàng
                </Typography>
              </Paper>

              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  width: "200px",
                  textAlign: "center",
                  background: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(10px)",
                  transition: "transform 0.2s",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 8px 24px rgba(255, 152, 0, 0.15)",
                  },
                }}
                onClick={handleContinueShopping}
              >
                <ShoppingBagIcon
                  sx={{ fontSize: 40, color: "#FF9800", mb: 1 }}
                />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", color: "#2c3e50" }}
                >
                  Tiếp tục mua sắm
                </Typography>
              </Paper>
            </Box>
          </Stack>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default CheckoutSuccess;
