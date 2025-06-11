import { Box, Typography, Button } from "@mui/material";
import { useState } from "react";
import { fakeVouchers } from "../../fakeData/fakeVoucherData";
import GiftIcon from "../../assets/icons/GiftIcon";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToastify } from "../../hooks/useToastify";
import VoucherCard from "../../components/VoucherCard";
import type { Voucher } from "../../types/models";

const ITEMS_PER_PAGE = 3;

const VoucherSection = () => {
  const { user } = useAuth();
  const toast = useToastify();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const vouchers = fakeVouchers;
  const totalPages = Math.ceil(vouchers.length / ITEMS_PER_PAGE);
  const pagedVouchers = vouchers.slice(currentPage * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE);

  const handleGetVoucher = (voucher: Voucher) => {
    if (user) {
      console.log(voucher);
      toast.success("Cùng mua sắm với voucher vừa nhận được nhé!");
    } else {
      toast.error("Vui lòng đăng nhập để lưu voucher");
      navigate("/login");
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "white",
        width: "80%",
        mx: "auto",
        borderRadius: "24px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
      }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 2 }}>
        <Typography
          variant="h5"
          sx={{
            marginLeft: 5,
            display: "flex",
            gap: 1,
            fontWeight: 600,
            color: "#2c3e50",
            letterSpacing: "0.5px",
            alignItems: "center",
          }}>
          <GiftIcon /> TẶNG BẠN <span style={{ color: "red", fontSize: "12px" }}>Chỉ áp dụng cho đơn hàng cùng cửa hàng</span>
        </Typography>
        <Box sx={{ display: "flex", gap: 1, marginRight: 3 }}>
          <Button variant="outlined" size="small" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))} disabled={currentPage === 0}>
            Trước
          </Button>
          <Button variant="outlined" size="small" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))} disabled={currentPage === totalPages - 1}>
            Sau
          </Button>
        </Box>
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center", padding: 4 }}>
        {pagedVouchers.map((voucher, index) => (
          <VoucherCard key={voucher.id || index} voucher={voucher} onGetVoucher={handleGetVoucher} />
        ))}
      </Box>
    </Box>
  );
};

export default VoucherSection;
