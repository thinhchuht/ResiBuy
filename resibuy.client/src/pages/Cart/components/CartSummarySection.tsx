import { Box, Typography, Button, Divider, Paper } from "@mui/material";
import type { CartItem } from "../../../types/models";

interface CartSummaryProps {
  selectedItems: CartItem[];
  onCheckout: () => void;
}

const CartSummarySection = ({ selectedItems, onCheckout }: CartSummaryProps) => {
  const calculateSubtotal = (): string => {
    let subtotal = 0;
    selectedItems.forEach((item) => {
      subtotal += item.product[0].price * item.quantity;
    });
    return subtotal.toFixed(2);
  };

  const calculateItemTotal = (item: CartItem): string => {
    return (item.product[0].price * item.quantity).toFixed(2);
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
        maxHeight: "calc(100vh - 100px)",
        overflowY: "auto",
      }}
    >
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "#2c3e50" }}>
        Tóm tắt đơn hàng
      </Typography>

      {selectedItems.length > 0 ? (
        <>
          <Box sx={{ mb: 3 }}>
            {selectedItems.map((item) => {
              const product = item.product[0];
              return (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">
                    {product.name} x {item.quantity}
                  </Typography>
                  <Typography variant="body2">
                    ${calculateItemTotal(item)}
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
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Tạm tính
            </Typography>
            <Typography variant="h5" color="primary.main">
              ${calculateSubtotal()} USD
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            size="large"
            sx={{ bgcolor: "#FF6B6B", "&:hover": { bgcolor: "#ff5252" } }}
            onClick={onCheckout}
          >
            THANH TOÁN
          </Button>
        </>
      ) : (
        <Typography variant="body1" color="text.secondary" textAlign="center">
          Vui lòng chọn sản phẩm để tiếp tục thanh toán
        </Typography>
      )}
    </Paper>
  );
};

export default CartSummarySection; 