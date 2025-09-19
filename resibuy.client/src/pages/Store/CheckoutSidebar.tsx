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
  Snackbar,
  Alert,
} from "@mui/material";
import userApi from "../../api/user.api";
import voucherApi from "../../api/voucher.api";
import shipperApi from "../../api/ship.api";
import DeliveryAddressDialog from "./DeliveryAddressDialog";

type CheckoutSidebarProps = {
  total: number;
  discount: number;
  onCheckout: (data: any) => void;
  cartId: string;
};

type CartState = {
  customer: any | null;
  voucher: any | null;
  paymentMethod: "CASH" | "BANK" | null;
  customerPaid: number;
  deliveryAddress?: any;
  shippingFee?: number;
  deliveryMethod?: "PICKUP" | "DELIVERY";
};

const CheckoutSidebar: React.FC<CheckoutSidebarProps> = ({
  total,
  discount,
  onCheckout,
  cartId,
}) => {
  const [cartStates, setCartStates] = useState<Record<string, CartState>>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [openVoucherDialog, setOpenVoucherDialog] = useState(false);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<any>(null);

  // snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "info" });

  const showMessage = (
    message: string,
    severity: "success" | "error" | "info" | "warning" = "info"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  // state cart hiện tại
  const currentCart = cartStates[cartId] || {
    customer: null,
    voucher: null,
    paymentMethod: null,
    customerPaid: total,
    shippingFee: 0,
  };

  const setCartState = (updates: Partial<CartState>) => {
    setCartStates((prev) => ({
      ...prev,
      [cartId]: { ...currentCart, ...updates },
    }));
  };

  // tìm khách
  const handleSearchCustomer = async () => {
    if (!phoneInput.trim()) return;
    try {
      const res = await userApi.getUserByPhone(phoneInput);
      setCartState({ customer: res.data });
      setOpenDialog(false);
      showMessage("Đã chọn khách hàng thành công", "success");
    } catch (err: any) {
      showMessage(err?.error?.message || "Lỗi khi tìm khách hàng", "error");
    }
  };

  // mở voucher
  const handleOpenVoucherDialog = async () => {
    try {
      const res = await voucherApi.getAll({
        minOrderPrice: finalAmount,
        isActive: true,
        pageNumber: 1,
        pageSize: 20,
      });
      setVouchers(res.data.items || []);
      setOpenVoucherDialog(true);
    } catch (err: any) {
      showMessage(err?.error?.message || "Không thể tải voucher", "error");
    }
  };

  // tính giảm giá từ voucher
  const voucherDiscount = (() => {
    if (!currentCart.voucher) return 0;
    if (currentCart.voucher.type === "Amount") {
      return currentCart.voucher.discountAmount;
    }
    if (currentCart.voucher.type === "Percentage") {
      const discountValue =
        (total - discount) * (currentCart.voucher.discountAmount / 100);
      return Math.min(discountValue, currentCart.voucher.maxDiscountPrice);
    }
    return 0;
  })();

  const finalAmount = total - discount - voucherDiscount;
  const shippingFee = currentCart.shippingFee || 0;
  const change = currentCart.customerPaid - (finalAmount + shippingFee);

  return (
    <Box flex={1} p={2} component={Paper} elevation={2}>
      <Typography variant="h6">Khách hàng</Typography>
      <Divider sx={{ my: 1 }} />

      {currentCart.customer ? (
        <Box>
          <Typography>Họ tên: {currentCart.customer.fullName}</Typography>
          <Typography>SĐT: {currentCart.customer.phoneNumber}</Typography>
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
          <Typography color="error">❌ Chưa có khách hàng</Typography>
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

      <Typography variant="subtitle1">Hình thức nhận hàng</Typography>
      <Box display="flex" gap={1} my={1}>
        <Button
          variant={
            currentCart.deliveryMethod === "PICKUP" ? "contained" : "outlined"
          }
          onClick={() => {
            setDeliveryAddress(null); // 👈 reset UI
            setCartState({
              deliveryMethod: "PICKUP",
              shippingFee: 0,
              deliveryAddress: "33333333-3333-3333-3333-333333333333", // 👈 reset trong state cart
            });
          }}
        >
          Lấy tại quầy
        </Button>

        <Button
          variant={
            currentCart.deliveryMethod === "DELIVERY" ? "contained" : "outlined"
          }
          onClick={() => {
            setCartState({ deliveryMethod: "DELIVERY" });
            setShowAddressDialog(true);
          }}
        >
          Giao hàng
        </Button>
      </Box>

      {deliveryAddress && (
        <Typography
          variant="body2"
          sx={{ mt: 1, fontStyle: "italic", color: "#555" }}
        >
          Địa chỉ nhận hàng: {deliveryAddress.areaName} -{" "}
          {deliveryAddress.buildingName} - {deliveryAddress.roomName}
        </Typography>
      )}

      <DeliveryAddressDialog
        open={showAddressDialog}
        onClose={() => setShowAddressDialog(false)}
        onSave={async (address) => {
          setDeliveryAddress(address);
          setCartState({ deliveryAddress: address });

          try {
            const res = await shipperApi.calculate(
              address.id,
              "33333333-3333-3333-3333-333333333333", // địa chỉ cửa hàng thật
              1.0
            );
            setCartState({ shippingFee: res.data });
          } catch (err: any) {
            showMessage("Không tính được phí ship", "error");
          }
        }}
      />

      <Divider sx={{ my: 2 }} />

      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography>Voucher:</Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={handleOpenVoucherDialog}
        >
          {currentCart.voucher
            ? currentCart.voucher.type === "Percentage"
              ? `Giảm ${currentCart.voucher.discountAmount}%`
              : `Giảm ${currentCart.voucher.discountAmount}đ`
            : "Chọn voucher"}
        </Button>
      </Box>

      <Typography sx={{ mt: 1 }}>
        Tiền hàng: {total.toLocaleString()} đ
      </Typography>
      <Typography>
        Phí ship:{" "}
        {shippingFee > 0 ? `${shippingFee.toLocaleString()} đ` : "0 đ"}
      </Typography>
      <Typography>
        Giảm tiền đơn hàng:{" "}
        {discount > 0 ? `-${discount.toLocaleString()} đ` : "0 đ"}
      </Typography>
      {voucherDiscount > 0 && (
        <Typography>Voucher: -{voucherDiscount.toLocaleString()} đ</Typography>
      )}
      <Typography variant="h6">
        Tổng cộng: {(finalAmount + shippingFee).toLocaleString()} đ
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1">Chọn phương thức thanh toán</Typography>
      <Box display="flex" gap={1} my={1}>
        <Button
          variant={
            currentCart.paymentMethod === "BANK" ? "contained" : "outlined"
          }
          onClick={() => setCartState({ paymentMethod: "BANK" })}
        >
          Chuyển khoản
        </Button>
        <Button
          variant={
            currentCart.paymentMethod === "CASH" ? "contained" : "outlined"
          }
          onClick={() => setCartState({ paymentMethod: "CASH" })}
        >
          Tiền mặt
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      {currentCart.paymentMethod === "CASH" && (
        <>
          <Typography>Tiền khách đưa:</Typography>
          <TextField
            size="small"
            type="number"
            value={currentCart.customerPaid}
            onChange={(e) =>
              setCartState({ customerPaid: Number(e.target.value) })
            }
            sx={{ my: 1, width: "100%" }}
            inputProps={{ min: 0 }}
          />
          <Typography>
            Tiền thừa trả khách: {change > 0 ? change.toLocaleString() : 0} đ
          </Typography>
        </>
      )}

      <Button
        variant="contained"
        color="success"
        fullWidth
        sx={{ mt: 3 }}
        onClick={() => {
          if (!currentCart.customer) {
            showMessage("Vui lòng chọn khách hàng", "warning");
            return;
          }
          if (!currentCart.paymentMethod) {
            showMessage("Vui lòng chọn phương thức thanh toán", "warning");
            return;
          }
          if (
            currentCart.paymentMethod === "CASH" &&
            currentCart.customerPaid < finalAmount + shippingFee
          ) {
            showMessage("Số tiền khách đưa chưa hợp lệ", "error");
            return;
          }
          onCheckout({
            cartId,
            customer: currentCart.customer,
            voucher: currentCart.voucher,
            paymentMethod: currentCart.paymentMethod,
            customerPaid: currentCart.customerPaid,
            deliveryAddress: currentCart.deliveryAddress,
            shippingFee: currentCart.shippingFee || 0,
          });
          showMessage("Thanh toán thành công", "success");
        }}
      >
        Xác nhận thanh toán
      </Button>

      {/* Popup thêm khách hàng */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>Thêm khách hàng</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Button
              variant="outlined"
              onClick={() => {
                setCartState({ customer: { fullName: "Khách vãng lai" } });
                setOpenDialog(false);
              }}
            >
              Khách vãng lai
            </Button>

            <Button
              variant="outlined"
              onClick={() => {
                showMessage("Chức năng thêm mới khách hàng", "info");
              }}
            >
              Thêm mới khách hàng
            </Button>

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

      {/* Popup chọn voucher */}
      <Dialog
        open={openVoucherDialog}
        onClose={() => setOpenVoucherDialog(false)}
        fullWidth
      >
        <DialogTitle>Chọn voucher</DialogTitle>
        <DialogContent>
          {vouchers.length > 0 ? (
            vouchers.map((v: any) => {
              const isPercent = v.type === "Percentage";
              return (
                <Box
                  key={v.id}
                  p={2}
                  mb={1}
                  border="1px solid #ccc"
                  borderRadius={2}
                  sx={{ cursor: "pointer" }}
                  onClick={() => {
                    setCartState({ voucher: v });
                    setOpenVoucherDialog(false);
                    showMessage("Đã chọn voucher", "success");
                  }}
                >
                  <Typography fontWeight="bold">
                    {isPercent
                      ? `Giảm ${
                          v.discountAmount
                        }% (tối đa ${v.maxDiscountPrice.toLocaleString()} đ)`
                      : `Giảm ${v.discountAmount.toLocaleString()} đ`}
                  </Typography>
                  <Typography>
                    Đơn tối thiểu: {v.minOrderPrice.toLocaleString()} đ
                  </Typography>
                  <Typography>
                    HSD: {new Date(v.endDate).toLocaleDateString("vi-VN")}
                  </Typography>
                </Box>
              );
            })
          ) : (
            <Typography>Không có voucher phù hợp</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVoucherDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CheckoutSidebar;
