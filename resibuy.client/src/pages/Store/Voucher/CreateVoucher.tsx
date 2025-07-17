import {
  Box,
  TextField,
  Typography,
  MenuItem,
  Button,
  Stack,
  Card,
  CardContent,
  CardHeader,
} from "@mui/material";
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../../api/base.api";

type VoucherType = "Amount" | "Percentage";

const VoucherCreatePage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

  const [type, setType] = useState<VoucherType>("Amount");
  const [discountAmount, setDiscountAmount] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minOrderPrice, setMinOrderPrice] = useState("");
  const [maxDiscountPrice, setMaxDiscountPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleCreate = async () => {
    if (!storeId) {
      alert("Không tìm thấy storeId");
      return;
    }

    try {
      const payload = {
        storeId,
        type,
        discountAmount: parseFloat(discountAmount),
        quantity: parseInt(quantity),
        minOrderPrice: parseFloat(minOrderPrice),
        maxDiscountPrice: parseFloat(maxDiscountPrice),
        startDate,
        endDate,
      };

      await axios.post("/api/Voucher", payload);
      alert("Tạo voucher thành công");
      navigate(`/store/${storeId}/vouchers`);
    } catch (error) {
      console.error("Lỗi khi tạo voucher:", error);
      alert("Tạo voucher thất bại");
    }
  };

  return (
    <Box p={4}>
      <Card>
        <CardHeader
          title={<Typography variant="h5">Tạo mới Voucher</Typography>}
        />
        <CardContent>
          <Stack spacing={2}>
            <TextField
              select
              label="Loại voucher"
              value={type}
              onChange={(e) => setType(e.target.value as VoucherType)}
            >
              <MenuItem value="Amount">Giảm theo số tiền</MenuItem>
              <MenuItem value="Percentage">Giảm theo phần trăm</MenuItem>
            </TextField>

            <TextField
              label={
                type === "Amount" ? "Số tiền giảm (₫)" : "Phần trăm giảm (%)"
              }
              type="number"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              fullWidth
            />

            <TextField
              label="Số lượng voucher"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              fullWidth
            />

            <TextField
              label="Giá trị đơn hàng tối thiểu (₫)"
              type="number"
              value={minOrderPrice}
              onChange={(e) => setMinOrderPrice(e.target.value)}
              fullWidth
            />

            <TextField
              label="Mức giảm tối đa (₫)"
              type="number"
              value={maxDiscountPrice}
              onChange={(e) => setMaxDiscountPrice(e.target.value)}
              fullWidth
            />

            <TextField
              label="Ngày bắt đầu"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Ngày kết thúc"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <Button variant="contained" onClick={handleCreate}>
              Tạo voucher
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VoucherCreatePage;
