import React, { useState, useEffect, useRef } from "react";
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
import { PersonOff } from "@mui/icons-material";
import userApi from "../../api/user.api";
import orderApi from "../../api/order.api";
import voucherApi from "../../api/voucher.api";
import shipperApi from "../../api/ship.api";
import DeliveryAddressDialog from "./DeliveryAddressDialog";
import CreateUserModal from "./CreateUserModal";

type CheckoutSidebarProps = {
  total: number;
  discount: number;
  onCheckout?: (data: any) => void;
  onOrderCreated?: (cartId: string, orderId: string) => void;
  cartId: string;
  storeId?: string;
  totalWeight?: number;
  cartItems: OrderItem[];
  scannedBarcodes: Record<string, { itemId: string; barcode: string }[]>;
};

type CartState = {
  customer: any | null;
  voucher: any | null;
  paymentMethod: "CASH" | "BANK" | null;
  customerPaid: number;
  deliveryAddress?: DeliveryAddress | null;
  shippingFee?: number;
  deliveryMethod?: "PICKUP" | "DELIVERY";
};

type DeliveryAddress = {
  id: string;
  areaId: string;
  areaName?: string;
  buildingId: string;
  buildingName?: string;
  roomId: string;
  roomName?: string;
};

type Voucher = {
  id: string;
  type: string;
  discountAmount: number;
  maxDiscountPrice?: number;
  minOrderPrice?: number;
  endDate?: string;
};

type OrderItem = {
  id: string;
  productDetailId: number;
  quantity: number;
  price: number;
  discount: number;
  product: {
    id: number;
    name: string;
    stock: number;
    image?: string;
  };
  productDetail?: {
    barcodes?: { id: number; code: string; productDetailId: number }[];
  };
};

const CheckoutSidebar: React.FC<CheckoutSidebarProps> = ({
  total,
  discount,
  cartId,
  storeId,
  totalWeight,
  onOrderCreated,
  cartItems,
  scannedBarcodes,
}) => {
  const [cartStates, setCartStates] = useState<Record<string, CartState>>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [openVoucherDialog, setOpenVoucherDialog] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const recalculatingRef = useRef<NodeJS.Timeout | null>(null);
  const [openCreateUserModal, setOpenCreateUserModal] = useState(false);

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

  const defaultCartState = {
    customer: null,
    voucher: null,
    paymentMethod: null,
    customerPaid: total,
    shippingFee: 0,
    deliveryMethod: undefined,
    deliveryAddress: null,
  } as CartState;

  const currentCart = cartStates[cartId] || defaultCartState;

  const setCartState = (updates: Partial<CartState>) => {
    setCartStates((prev) => {
      const prevCart = prev[cartId] || defaultCartState;
      return {
        ...prev,
        [cartId]: { ...prevCart, ...updates },
      };
    });
  };

  useEffect(() => {
    const current = cartStates[cartId] || defaultCartState;
    if (current.deliveryMethod !== "DELIVERY" || !current.deliveryAddress)
      return;

    if (recalculatingRef.current) clearTimeout(recalculatingRef.current);
    recalculatingRef.current = setTimeout(async () => {
      try {
        const res = await shipperApi.calculate(
          current.deliveryAddress!.id,
          "33333333-3333-3333-3333-333333333333",
          totalWeight ?? 1.0
        );
        setCartStates((prev) => {
          const prevCart = prev[cartId] || defaultCartState;
          return {
            ...prev,
            [cartId]: { ...prevCart, shippingFee: res.data },
          };
        });
      } catch (err: unknown) {
        console.error("Error recalculating shipping:", err);
        showMessage("Không tính được phí ship", "error");
      }
    }, 350);

    return () => {
      if (recalculatingRef.current) clearTimeout(recalculatingRef.current);
      recalculatingRef.current = null;
    };
  }, [
    cartStates[cartId]?.deliveryMethod,
    cartStates[cartId]?.deliveryAddress?.id,
    totalWeight,
  ]);

  const handleSearchCustomer = async () => {
    if (!phoneInput.trim()) return;
    try {
      const res = await userApi.getUserByPhone(phoneInput);
      setCartState({ customer: res.data });
      setOpenDialog(false);
      showMessage("Đã chọn khách hàng thành công", "success");
    } catch (err: unknown) {
      console.error(err);
      showMessage("Lỗi khi tìm khách hàng", "error");
    }
  };

  const handleGuestCustomer = async () => {
    try {
      const res = await userApi.getUserByPhone("0123456789");
      setCartState({ customer: res.data });
      setOpenDialog(false);
      showMessage("Đã chọn khách vãng lai", "success");
    } catch (err: unknown) {
      console.error("Error fetching guest customer:", err);
      showMessage("Lỗi khi chọn khách vãng lai", "error");
    }
  };

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
    } catch (err: unknown) {
      console.error(err);
      showMessage("Không thể tải voucher", "error");
    }
  };

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
      <Typography variant="h6">Thông tin đơn hàng</Typography>
      <Divider sx={{ my: 1 }} />

      {currentCart.customer ? (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Khách hàng
          </Typography>
          <Typography>Họ tên: {currentCart.customer.fullName}</Typography>
          {currentCart.customer.phoneNumber !== "0123456789" && (
            <Typography>SĐT: {currentCart.customer.phoneNumber}</Typography>
          )}
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
        <Box display="flex" alignItems="center" gap={1}>
          <PersonOff color="error" />
          <Typography color="error">Chưa có khách hàng</Typography>
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

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Hình thức nhận hàng
      </Typography>
      <Box display="flex" gap={1} my={1}>
        <Button
          variant={
            currentCart.deliveryMethod === "PICKUP" ? "contained" : "outlined"
          }
          onClick={() => {
            setCartState({
              deliveryMethod: "PICKUP",
              shippingFee: 0,
              deliveryAddress: {
                id: "33333333-3333-3333-3333-333333333333",
                areaId: "",
                areaName: "Cửa hàng",
                buildingId: "",
                buildingName: "Cửa hàng",
                roomId: "",
                roomName: "Cửa hàng",
              },
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

      {currentCart.deliveryAddress && (
        <Typography
          variant="body2"
          sx={{ mt: 1, fontStyle: "italic", color: "#555" }}
        >
          Địa chỉ nhận hàng: {currentCart.deliveryAddress.areaName} -{" "}
          {currentCart.deliveryAddress.buildingName} -{" "}
          {currentCart.deliveryAddress.roomName}
        </Typography>
      )}

      <DeliveryAddressDialog
        open={showAddressDialog}
        onClose={() => setShowAddressDialog(false)}
        onSave={async (address: DeliveryAddress) => {
          setCartState({ deliveryAddress: address });
          try {
            const res = await shipperApi.calculate(
              address.id,
              "33333333-3333-3333-3333-333333333333",
              totalWeight ?? 1.0
            );
            setCartStates((prev) => {
              const prevCart = prev[cartId] || defaultCartState;
              return {
                ...prev,
                [cartId]: { ...prevCart, shippingFee: res.data },
              };
            });
          } catch (err: unknown) {
            console.error(err);
            showMessage("Không tính được phí ship", "error");
          }
        }}
      />

      <Divider sx={{ my: 2 }} />

      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography sx={{ fontWeight: 600, mb: 1 }}>Voucher:</Typography>
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

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Chọn phương thức thanh toán
      </Typography>
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
        onClick={async () => {
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

          // Lấy danh sách barcode từ scannedBarcodes
          const barcodes = (scannedBarcodes[cartId] || []).map(
            (entry) => entry.barcode
          );

          if (barcodes.length === 0) {
            showMessage("Danh sách barcode không được để trống", "error");
            return;
          }

          // Chuẩn bị payload cho API createOrder
          const payload = {
            cartId,
            userId: currentCart.customer?.id || "",
            voucherId: currentCart.voucher?.id || null,
            paymentMethod:
              currentCart.paymentMethod === "CASH" ? "COD" : "BankTransfer",
            customerPaid: currentCart.customerPaid,
            storeId: storeId || undefined,
            shippingAddressId:
              currentCart.deliveryAddress?.id ||
              "00000000-0000-0000-0000-000000000000",
            barcodes,
          };

          try {
            const res = await orderApi.createOrder(payload);
            if (res && res.success) {
              showMessage("Tạo hóa đơn thành công", "success");
              if (res.paymentUrl) window.open(res.paymentUrl, "_blank");
              if (typeof onOrderCreated === "function")
                onOrderCreated(cartId, res.orderId);
            } else {
              showMessage(res?.message || "Tạo hóa đơn thất bại", "error");
            }
          } catch (err: any) {
            console.error("Error creating order:", err);
            showMessage(
              err?.response?.data?.message || "Lỗi khi gọi tạo hóa đơn",
              "error"
            );
          }
        }}
      >
        Xác nhận thanh toán
      </Button>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>Thêm khách hàng</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Button variant="outlined" onClick={handleGuestCustomer}>
              Khách vãng lai
            </Button>

            <Button
              variant="outlined"
              onClick={() => setOpenCreateUserModal(true)}
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

      <CreateUserModal
        isOpen={openCreateUserModal}
        onClose={() => setOpenCreateUserModal(false)}
        onSuccess={async (newUser) => {
          setCartState({ customer: newUser });
          setOpenDialog(false);
          showMessage("Tạo khách hàng thành công", "success");
          try {
            setPhoneInput(newUser.phoneNumber);
            const res = await userApi.getUserByPhone(newUser.phoneNumber);
            setCartState({ customer: res.data });
          } catch (err: unknown) {
            console.error("Error fetching user after creation:", err);
            showMessage("Lỗi khi lấy thông tin khách hàng mới", "error");
          }
        }}
      />

      <Dialog
        open={openVoucherDialog}
        onClose={() => setOpenVoucherDialog(false)}
        fullWidth
      >
        <DialogTitle>Chọn voucher</DialogTitle>
        <DialogContent>
          {vouchers.length > 0 ? (
            vouchers.map((v) => {
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
                      ? `Giảm ${v.discountAmount}%${
                          v.maxDiscountPrice
                            ? ` (tối đa ${v.maxDiscountPrice.toLocaleString()} đ)`
                            : ""
                        }`
                      : `Giảm ${v.discountAmount.toLocaleString()} đ`}
                  </Typography>
                  <Typography>
                    Đơn tối thiểu:{" "}
                    {v.minOrderPrice ? v.minOrderPrice.toLocaleString() : 0} đ
                  </Typography>
                  {v.endDate && (
                    <Typography>
                      HSD: {new Date(v.endDate).toLocaleDateString("vi-VN")}
                    </Typography>
                  )}
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
