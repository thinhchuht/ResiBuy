import { Box, Typography, Button, Divider } from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import type { Voucher } from "../../types/models";

interface CheckoutVoucherSectionProps {
  selectedVoucher?: Voucher;
  onOpenVoucherModal: () => void;
}

const CheckoutVoucherSection = ({ selectedVoucher, onOpenVoucherModal }: CheckoutVoucherSectionProps) => (
  <>
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 4, mb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <LocalOfferIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#555" }}>
          Voucher của Shop
        </Typography>
      </Box>
      <Button variant="text" sx={{ textTransform: "none", color: "#1976d2", "&:hover": { color: "red" } }} onClick={onOpenVoucherModal}>
        {selectedVoucher ? "Đổi Voucher" : "Chọn Voucher"}
      </Button>
    </Box>
    {selectedVoucher && (
      <Box sx={{ mb: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Đã chọn: Giảm {selectedVoucher.discountAmount}
          {selectedVoucher.type === "Discount" ? "đ " : "% "}
          tối đa {selectedVoucher.maxDiscountPrice}đ
        </Typography>
      </Box>
    )}
    <Divider sx={{ mb: 2 }} />
  </>
);

export default CheckoutVoucherSection;
