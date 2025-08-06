import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
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

  return (
    <Card variant="outlined" sx={{ p: 2 }}>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          mb={2}
        >
          <Typography variant="h6" gutterBottom>
            Phân Tích Bán Hàng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {`Từ ${new Date(startDate).toLocaleString()} đến ${new Date(
              endDate
            ).toLocaleString()}`}
          </Typography>
        </Box>

        {loading ? (
          <CircularProgress />
        ) : data ? (
          <Box display="flex" justifyContent="space-between" flexWrap="wrap">
            {[
              { label: "Doanh số", value: `₫${data.sales.toLocaleString()}` },
              { label: "Sản phẩm đã bán", value: data.numberOfProductsSold },
              {
                label: "Đơn hàng thành công",
                value: data.successedOrderQuantity,
              },
              { label: "Đơn hàng bị huỷ", value: data.cancelledOrderQuantity },
            ].map((item, index) => (
              <Box
                key={index}
                sx={{
                  flex: "1 1 200px",
                  textAlign: "center",
                  py: 2,
                }}
              >
                <Typography fontWeight={500}>{item.label}</Typography>
                <Typography fontSize={20} fontWeight={600}>
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="error">Không có dữ liệu</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StoreSalesSummary;
