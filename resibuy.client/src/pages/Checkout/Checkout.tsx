import React, { useState } from "react";
import { Box, Typography, Container, Paper, Divider } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useLocation, useNavigate } from "react-router-dom";
import type { CartItem, Voucher } from "../../types/models";
import { VoucherType } from "../../types/models";
import VoucherSelectionModal from "../../components/VoucherSelectionModal";
import { useAuth } from "../../contexts/AuthContext";
import { fakeVouchers } from "../../fakeData/fakeVoucherData";
import ProductTableSection from "./ProductTableSection";
import CheckoutVoucherSection from "./CheckoutVoucherSection";
import NoteSection from "./NoteSection";
import CheckoutSummarySection from "./CheckoutSummarySection";
import NotFound from "../../components/NotFound";
import { useToastify } from "../../hooks/useToastify";
import { formatPrice } from "../../utils/priceUtils";
import vnPayApi from "../../api/vnpay.api";
import checkoutApi from "../../api/checkout.api";

interface GroupedItems {
  storeId: string;
  items: CartItem[];
}

interface info {
  deliveryType: "my-room" | "other";
  selectedRoom: string;
  selectedArea: string;
  selectedBuilding: string;
  selectedOtherRoom: string;
  paymentMethod: string;
}

export interface checkoutItems {
  cartId: string;
  storeId: string;
  note: string;
  productDetailId: string;
  quantity: number;
}

const Checkout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToastify();
  const { selectedItems } = (location.state as {
    selectedItems: CartItem[];
  }) || { selectedItems: [] };
  const [openVoucherModal, setOpenVoucherModal] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [selectedVouchers, setSelectedVouchers] = useState<
    Record<string, Voucher>
  >({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleNoteSubmit = (storeId: string, note: string) => {
    setNotes((prev) => ({
      ...prev,
      [storeId]: note,
    }));
  };

  if (!selectedItems || selectedItems.length === 0) {
    return <NotFound />;
  }

  const groupedItems = selectedItems.reduce((groups: GroupedItems[], item) => {
    const storeId = item.productDetail.product.storeId;
    const existingGroup = groups.find((group) => group.storeId === storeId);

    if (existingGroup) {
      existingGroup.items.push(item);
    } else {
      groups.push({
        storeId,
        items: [item],
      });
    }

    return groups;
  }, []);

  const calculateStoreTotal = (items: CartItem[], storeId: string) => {
    const subtotal = items.reduce(
      (total, item) => total + item.productDetail.price * item.quantity,
      0
    );
    const selectedVoucher = selectedVouchers[storeId];

    if (selectedVoucher) {
      let discountAmount = 0;
      if (selectedVoucher.type === VoucherType.Amount) {
        discountAmount = selectedVoucher.discountAmount;
      } else if (selectedVoucher.type === VoucherType.Percentage) {
        discountAmount = (subtotal * selectedVoucher.discountAmount) / 100;
      }
      discountAmount = Math.min(
        discountAmount,
        selectedVoucher.maxDiscountPrice
      );
      return Math.max(subtotal - discountAmount, 0);
    }
    return subtotal;
  };

  const handleOpenVoucherModal = (storeId: string) => {
    setSelectedStoreId(storeId);
    setOpenVoucherModal(true);
  };

  const handleCloseVoucherModal = () => {
    setOpenVoucherModal(false);
    setSelectedStoreId(null);
  };

  const handleSelectVoucher = (voucher: Voucher) => {
    if (selectedStoreId) {
      setSelectedVouchers((prev) => ({
        ...prev,
        [selectedStoreId]: voucher,
      }));
      handleCloseVoucherModal();
    }
  };

  const orders = groupedItems.map((group) => {
    const subtotal = group.items.reduce(
      (total, item) => total + item.productDetail.price * item.quantity,
      0
    );
    const selectedVoucher = selectedVouchers[group.storeId];
    let discount = 0;
    if (selectedVoucher) {
      if (selectedVoucher.type === VoucherType.Amount) {
        discount = selectedVoucher.discountAmount;
      } else if (selectedVoucher.type === VoucherType.Percentage) {
        discount = (subtotal * selectedVoucher.discountAmount) / 100;
      }
      discount = Math.min(discount, selectedVoucher.maxDiscountPrice);
    }
    const totalAfterDiscount = Math.max(subtotal - discount, 0);
    const itemCount = group.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
    const storeId = group.storeId
    return {
      totalBeforeDiscount: subtotal,
      totalAfterDiscount,
      discount,
      itemCount,
      storeId,
      note: notes[group.storeId],
    };
  });
  const grandTotal = orders.reduce(
    (sum, order) => (sum + order.totalAfterDiscount),
    0
  );

  const handleCheckout = async (info: info) => {
    if (user) {
      try {
        setIsLoading(true);
        const allOrders = orders.map((order, idx) => ({
          voucherId: selectedVouchers[groupedItems[idx].storeId]?.id ?? null,
          storeId : order.storeId,
          totalPrice: order.totalAfterDiscount,
          items: groupedItems[idx].items.map((item) => ({
            quantity: item.quantity,
            price: item.productDetail.price,
            productDetailId: item.productDetail.id,
          })),

          note: notes[groupedItems[idx].storeId],
        }));

        console.log("Checkout data:", {
          userId: user?.id,
          roomId:
          info.deliveryType === "my-room"
            ? info.selectedRoom
            : info.selectedOtherRoom,
          grandTotal: Math.round(grandTotal),
          orders: allOrders,
        });
        const checkoutData = {
          userId: user?.id,
          addressId : info.deliveryType === "my-room"
          ? info.selectedRoom
          : info.selectedOtherRoom,
          grandTotal: Math.round(grandTotal),
          paymentMethod: info.paymentMethod,
          orders : allOrders
        }
        if (info.paymentMethod === "BankTransfer") {
          const response = await vnPayApi.getPaymentUrl(checkoutData);

          if (response.success) {
            window.history.replaceState({}, "");
            window.location.href = response.data.paymentUrl;
          } else {
            console.error("Payment creation failed:", response.error);
          }
        } else if (info.paymentMethod === "COD") {
          await checkoutApi.checkout(checkoutData)
          window.history.replaceState({}, "");
          navigate("/checkout-success", {
            state: { isOrderSuccess: true },
          });
        }
      } catch (error) {
        console.error("Checkout error:", error);
        toast.error("Có lỗi xảy ra, vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const userRooms = user?.rooms?.map((r) => ({
    roomId: r.id,
    roomName: r.name,
    buildingName: r.buildingName,
    areaName: r.areaName,
  }));

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#333" }}
      >
        Thanh toán đơn hàng
      </Typography>
      <Box sx={{ display: "flex", gap: 4 }}>
        <Box sx={{ flex: 1 }}>
          {groupedItems.map((group, index) => (
            <Paper
              key={group.storeId}
              elevation={3}
              sx={{ p: 3, borderRadius: 2, mb: 4 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ShoppingCartIcon color="primary" sx={{ mr: 1 }} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "#555" }}
                >
                  Đơn hàng {index + 1}
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <ProductTableSection
                items={group.items}
                formatPrice={formatPrice}
              />
              <CheckoutVoucherSection
                selectedVoucher={selectedVouchers[group.storeId]}
                onOpenVoucherModal={() => handleOpenVoucherModal(group.storeId)}
              />
              <NoteSection
                onNoteSubmit={(note) => handleNoteSubmit(group.storeId, note)}
              />
              <Divider sx={{ my: 3 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "#555" }}
                >
                  Tổng tiền đơn hàng:
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", color: "red" }}
                >
                  {formatPrice(calculateStoreTotal(group.items, group.storeId))}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
        <Box sx={{ width: 400, flexShrink: 0 }}>
          <CheckoutSummarySection
            orders={orders}
            grandTotal={Math.round(grandTotal)}
            onCheckout={handleCheckout}
            userRooms={userRooms}
            isLoading={isLoading}
          />
        </Box>
      </Box>
      <VoucherSelectionModal
        open={openVoucherModal}
        onClose={handleCloseVoucherModal}
        userVouchers={fakeVouchers.filter((v) =>
          v.userVouchers.some((uv) => uv.userId === user?.id)
        )}
        shopVouchers={fakeVouchers.filter((v) => v.storeId === selectedStoreId)}
        onSelectVoucher={handleSelectVoucher}
        selectedVoucherId={
          selectedStoreId ? selectedVouchers[selectedStoreId]?.id : undefined
        }
      />
    </Container>
  );
};

export default Checkout;
