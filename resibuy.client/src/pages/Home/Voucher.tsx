import { Box, Typography, Button } from "@mui/material";
import { useState } from "react";
import { fakeVouchers } from "../../fakeData/fakeVoucherData";
import logo from "../../assets/Images/Logo.png";
import { formatDate } from "../../utils/dateUtils";
import GiftIcon from "../../assets/icons/GiftIcon";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToastify } from "../../hooks/useToastify";

const ITEMS_PER_PAGE = 3;

const Voucher = () => {
  const { user } = useAuth();
  const toast = useToastify();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const vouchers = fakeVouchers;
  const totalPages = Math.ceil(vouchers.length / ITEMS_PER_PAGE);
  const pagedVouchers = vouchers.slice(currentPage * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE);
  const handleGetVoucher = (voucherId: string) => {
    if (user) {
      console.log(voucherId);
      toast.success("Bạn đã lưu voucher này");
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
        <Typography variant="h5" sx={{ marginLeft: 5, display: "flex", gap: 1, fontWeight: 600, color: "#2c3e50", letterSpacing: "0.5px" }}>
          <GiftIcon /> TẶNG BẠN
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
          <Box
            key={voucher.id || index}
            sx={{
              width: "450px",
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
                    {voucher.type === "Discount" ? "đ" : "%"} tối đa {voucher.maxDiscountPrice}đ
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
                    width: "70px",
                    height: "30px",
                  }}
                  onClick={() => {
                    handleGetVoucher(voucher.id);
                  }}>
                  Lưu
                </Button>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Voucher;
