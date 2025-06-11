import { Box, Typography, Paper, Button, Divider } from "@mui/material";
import type { PaperProps as MuiPaperProps } from "@mui/material";

interface OrderSummary {
  totalBeforeDiscount: number;
  totalAfterDiscount: number;
  discount: number;
  itemCount: number;
  note?: string;
}

interface CheckoutSummarySectionProps {
  orders: OrderSummary[];
  grandTotal: number;
  PaperProps?: MuiPaperProps;
  onCheckout?: () => void;
}

const formatPrice = (price: number) => (
  <Box component="span" sx={{ display: "inline-flex", alignItems: "baseline" }}>
    {price.toLocaleString()}
    <Box component="span" sx={{ fontSize: "0.7em", ml: 0.5 }}>
      đ
    </Box>
  </Box>
);

const CheckoutSummarySection = ({ orders, grandTotal, onCheckout }: CheckoutSummarySectionProps) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 4,
      border: "1px solid #eee",
      position: "sticky",
      top: 80,
      height: "auto",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      alignSelf: "flex-start",
      transition: "all 0.3s ease-in-out",
      overflow: "hidden",
      bgcolor: "#ffffff",
    }}>
    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2c3e50", mb: 2 }}>
      Tóm tắt đơn hàng
    </Typography>
    <Divider sx={{ mb: 2 }} />
    {orders.map((order, index) => (
      <Box key={index} sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: "#fafbfc" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1976d2" }}>
          Đơn hàng {index + 1}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Typography variant="body2">Tổng sản phẩm:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {order.itemCount}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2">Tổng tiền trước giảm:</Typography>
          <Typography variant="body2">{formatPrice(order.totalBeforeDiscount)}</Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2">Đã giảm:</Typography>
          <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
            -{formatPrice(order.discount)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Cần thanh toán:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "red" }}>
            {formatPrice(order.totalAfterDiscount)}
          </Typography>
        </Box>
        {order.note && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1976d2", mb: 1 }}>
                Lời nhắn:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-wrap",
                  color: "#666",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  wordBreak: "break-word",
                  lineHeight: 1.4,
                }}>
                {order.note}
              </Typography>
            </Box>
          </>
        )}
      </Box>
    ))}
    <Divider sx={{ my: 2 }} />
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
        Tổng cộng:
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: "bold", color: "red" }}>
        {formatPrice(grandTotal)}
      </Typography>
    </Box>
    <Button
      variant="contained"
      color="primary"
      fullWidth
      sx={{
        py: 1.5,
        fontSize: "1.1rem",
        borderRadius: 10,
        backgroundColor: "#FF6B6B",
        "&:hover": {
          backgroundColor: "#FF5C5C",
        },
      }}
      onClick={onCheckout}>
      Tiếp tục Thanh toán
    </Button>
  </Paper>
);

export default CheckoutSummarySection;
