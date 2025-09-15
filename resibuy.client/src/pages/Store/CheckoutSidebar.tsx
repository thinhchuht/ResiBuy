import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Button,
  TextField,
} from "@mui/material";

type CheckoutSidebarProps = {
  total: number;
  discount: number;
  onCheckout: () => void;
};

const CheckoutSidebar: React.FC<CheckoutSidebarProps> = ({
  total,
  discount,
  onCheckout,
}) => {
  const [customerPaid, setCustomerPaid] = useState<number>(total);
  const finalAmount = total - discount;
  const change = customerPaid - finalAmount;

  return (
    <Box flex={1} p={2} component={Paper} elevation={2}>
      <Typography variant="h6">Khách lẻ</Typography>
      <Divider sx={{ my: 1 }} />

      <Typography>Tiền hàng: {total.toLocaleString()} đ</Typography>
      <Typography>
        Giảm tiền đơn hàng: {discount > 0 ? `-${discount.toLocaleString()} đ` : "0 đ"}
      </Typography>
      <Typography variant="h6" sx={{ mt: 2 }}>
        Khách phải trả: {finalAmount.toLocaleString()} đ
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1">Chọn phương thức thanh toán</Typography>
      <Box display="flex" gap={1} my={1}>
        <Button variant="outlined">Chuyển khoản</Button>
        <Button variant="outlined">Tiền mặt</Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography>Tiền khách đưa:</Typography>
      <TextField
        size="small"
        type="number"
        value={customerPaid}
        onChange={(e) => setCustomerPaid(Number(e.target.value))}
        sx={{ my: 1, width: "100%" }}
        inputProps={{ min: 0 }}
      />
      <Typography>
        Tiền thừa trả khách: {change > 0 ? change.toLocaleString() : 0} đ
      </Typography>

      <Button
        variant="contained"
        color="success"
        fullWidth
        sx={{ mt: 3 }}
        onClick={onCheckout}
        disabled={customerPaid < finalAmount}
      >
        Xác nhận thanh toán (F9)
      </Button>
    </Box>
  );
};

export default CheckoutSidebar;