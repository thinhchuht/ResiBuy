import {
  Box,
  TextField,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  CardHeader,
  ToggleButtonGroup,
  ToggleButton,
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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const todayStr = new Date().toISOString().split("T")[0];

  const validateField = (fieldName: string, value: string) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case "discountAmount":
        if (!value || isNaN(Number(value)) || Number(value) <= 0) {
          newErrors.discountAmount = "Giá trị giảm phải lớn hơn 0";
        } else if (type === "Amount" && Number(value) % 500 !== 0) {
          newErrors.discountAmount = "Số tiền giảm phải là bội số của 500";
        } else {
          delete newErrors.discountAmount;
        }
        break;

      case "quantity":
        if (!value || isNaN(Number(value)) || Number(value) <= 0) {
          newErrors.quantity = "Số lượng phải lớn hơn 0";
        } else {
          delete newErrors.quantity;
        }
        break;

      case "minOrderPrice":
        if (!value || isNaN(Number(value)) || Number(value) < 0) {
          newErrors.minOrderPrice = "Giá trị đơn hàng tối thiểu không hợp lệ";
        } else if (Number(value) % 500 !== 0) {
          newErrors.minOrderPrice =
            "Giá trị đơn hàng tối thiểu phải là bội số của 500";
        } else {
          delete newErrors.minOrderPrice;
        }
        break;

      case "maxDiscountPrice":
        if (type === "Amount") {
          if (!value || isNaN(Number(value)) || Number(value) < 0) {
            newErrors.maxDiscountPrice = "Mức giảm tối đa không hợp lệ";
          } else if (Number(value) % 500 !== 0) {
            newErrors.maxDiscountPrice =
              "Mức giảm tối đa phải là bội số của 500";
          } else {
            delete newErrors.maxDiscountPrice;
          }
        } else {
          delete newErrors.maxDiscountPrice;
        }
        break;

      case "startDate":
        if (!value) {
          newErrors.startDate = "Chọn ngày bắt đầu";
        } else if (value < todayStr) {
          newErrors.startDate = "Ngày bắt đầu phải từ hôm nay trở đi";
        } else {
          delete newErrors.startDate;
          // Re-validate endDate if it exists
          if (endDate && value > endDate) {
            newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
          } else if (endDate && value <= endDate) {
            delete newErrors.endDate;
          }
        }
        break;

      case "endDate":
        if (!value) {
          newErrors.endDate = "Chọn ngày kết thúc";
        } else if (value < startDate) {
          newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
        } else {
          delete newErrors.endDate;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const validateAll = () => {
    const newErrors: { [key: string]: string } = {};

    if (
      !discountAmount ||
      isNaN(Number(discountAmount)) ||
      Number(discountAmount) <= 0
    ) {
      newErrors.discountAmount = "Giá trị giảm phải lớn hơn 0";
    } else if (type === "Amount" && Number(discountAmount) % 500 !== 0) {
      newErrors.discountAmount = "Số tiền giảm phải là bội số của 500";
    }

    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      newErrors.quantity = "Số lượng phải lớn hơn 0";
    }

    if (
      !minOrderPrice ||
      isNaN(Number(minOrderPrice)) ||
      Number(minOrderPrice) < 0
    ) {
      newErrors.minOrderPrice = "Giá trị đơn hàng tối thiểu không hợp lệ";
    } else if (Number(minOrderPrice) % 500 !== 0) {
      newErrors.minOrderPrice =
        "Giá trị đơn hàng tối thiểu phải là bội số của 500";
    }

    if (type === "Amount") {
      if (
        !maxDiscountPrice ||
        isNaN(Number(maxDiscountPrice)) ||
        Number(maxDiscountPrice) < 0
      ) {
        newErrors.maxDiscountPrice = "Mức giảm tối đa không hợp lệ";
      } else if (Number(maxDiscountPrice) % 500 !== 0) {
        newErrors.maxDiscountPrice = "Mức giảm tối đa phải là bội số của 500";
      }
    }

    if (!startDate) {
      newErrors.startDate = "Chọn ngày bắt đầu";
    } else if (startDate < todayStr) {
      newErrors.startDate = "Ngày bắt đầu phải từ hôm nay trở đi";
    }

    if (!endDate) {
      newErrors.endDate = "Chọn ngày kết thúc";
    } else if (endDate < startDate) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!storeId) {
      alert("Không tìm thấy storeId");
      return;
    }

    if (!validateAll()) return;

    try {
      const payload = {
        storeId,
        type,
        discountAmount: parseFloat(discountAmount),
        quantity: parseInt(quantity),
        minOrderPrice: parseFloat(minOrderPrice),
        maxDiscountPrice: type === "Amount" ? parseFloat(maxDiscountPrice) : 0,
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

  const handleTypeChange = (e: any, newType: VoucherType | null) => {
    if (newType !== null) {
      setType(newType);
      // Clear maxDiscountPrice error when switching to Percentage
      if (newType === "Percentage") {
        const newErrors = { ...errors };
        delete newErrors.maxDiscountPrice;
        setErrors(newErrors);
      }
      // Re-validate discountAmount when switching types to check for 500 multiple rule
      if (discountAmount) {
        validateField("discountAmount", discountAmount);
      }
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
            <Typography>Loại voucher</Typography>
            <ToggleButtonGroup
              value={type}
              exclusive
              onChange={handleTypeChange}
              color="primary"
            >
              <ToggleButton value="Amount">Giảm tiền</ToggleButton>
              <ToggleButton value="Percentage">Giảm %</ToggleButton>
            </ToggleButtonGroup>

            <TextField
              label={
                type === "Amount" ? "Số tiền giảm (₫)" : "Phần trăm giảm (%)"
              }
              type="number"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              onBlur={() => validateField("discountAmount", discountAmount)}
              fullWidth
              error={!!errors.discountAmount}
              helperText={errors.discountAmount}
            />

            <TextField
              label="Số lượng voucher"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onBlur={() => validateField("quantity", quantity)}
              fullWidth
              error={!!errors.quantity}
              helperText={errors.quantity}
            />

            <TextField
              label="Giá trị đơn hàng tối thiểu (₫)"
              type="number"
              value={minOrderPrice}
              onChange={(e) => setMinOrderPrice(e.target.value)}
              onBlur={() => validateField("minOrderPrice", minOrderPrice)}
              fullWidth
              error={!!errors.minOrderPrice}
              helperText={errors.minOrderPrice}
            />

            <TextField
              label="Mức giảm tối đa (₫)"
              type="number"
              value={maxDiscountPrice}
              onChange={(e) => setMaxDiscountPrice(e.target.value)}
              onBlur={() => validateField("maxDiscountPrice", maxDiscountPrice)}
              fullWidth
              disabled={type === "Percentage"}
              error={!!errors.maxDiscountPrice}
              helperText={
                type === "Percentage"
                  ? "Không cần nhập cho Giảm %"
                  : errors.maxDiscountPrice
              }
            />

            <TextField
              label="Ngày bắt đầu"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onBlur={() => validateField("startDate", startDate)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              inputProps={{ min: todayStr }}
              error={!!errors.startDate}
              helperText={errors.startDate}
            />

            <TextField
              label="Ngày kết thúc"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onBlur={() => validateField("endDate", endDate)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              error={!!errors.endDate}
              helperText={errors.endDate}
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
