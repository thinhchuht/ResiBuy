import React, { useState, useEffect } from "react";
import { Box, Typography, Container, Paper, Divider } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useLocation, useNavigate } from "react-router-dom";
import type { TempCheckoutDto, Voucher, UpdateTempOrderDto, PaymentMethod } from "../../types/models";
import VoucherSelectionModal from "../../components/VoucherSelectionModal";
import { useAuth } from "../../contexts/AuthContext";
import ProductTableSection from "./ProductTableSection";
import CheckoutVoucherSection from "./CheckoutVoucherSection";
import NoteSection from "./NoteSection";
import CheckoutSummarySection from "./CheckoutSummarySection";
import NotFound from "../../components/NotFound";
import { formatPrice } from "../../utils/priceUtils";
import checkoutApi from "../../api/checkout.api";
import voucherApi from "../../api/voucher.api";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import vnPayApi from "../../api/vnpay.api";

const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const tempCheckoutId = (location.state as { tempCheckoutId?: string })?.tempCheckoutId;
  const [tempOrderData, setTempOrderData] = useState<TempCheckoutDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [openVoucherModal, setOpenVoucherModal] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [selectedVouchers, setSelectedVouchers] = useState<Record<string, Voucher>>({});
  const [userVouchers, setUserVouchers] = useState<Voucher[]>([]);
  const [shopVouchers, setShopVouchers] = useState<Voucher[]>([]);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (user && tempCheckoutId) {
      setLoading(true);
      checkoutApi
        .getTempOrder(user.id, tempCheckoutId)
        .then((res) => setTempOrderData(res.data))
        .catch(() => setTempOrderData(null))
        .finally(() => setLoading(false));
    }
  }, [user, tempCheckoutId]);

  if (!tempCheckoutId) {
    return <NotFound />;
  }
  if (loading) {
    return <div>Đang tải đơn hàng...</div>;
  }
  if (!tempOrderData) {
    return <NotFound />;
  }

  const { orders = [], grandTotal } = tempOrderData;

  const handleOpenVoucherModal = async (storeId: string) => {
    setSelectedStoreId(storeId);
    setVoucherLoading(true);
    try {
      const order = orders.find((o) => o.storeId === storeId);
      const subtotal = order ? order.totalPrice : 0;
      const userRes = await voucherApi.getAll({ userId: user?.id, isActive: true, minOrderPrice: subtotal });
      setUserVouchers(userRes.data.items || []);
      const shopRes = await voucherApi.getAll({ storeId, isActive: true, minOrderPrice: subtotal });
      setShopVouchers(shopRes.data.items || []);
    } catch {
      setUserVouchers([]);
      setShopVouchers([]);
    } finally {
      setVoucherLoading(false);
      setOpenVoucherModal(true);
    }
  };

  const handleCloseVoucherModal = () => {
    setOpenVoucherModal(false);
    setSelectedStoreId(null);
  };

  const handleUpdateTempOrder = async (fields: Partial<{ orderId: string; voucherId: string; note: string; paymentMethod: string; addressId: string }>) => {
    if (!tempOrderData || !user) return false;
    const paymentMethod = (fields.paymentMethod as PaymentMethod) || tempOrderData.paymentMethod;
    const addressId = fields.addressId || tempOrderData.addressId;
    const updateDto: UpdateTempOrderDto = {
      id: tempOrderData.id,
      orders: tempOrderData.orders.map((order) => ({
        id: order.id,
        voucherId: fields.voucherId && fields.orderId === order.id ? fields.voucherId : order.voucherId,
        note: fields.note && fields.orderId === order.id ? fields.note : order.note || "",
      })),
      paymentMethod,
      addressId,
    };
    try {
      console.log("updateDto");
      const updated = await checkoutApi.updateTempOrder(user.id, updateDto);
      setTempOrderData(updated.data || updated);
      return true;
    } catch {
      // handle error if needed
      return false;
    }
  };

  const handleSelectVoucher = async (voucher: Voucher) => {
    if (selectedStoreId && tempOrderData && user) {
      const order = tempOrderData.orders.find((o) => o.storeId === selectedStoreId);
      if (!order) return;
      await handleUpdateTempOrder({ orderId: order.id, voucherId: voucher.id });
      setSelectedVouchers((prev) => ({ ...prev, [selectedStoreId]: voucher }));
      handleCloseVoucherModal();
    }
  };

  const handleNoteSubmit = async (orderId: string, note: string) => {
    await handleUpdateTempOrder({ orderId, note });
  };

  const handleSummaryUpdate = async (info: { paymentMethod: string; selectedRoom?: string; selectedOtherRoom?: string }) => {
    const addressId = info.selectedRoom || info.selectedOtherRoom;
    const updateResult = await handleUpdateTempOrder({ paymentMethod: info.paymentMethod, addressId });
    if (updateResult) {
      setOpenConfirmModal(true);
    }
  };

  const handleConfirmCheckout = async () => {
    if (!user || !tempOrderData) return;
    setCheckoutLoading(true);
    if (tempOrderData.paymentMethod === "BankTransfer") {
      const response = await vnPayApi.getPaymentUrl(user.id, tempOrderData.id);
      if (response.success) {
        window.history.replaceState({}, "");
        window.location.href = response.data.paymentUrl;
      } else {
        console.error("Payment creation failed:", response.error);
      }
    } else if (tempOrderData.paymentMethod === "COD") {
      await checkoutApi.checkoutUser(user.id, tempOrderData.id);
      window.history.replaceState({}, "");
      navigate("/checkout-success", {
        state: { isOrderSuccess: true },
      });
    }
    setCheckoutLoading(false);
    setOpenConfirmModal(false);
  };

  const userRooms = user?.rooms?.map((r) => ({
    roomId: r.id,
    roomName: r.name,
    buildingName: r.buildingName,
    areaName: r.areaName,
  }));

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold", color: "#333" }}>
        Thanh toán đơn hàng
      </Typography>
      <Box sx={{ display: "flex", gap: 4 }}>
        <Box sx={{ flex: 1 }}>
          {orders.map((order, index) => {
            // Lấy voucher đã trả về từ backend cho order này
            const selectedVoucher = order.voucher || undefined;
            return (
              <Paper key={order.id} elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <ShoppingCartIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#555" }}>
                    Đơn hàng {index + 1}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <ProductTableSection items={order.productDetails} formatPrice={formatPrice} />
                {order.voucher && (
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1, mb: 2 }}>
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 600, mr: 1 }}>
                      Voucher:
                    </Typography>
                    <Typography variant="body2" color="primary">
                      {order.voucher.type === "Percentage" ? `${order.voucher.discountAmount}%` : formatPrice(order.voucher.discountAmount)}
                    </Typography>
                  </Box>
                )}
                <CheckoutVoucherSection selectedVoucher={selectedVoucher} onOpenVoucherModal={() => handleOpenVoucherModal(order.storeId)} />
                <NoteSection orderId={order.id} onNoteSubmit={handleNoteSubmit} />
                <Divider sx={{ my: 3 }} />
                {/* Shipping Fee */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 2,
                    mb: 1,
                  }}>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: "#555" }}>
                    Phí vận chuyển:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: "#1976d2" }}>
                    {formatPrice(order.shippingFee ?? 0)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 2,
                  }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#555" }}>
                    Tổng tiền đơn hàng:
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: "bold", color: "red" }}>
                    {formatPrice(order.totalPrice)}
                  </Typography>
                </Box>
              </Paper>
            );
          })}
        </Box>
        <Box sx={{ width: 400, flexShrink: 0 }}>
          <CheckoutSummarySection orders={orders} grandTotal={Math.round(grandTotal)} onCheckout={handleSummaryUpdate} userRooms={userRooms} isLoading={false} />
        </Box>
      </Box>
      <VoucherSelectionModal
        open={openVoucherModal}
        onClose={handleCloseVoucherModal}
        userVouchers={userVouchers}
        shopVouchers={shopVouchers}
        loading={voucherLoading}
        onSelectVoucher={handleSelectVoucher}
        selectedVoucherId={selectedStoreId ? selectedVouchers[selectedStoreId]?.id : undefined}
      />
      <Dialog
        open={openConfirmModal}
        onClose={() => setOpenConfirmModal(false)}
        PaperProps={{
          sx: {
            borderRadius: 5,
            p: 2,
            minWidth: 360,
            boxShadow: 8,
            bgcolor: "#fff",
          },
        }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 2 }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: "#4caf50", mb: 1 }} />
          <DialogTitle sx={{ fontWeight: 700, textAlign: "center", fontSize: 22, color: "#222", p: 0, mb: 1 }}>Xác nhận thanh toán</DialogTitle>
          <DialogContent sx={{ p: 0, mb: 2 }}>
            <DialogContentText
              sx={{
                textAlign: "center",
                fontSize: 14,
                fontWeight: 600,
                color: "#ff9800",
                mb: 1,
                letterSpacing: 0.2,
              }}>
              Bạn có chắc chắn muốn tiến hành thanh toán đơn hàng này không?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", gap: 2, width: "100%" }}>
            <Button
              onClick={() => setOpenConfirmModal(false)}
              disabled={checkoutLoading}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1,
                fontWeight: 700,
                bgcolor: "#ffeaea",
                color: "#ff4d4f",
                boxShadow: "none",
                "&:hover": { bgcolor: "#ff4d4f", color: "#fff" },
              }}>
              Hủy
            </Button>
            <Button
              onClick={handleConfirmCheckout}
              color="primary"
              variant="contained"
              disabled={checkoutLoading}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1,
                fontWeight: 700,
                background: "linear-gradient(90deg, #ff9800 0%, #ff6b6b 100%)",
                color: "#fff",
                boxShadow: "0 2px 8px 0 rgba(255,107,107,0.10)",
                transition: "all 0.2s",
                "&:hover": {
                  background: "linear-gradient(90deg, #ff6b6b 0%, #ff9800 100%)",
                  color: "#fff",
                  boxShadow: "0 4px 16px 0 rgba(255,107,107,0.15)",
                },
              }}>
              {checkoutLoading ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
};

export default Checkout;
