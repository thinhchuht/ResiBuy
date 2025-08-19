import { Box, Typography, Button } from "@mui/material";
import logo from "../assets/Images/Logo.png";
import { formatDate } from "../utils/dateUtils";
import { VoucherType, type Voucher } from "../types/models";

interface VoucherCardProps {
  voucher: Voucher;
  onGetVoucher: (voucher: Voucher) => void;
}

const VoucherCard = ({ voucher, onGetVoucher }: VoucherCardProps) => {
  return (
    <Box
      sx={{
        width: "400px",
        height: "150px",
        borderRadius: "24px",
        border: "1px solid red",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 6px 24px rgba(0, 0, 0, 0.08)",
        },
        overflow: "hidden",
      }}>
      <Box sx={{ display: "flex", height: "100%" }}>
        <Box
          sx={{
            width: "25%",
            backgroundColor: "#ff4d2d",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 2,
          }}>
          <Box
            component="img"
            src={logo}
            alt="ResiBuy Logo"
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: "white",
              p: 1,
            }}
          />
        </Box>

        <Box
          sx={{
            width: "55%",
            display: "flex",
            flexDirection: "column",
            padding: "10px 16px",
          }}>
          <Box>
            <Typography
              variant="body2"
              sx={{
                backgroundColor: "#ff4d2d",
                color: "white",
                padding: "2px 8px",
                borderRadius: "4px",
                display: "inline-block",
              }}>
              ⚡ Số lượng có hạn
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8rem", fontStyle: "italic", fontWeight: "bold", marginTop: "5px" }}>
              {formatDate(voucher.startDate)} - {formatDate(voucher.endDate)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ color: "black", fontWeight: "bold", mb: 0.5 }}>
              Giảm {voucher.discountAmount}
              {voucher.type === VoucherType.Percentage ? `% tối đa ${voucher.maxDiscountPrice}đ` : "đ"} 
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Đơn tối thiểu {voucher.minOrderPrice}đ
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            width: "20%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 8px",
          }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#ff4d2d",
              "&:hover": {
                backgroundColor: "#e04225",
              },
              color: "white",
              fontWeight: "bold",
              width: "80px",
              height: "40px",
              fontSize: "12px",
            }}
            onClick={() => onGetVoucher(voucher)}>
            DÙNG
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default VoucherCard;
