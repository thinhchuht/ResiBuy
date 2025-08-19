import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import GiftIcon from "../../assets/icons/GiftIcon";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToastify } from "../../hooks/useToastify";
import VoucherCard from "../../components/VoucherCard";
import type { Voucher } from "../../types/models";
import voucherApi from "../../api/voucher.api";

const ITEMS_PER_PAGE = 3;

const VoucherSection = () => {
  const { user } = useAuth();
  const toast = useToastify();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    voucherApi.getAll({ pageNumber: currentPage + 1, pageSize: ITEMS_PER_PAGE, isActive: true, isGettingNow: true })
      .then(res => {
        setVouchers(res.data.items || []);
        setTotalPages(Math.ceil((res.data.totalCount || 1) / ITEMS_PER_PAGE));
      })
      .finally(() => setLoading(false));
  }, [currentPage]);

  const pagedVouchers = vouchers;

  const handleGetVoucher = (voucher: Voucher) => {
    if (user) {
      navigate("/products?storeId=" + voucher.storeId);
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
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: 120 }}>
            <CircularProgress color="error" sx={{ mb: 2 }} />
            <Typography variant="body2" sx={{ color: '#888' }}>Đang tải mã giảm giá...</Typography>
          </Box>
        ) : pagedVouchers.length === 0 ? (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            minHeight: 180,
            color: '#888',
            bgcolor: '#f9f9fb',
            borderRadius: 3,
            boxShadow: '0 2px 8px rgba(235,92,96,0.04)',
            p: 4,
            transition: 'background 0.3s',
          }}>
            <GiftIcon style={{ fontSize: 48, color: '#FF6B6B', marginBottom: 12, opacity: 0.7 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#FF6B6B' }}>
              Hiện tại chưa có mã giảm giá được phát ra
            </Typography>
            <Typography variant="body2" sx={{ color: '#888', textAlign: 'center', maxWidth: 320 }}>
              Hãy quay lại sau hoặc theo dõi các chương trình khuyến mãi để nhận mã giảm giá mới nhé!
            </Typography>
          </Box>
        ) : (
          pagedVouchers.map((voucher, index) => (
            <VoucherCard key={voucher.id || index} voucher={voucher} onGetVoucher={handleGetVoucher} />
          ))
        )}
      </Box>
    </Box>
  );
};

export default VoucherSection;
