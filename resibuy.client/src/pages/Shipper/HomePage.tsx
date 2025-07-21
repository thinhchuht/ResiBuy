import React from "react";
import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  // Giả lập có đơn hàng đang giao
  const currentOrder = {
    id: 123,
    customerName: "Nguyễn Văn A",
    address: "123 Đường Lý Thường Kiệt, Quận 10, TP.HCM",
    status: "Đang giao",
  };

  // const currentOrder = null; // Mở dòng này nếu bạn muốn test khi không có đơn
  const navigate = useNavigate();
  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Trang chủ Shipper
      </Typography>

      {currentOrder ? (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <LocalShippingIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Đơn hàng đang giao</Typography>
            </Box>

            <Typography>
              <strong>Mã đơn:</strong> #{currentOrder.id}
            </Typography>
            <Typography>
              <strong>Khách hàng:</strong> {currentOrder.customerName}
            </Typography>
            <Typography>
              <strong>Địa chỉ:</strong> {currentOrder.address}
            </Typography>
            <Typography>
              <strong>Trạng thái:</strong> {currentOrder.status}
            </Typography>

            <Box mt={2}>
              <Button variant="outlined" onClick={() => navigate("/shipper/order/123")}>
                Xem chi tiết
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box mt={5} textAlign="center">
          <Typography variant="h6" color="text.secondary">
            Không có đơn hàng nào cần giao
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default HomePage;
