import { useEffect, useState } from "react";
import axios from "../../../api/base.api";
import {
  Box,
  TextField,
  Typography,
  MenuItem,
  Button,
  Card,
  CardContent,
  Stack,
  CardHeader,
  Skeleton,
} from "@mui/material";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";

type VoucherType = "Amount" | "Percentage";

interface Voucher {
  id: string;
  discountAmount: number;
  type: VoucherType;
  quantity: number;
  minOrderPrice: number;
  maxDiscountPrice: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface VoucherQueryParams {
  storeId: string;
  pageNumber: number;
  pageSize: number;
  Type?: "Amount" | "Percentage";
  MinOrderPrice?: number | string;
  StartDate?: string;
  EndDate?: string;
  IsActive?: boolean;
  UserId?: string;
}

const VoucherPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [voucherType, setVoucherType] = useState("");
  const [minOrderPrice, setMinOrderPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const fetchVouchers = async () => {
    try {
      if (!storeId) {
        console.error("storeId is undefined");
        return;
      }

      const params: VoucherQueryParams = {
        storeId,
        pageNumber: 1,
        pageSize: 20,
      };

      if (voucherType) {
        params.Type = voucherType as "Amount" | "Percentage";
      }
      if (minOrderPrice) {
        params.MinOrderPrice = minOrderPrice;
      }
      if (startDate) {
        params.StartDate = new Date(startDate).toISOString(); // đảm bảo định dạng ISO
      }
      if (endDate) {
        params.EndDate = new Date(endDate).toISOString();
      }

      setLoading(true);
      const response = await axios.get("/api/Voucher", { params });
      setVouchers(response.data.items || []);
    } catch (error) {
      console.error("Failed to fetch vouchers", error);
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = () => {
    navigate(`/store/${storeId}/voucher-create`);
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  return (
    <Box p={4}>
      <Card>
        <CardHeader
          title={<Typography variant="h5">Quản lý sản phẩm</Typography>}
          action={
            <Button variant="contained" color="primary" onClick={handleCreate}>
              Thêm voucher
            </Button>
          }
        />
        <CardContent>
          {/* Bộ lọc */}
          <Stack spacing={2} direction="row" flexWrap="wrap" mb={3}>
            <TextField
              label="Loại voucher"
              select
              value={voucherType}
              onChange={(e) => setVoucherType(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="Amount">Giảm số tiền</MenuItem>
              <MenuItem value="Percentage">Giảm phần trăm</MenuItem>
            </TextField>

            <TextField
              label="Giá trị đơn tối thiểu"
              type="number"
              value={minOrderPrice}
              onChange={(e) => setMinOrderPrice(e.target.value)}
            />

            <TextField
              label="Từ ngày"
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <TextField
              label="Đến ngày"
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            <Button variant="contained" onClick={fetchVouchers}>
              Lọc
            </Button>
          </Stack>
        </CardContent>
      </Card>
      {/* Danh sách voucher */}
      <Stack spacing={2}>
        {loading
          ? // Hiển thị 3 thẻ loading giả
            [...Array(3)].map((_, i) => (
              <Card key={i} variant="outlined">
                <CardContent>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="50%" />
                </CardContent>
              </Card>
            ))
          : vouchers.map((voucher) => (
              <Card key={voucher.id} variant="outlined">
                <CardContent>
                  <Typography variant="h6">
                    🎟️{" "}
                    {voucher.type === "Amount"
                      ? "Giảm " + voucher.discountAmount + "₫"
                      : `Giảm ${voucher.discountAmount}%`}
                  </Typography>
                  <Typography variant="body2">
                    Tổng số lượng: {voucher.quantity} |
                    <strong> Còn lại: {voucher.quantity}</strong> | Tối thiểu:{" "}
                    {voucher.minOrderPrice}₫ | Giảm tối đa:{" "}
                    {voucher.maxDiscountPrice}₫
                  </Typography>
                  <Typography variant="body2">
                    Hiệu lực: {voucher.startDate} → {voucher.endDate} |{" "}
                    {voucher.isActive ? "🟢 Đang hoạt động" : "🔴 Ngưng"}
                  </Typography>
                </CardContent>
              </Card>
            ))}
      </Stack>
    </Box>
  );
};

export default VoucherPage;
