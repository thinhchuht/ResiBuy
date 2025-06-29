import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import BlockIcon from "@mui/icons-material/Block";
import HomeIcon from "@mui/icons-material/Home";

const Forbidden: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        background: "#b8a7a7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
      <Container maxWidth="md">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            py: 8,
            px: { xs: 2, sm: 4 },
            borderRadius: 4,
            backdropFilter: "blur(8px)",
          }}>
          <Box
            sx={{
              position: "relative",
              mb: 4,
            }}>
            <BlockIcon
              sx={{
                fontSize: "120px",
                color: "error.main",
                animation: "bounce 2s infinite",
                "@keyframes bounce": {
                  "0%, 100%": {
                    transform: "translateY(0)",
                  },
                  "50%": {
                    transform: "translateY(-20px)",
                  },
                },
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                border: "2px solid",
                borderColor: "error.main",
                opacity: 0.2,
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%": {
                    transform: "translate(-50%, -50%) scale(1)",
                    opacity: 0.2,
                  },
                  "50%": {
                    transform: "translate(-50%, -50%) scale(1.2)",
                    opacity: 0.1,
                  },
                  "100%": {
                    transform: "translate(-50%, -50%) scale(1)",
                    opacity: 0.2,
                  },
                },
              }}
            />
          </Box>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "4rem", md: "6rem" },
              fontWeight: "bold",
              color: "error.main",
              mb: 2,
            }}>
            403
          </Typography>
          <Typography
            variant="h4"
            sx={{
              mb: 3,
              color: "text.secondary",
              fontWeight: "medium",
            }}>
            Truy cập bị cấm
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: "text.secondary",
              maxWidth: "600px",
            }}>
            Bạn không có quyền truy cập vào tài nguyên này. Vui lòng quay lại trang chủ.
          </Typography>
          <Button
            variant="outlined"
            color="error"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate("/")}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1.1rem",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 3,
              },
              transition: "all 0.3s ease",
            }}>
            Quay về trang chủ
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Forbidden;
