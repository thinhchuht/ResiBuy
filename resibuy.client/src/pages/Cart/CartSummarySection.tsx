import { Box, Typography, Button, Divider, Paper } from "@mui/material";
import type { CartItem } from "../../types/models";
import { formatPrice } from "../../utils/priceUtils";

interface CartSummaryProps {
  selectedItems: CartItem[];
  onCheckout: () => void;
}

const CartSummarySection = ({ selectedItems, onCheckout }: CartSummaryProps) => {
  const calculateSubtotal = (): string => {
    let subtotal = 0;
    selectedItems.forEach((item) => {
      const discount = item.productDetail.product.discount || 0;
      const discountedPrice = item.productDetail.price * (1 - discount / 100);
      subtotal += discountedPrice * item.quantity;
    });
    return formatPrice(subtotal);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: "1px solid #eee",
        position: "sticky",
        width: "400px",
        top: 80,
        height: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: selectedItems.length > 0 ? "flex-start" : "center",
        alignSelf: "flex-start",
        transition: "all 0.3s ease-in-out",
        overflow: "hidden",
        bgcolor: "#ffffff",
      }}>
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: 600,
          color: "#2c3e50",
          transition: "all 0.3s ease-in-out",
        }}>
        Tóm tắt đơn hàng
      </Typography>

      <Box
        sx={{
          transition: "all 0.3s ease-in-out",
          overflow: "hidden",
        }}>
        {selectedItems.length > 0 && (
          <>
            <Box sx={{ mb: 3 }}>
              {selectedItems.map((item, index) => {
                const productDetail = item.productDetail;
                const product = productDetail.product;
                return (
                  <Box
                    key={item.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                      transition: "all 0.3s ease-in-out",
                      transform: "translateY(0)",
                      opacity: 1,
                      p: 1,
                      borderRadius: 1,
                      "&:hover": {
                        bgcolor: "rgba(0, 0, 0, 0.04)",
                      },
                    }}>
                    <Typography variant="body2">
                      {index + 1}. {product.name} x {item.quantity}
                      {Array.isArray(productDetail.additionalData) && productDetail.additionalData.length > 0 && (
                        <>
                          <br />
                          <span style={{ color: '#888', fontSize: 13 }}>
                            {productDetail.additionalData.map(ad => ad.value).join(", ")}
                          </span>
                        </>
                      )}
                    </Typography>
                    <Typography variant="body2" fontWeight={500} color="red">
                      {formatPrice((productDetail.price * (1 - (product.discount || 0) / 100)) * item.quantity)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                transition: "all 0.3s ease-in-out",
              }}>
              <Typography variant="h6" fontWeight="bold">
                Tạm tính
              </Typography>
              <Typography variant="h5" color="red" fontWeight={600}>
                {calculateSubtotal()}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              sx={{
                bgcolor: "#FF6B6B",
                "&:hover": { bgcolor: "#ff5252" },
                transition: "all 0.3s ease-in-out",
              }}
              onClick={onCheckout}>
              THANH TOÁN
            </Button>
          </>
        )}
      </Box>

      {selectedItems.length === 0 && (
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{
            transition: "all 0.3s ease-in-out",
            opacity: 1,
          }}>
          Vui lòng chọn sản phẩm để tiếp tục thanh toán
        </Typography>
      )}
    </Paper>
  );
};

export default CartSummarySection;
