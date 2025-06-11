import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HomeIcon from "@mui/icons-material/Home";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          textAlign: "center",
          py: 8,
        }}>
        <ErrorOutlineIcon
          sx={{
            fontSize: "120px",
            color: "primary.main",
            mb: 4,
            animation: "pulse 2s infinite",
            "@keyframes pulse": {
              "0%": {
                transform: "scale(1)",
                opacity: 1,
              },
              "50%": {
                transform: "scale(1.1)",
                opacity: 0.8,
              },
              "100%": {
                transform: "scale(1)",
                opacity: 1,
              },
            },
          }}
        />
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "4rem", md: "6rem" },
            fontWeight: "bold",
            color: "primary.main",
            mb: 2,
          }}>
          404
        </Typography>
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            color: "text.secondary",
            fontWeight: "medium",
          }}>
          Oops! Trang bạn đang tìm kiếm không tồn tại
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 4,
            color: "text.secondary",
            maxWidth: "600px",
          }}>
          Có vẻ như trang bạn đang tìm kiếm đã bị di chuyển hoặc không tồn tại. Hãy quay lại trang chủ và thử lại.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<HomeIcon />}
          onClick={() => navigate("/")}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "1.1rem",
            boxShadow: 3,
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: 6,
            },
            transition: "all 0.3s ease",
          }}>
          Quay về trang chủ
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
