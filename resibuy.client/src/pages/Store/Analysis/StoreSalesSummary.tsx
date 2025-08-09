import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import {
  AttachMoney,
  Inventory2,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import axios from "../../../api/base.api";

interface SalesAnalysisDto {
  numberOfProductsSold: number;
  successedOrderQuantity: number;
  cancelledOrderQuantity: number;
  sales: number;
}

interface Props {
  storeId: string;
  startDate: string;
  endDate: string;
}

const StoreSalesSummary: React.FC<Props> = ({
  storeId,
  startDate,
  endDate,
}) => {
  const [data, setData] = useState<SalesAnalysisDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/store/sales-analysis", {
          params: { storeId, startDate, endDate },
        });
        setData(res.data.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu phân tích bán hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeId, startDate, endDate]);

  const getMetricItems = () => [
    {
      label: "Doanh số",
      value: `₫${data?.sales.toLocaleString() || 0}`,
      icon: <AttachMoney sx={{ fontSize: 32, color: "#4caf50" }} />,
      color: "#4caf50",
      bgColor: "#e8f5e8",
    },
    {
      label: "Sản phẩm đã bán",
      value: data?.numberOfProductsSold || 0,
      icon: <Inventory2 sx={{ fontSize: 32, color: "#2196f3" }} />,
      color: "#2196f3",
      bgColor: "#e3f2fd",
    },
    {
      label: "Đơn hàng thành công",
      value: data?.successedOrderQuantity || 0,
      icon: <CheckCircle sx={{ fontSize: 32, color: "#ff9800" }} />,
      color: "#ff9800",
      bgColor: "#fff3e0",
    },
    {
      label: "Đơn hàng bị huỷ",
      value: data?.cancelledOrderQuantity || 0,
      icon: <Cancel sx={{ fontSize: 32, color: "#f44336" }} />,
      color: "#f44336",
      bgColor: "#ffebee",
    },
  ];

  return (
    <Card variant="outlined" sx={{ p: 2 }}>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          mb={3}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            📊 Phân Tích Bán Hàng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {`Từ ${new Date(startDate).toLocaleDateString(
              "vi-VN"
            )} đến ${new Date(endDate).toLocaleDateString("vi-VN")}`}
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : data ? (
          <Box
            display="grid"
            gridTemplateColumns={{
              xs: "1fr",
              sm: "1fr 1fr",
              md: "repeat(4, 1fr)",
            }}
            gap={2}
          >
            {getMetricItems().map((item, index) => (
              <Card
                key={index}
                sx={{
                  p: 2,
                  textAlign: "center",
                  backgroundColor: item.bgColor,
                  border: `1px solid ${item.color}20`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 8px 25px ${item.color}30`,
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: "50%",
                      backgroundColor: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 4px 12px ${item.color}20`,
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: "text.secondary",
                      fontSize: "0.875rem",
                    }}
                  >
                    {item.label}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: { xs: "1.25rem", md: "1.5rem" },
                      fontWeight: 700,
                      color: item.color,
                      lineHeight: 1,
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" py={4}>
            <Typography color="error" variant="body1">
              ❌ Không có dữ liệu
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StoreSalesSummary;
