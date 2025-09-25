import React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grow,
  Fade,
} from "@mui/material";
import { CheckCircle, Home, Celebration } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToStore = () => {
    navigate("/store/44444444-4444-4444-4444-444444444444/sell");
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="a" cx="50%" cy="50%" r="50%"><stop offset="0%" style="stop-color:rgba(255,255,255,0.1);stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(255,255,255,0);stop-opacity:0" /></radialGradient></defs><circle cx="20" cy="20" r="2" fill="url(%23a)"/><circle cx="80" cy="20" r="2" fill="url(%23a)"/><circle cx="20" cy="80" r="2" fill="url(%23a)"/><circle cx="80" cy="80" r="2" fill="url(%23a)"/><circle cx="50" cy="50" r="3" fill="url(%23a)"/></svg>\') repeat',
          opacity: 0.1,
          animation: "float 6s ease-in-out infinite",
        },
      }}
    >
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
        `}
      </style>

      <Grow in={true} timeout={1000}>
        <Card
          sx={{
            maxWidth: 650,
            width: "100%",
            textAlign: "center",
            borderRadius: 4,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
              animation: "shimmer 3s infinite",
            },
          }}
        >
          <CardContent sx={{ py: 8, px: 6, position: "relative", zIndex: 1 }}>
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <CheckCircle
                sx={{
                  fontSize: 120,
                  color: "#10B981",
                  mb: 3,
                  animation: "bounce 2s infinite",
                  filter: "drop-shadow(0 0 20px rgba(16, 185, 129, 0.4))",
                }}
              />
              <Celebration
                sx={{
                  position: "absolute",
                  top: -10,
                  right: -10,
                  fontSize: 40,
                  color: "#F59E0B",
                  animation: "bounce 2s infinite 0.5s",
                }}
              />
            </Box>

            <Fade in={true} timeout={1500}>
              <Box>
                <Typography
                  variant="h3"
                  fontWeight="800"
                  gutterBottom
                  sx={{
                    background: "linear-gradient(45deg, #10B981, #059669)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 2,
                    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  🎉 Thanh toán thành công!
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    mb: 5,
                    color: "#6B7280",
                    fontSize: "1.2rem",
                    fontWeight: 500,
                    lineHeight: 1.6,
                  }}
                >
                  Đơn hàng của bạn đã được xử lý thành công
                  <br />
                  <span style={{ fontSize: "1rem", opacity: 0.8 }}>
                    Cảm ơn bạn đã tin tướng và mua hàng! 💝
                  </span>
                </Typography>

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleBackToStore}
                  startIcon={<Home />}
                  sx={{
                    py: 2.5,
                    px: 6,
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    borderRadius: 3,
                    background: "linear-gradient(45deg, #3B82F6, #1D4ED8)",
                    boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
                    textTransform: "none",
                    animation: "pulse 2s infinite",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "linear-gradient(45deg, #1D4ED8, #1E40AF)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 15px 35px rgba(59, 130, 246, 0.4)",
                    },
                    "&:active": {
                      transform: "translateY(0px)",
                    },
                  }}
                >
                  Quay về trang bán hàng
                </Button>
              </Box>
            </Fade>

            {/* Decorative elements */}
            <Box
              sx={{
                position: "absolute",
                top: 20,
                right: 20,
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "linear-gradient(45deg, #F59E0B, #D97706)",
                opacity: 0.1,
                animation: "pulse 3s infinite",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 20,
                left: 20,
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(45deg, #10B981, #059669)",
                opacity: 0.1,
                animation: "pulse 3s infinite 1s",
              }}
            />
          </CardContent>
        </Card>
      </Grow>
    </Box>
  );
};

export default PaymentSuccess;
