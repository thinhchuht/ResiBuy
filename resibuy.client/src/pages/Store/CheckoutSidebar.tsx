import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import userApi from "../../api/user.api";
import cartApi from "../../api/cart.api";

type CheckoutSidebarProps = {
  total: number;
  discount: number;
  onCheckout: () => void;
  cartId: string; // 🔹 truyền cartId từ props
};

const CheckoutSidebar: React.FC<CheckoutSidebarProps> = ({
  total,
  discount,
  onCheckout,
  cartId,
}) => {
  const [customerPaid, setCustomerPaid] = useState<number>(total);

  // State khách hàng
  const [customer, setCustomer] = useState<any | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");

  // 🔎 Tìm khách hàng theo số điện thoại
  const handleSearchCustomer = async () => {
    if (!phoneInput.trim()) return;

    try {
      const res = await userApi.getUserByPhone(phoneInput);
      if (res.error) {
        alert(res.error.message);
        setCustomer(null);
      } else {
        const foundCustomer = res.data;
        // ✅ Update cart với userId
        await cartApi.updateUserInCart(cartId, foundCustomer.id);

        setCustomer(foundCustomer);
        setOpenDialog(false);
      }
    } catch (err: any) {
      alert(err?.error?.message || "Lỗi khi tìm khách hàng");
    }
  };

  const finalAmount = total - discount;
  const change = customerPaid - finalAmount;

  return (
    <Box flex={1} p={2} component={Paper} elevation={2}>
      <Typography variant="h6">Khách hàng</Typography>
      <Divider sx={{ my: 1 }} />

      {customer ? (
        <Box>
          <Typography>Họ tên: {customer.fullName}</Typography>
          <Typography>SĐT: {customer.phoneNumber}</Typography>
          <Button
            variant="outlined"
            size="small"
            sx={{ mt: 1 }}
            onClick={() => setOpenDialog(true)}
          >
            Đổi khách hàng
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography>❌ Chưa có khách hàng</Typography>
          <Button
            variant="outlined"
            size="small"
            sx={{ mt: 1 }}
            onClick={() => setOpenDialog(true)}
          >
            Thêm khách hàng
          </Button>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography>Tiền hàng: {total.toLocaleString()} đ</Typography>
      <Typography>
        Giảm tiền đơn hàng:{" "}
        {discount > 0 ? `-${discount.toLocaleString()} đ` : "0 đ"}
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
        Xác nhận thanh toán
      </Button>

      {/* 🔹 Popup thêm khách hàng */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>Thêm khách hàng</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            {/* Khách vãng lai */}
            <Button
              variant="outlined"
              onClick={() => {
                setCustomer({ fullName: "Khách vãng lai" });
                setOpenDialog(false);
              }}
            >
              Khách vãng lai
            </Button>

            {/* Thêm mới khách hàng */}
            <Button
              variant="outlined"
              onClick={() => {
                // TODO: mở form thêm mới khách hàng
                alert("Chức năng thêm mới khách hàng");
              }}
            >
              Thêm mới khách hàng
            </Button>

            {/* Nhập số điện thoại để tìm */}
            <TextField
              label="Nhập số điện thoại"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearchCustomer();
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CheckoutSidebar;
