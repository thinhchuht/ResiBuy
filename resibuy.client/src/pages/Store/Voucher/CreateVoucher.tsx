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
import {useToastify} from "../../../hooks/useToastify.ts";

type VoucherType = "Amount" | "Percentage";

const VoucherCreatePage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split("T")[0];

  // Get tomorrow's date for minimum end date
  const getTomorrowStr = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  // Set default dates: start date = today, end date = 7 days from today
  const getDefaultStartDate = () => new Date().toISOString().split("T")[0];
  const getDefaultEndDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split("T")[0];
  };

  const [type, setType] = useState<VoucherType>("Amount");
  const [discountAmount, setDiscountAmount] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minOrderPrice, setMinOrderPrice] = useState("");
  const [maxDiscountPrice, setMaxDiscountPrice] = useState("");
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateField = (fieldName: string, value: string) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case "discountAmount":
        if (!value || isNaN(Number(value)) || Number(value) <= 0) {
          newErrors.discountAmount = "Giá trị giảm phải lớn hơn 0";
        } else if (type === "Percentage" && Number(value) >= 100) {
          newErrors.discountAmount = "Phần trăm giảm phải nhỏ hơn 100%";
        } else if (type === "Amount" && Number(value) % 500 !== 0) {
          newErrors.discountAmount = "Số tiền giảm phải là bội số của 500";
        } else {
          delete newErrors.discountAmount;
          // Re-validate minOrderPrice when discountAmount changes for Amount type
          if (type === "Amount" && minOrderPrice) {
            if (Number(minOrderPrice) <= Number(value)) {
              newErrors.minOrderPrice =
                "Giá trị đơn hàng tối thiểu phải lớn hơn số tiền giảm";
            } else if (Number(minOrderPrice) % 500 !== 0) {
              newErrors.minOrderPrice =
                "Giá trị đơn hàng tối thiểu phải là bội số của 500";
            } else {
              delete newErrors.minOrderPrice;
            }
          }
        }
        break;

      case "quantity":
        if (
          !value ||
          isNaN(Number(value)) ||
          Number(value) <= 0 ||
          !Number.isInteger(Number(value))
        ) {
          newErrors.quantity = "Số lượng phải là số nguyên lớn hơn 0";
        } else {
          delete newErrors.quantity;
        }
        break;

      case "minOrderPrice":
        if (!value || isNaN(Number(value)) || Number(value) < 0) {
          newErrors.minOrderPrice = "Giá trị đơn hàng tối thiểu không hợp lệ";
        } else if (
          type === "Amount" &&
          discountAmount &&
          Number(value) <= Number(discountAmount)
        ) {
          newErrors.minOrderPrice =
            "Giá trị đơn hàng tối thiểu phải lớn hơn số tiền giảm";
        } else if (Number(value) % 500 !== 0) {
          newErrors.minOrderPrice =
            "Giá trị đơn hàng tối thiểu phải là bội số của 500";
        } else {
          delete newErrors.minOrderPrice;
        }
        break;

      case "maxDiscountPrice":
        if (type === "Percentage") {
          if (!value || isNaN(Number(value)) || Number(value) <= 0) {
            newErrors.maxDiscountPrice = "Mức giảm tối đa phải lớn hơn 0";
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
          newErrors.startDate = "Ngày bắt đầu phải là hôm nay hoặc sau hôm nay";
        } else {
          delete newErrors.startDate;
          // Re-validate endDate if it exists
          if (endDate) {
            if (value >= endDate) {
              newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
            } else {
              delete newErrors.endDate;
            }
          }
        }
        break;

      case "endDate":
        if (!value) {
          newErrors.endDate = "Chọn ngày kết thúc";
        } else if (value <= todayStr) {
          newErrors.endDate = "Ngày kết thúc phải sau hôm nay";
        } else if (startDate && value <= startDate) {
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
    } else if (type === "Percentage" && Number(discountAmount) >= 100) {
      newErrors.discountAmount = "Phần trăm giảm phải nhỏ hơn 100%";
    } else if (type === "Amount" && Number(discountAmount) % 500 !== 0) {
      newErrors.discountAmount = "Số tiền giảm phải là bội số của 500";
    }

    if (
      !quantity ||
      isNaN(Number(quantity)) ||
      Number(quantity) <= 0 ||
      !Number.isInteger(Number(quantity))
    ) {
      newErrors.quantity = "Số lượng phải là số nguyên lớn hơn 0";
    }

    if (
      !minOrderPrice ||
      isNaN(Number(minOrderPrice)) ||
      Number(minOrderPrice) < 0
    ) {
      newErrors.minOrderPrice = "Giá trị đơn hàng tối thiểu không hợp lệ";
    } else if (
      type === "Amount" &&
      discountAmount &&
      Number(minOrderPrice) <= Number(discountAmount)
    ) {
      newErrors.minOrderPrice =
        "Giá trị đơn hàng tối thiểu phải lớn hơn số tiền giảm";
    } else if (Number(minOrderPrice) % 500 !== 0) {
      newErrors.minOrderPrice =
        "Giá trị đơn hàng tối thiểu phải là bội số của 500";
    }

    if (type === "Percentage") {
      if (
        !maxDiscountPrice ||
        isNaN(Number(maxDiscountPrice)) ||
        Number(maxDiscountPrice) <= 0
      ) {
        newErrors.maxDiscountPrice = "Mức giảm tối đa phải lớn hơn 0";
      } else if (Number(maxDiscountPrice) % 500 !== 0) {
        newErrors.maxDiscountPrice = "Mức giảm tối đa phải là bội số của 500";
      }
    }

    if (!startDate) {
      newErrors.startDate = "Chọn ngày bắt đầu";
    } else if (startDate < todayStr) {
      newErrors.startDate = "Ngày bắt đầu phải là hôm nay hoặc sau hôm nay";
    }

    if (!endDate) {
      newErrors.endDate = "Chọn ngày kết thúc";
    } else if (endDate <= todayStr) {
      newErrors.endDate = "Ngày kết thúc phải sau hôm nay";
    } else if (startDate && endDate <= startDate) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
    const { error: showError, success: showSuccess } = useToastify();
  const handleCreate = async () => {
    if (!storeId) {
      showError("Không tìm thấy storeId")
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
        maxDiscountPrice:
          type === "Percentage" ? parseFloat(maxDiscountPrice) : 0,
        startDate,
        endDate,
      };

      await axios.post("/api/Voucher", payload);
      showSuccess("Tạo voucher thành công")
      navigate(`/store/${storeId}/vouchers`);
    } catch (error) {
      console.error("Lỗi khi tạo voucher:", error);
      showError("Tạo voucher thất bại");
    }
  };

  const handleTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: VoucherType | null
  ) => {
    if (newType !== null) {
      setType(newType);

      // Clear relevant errors when switching types
      const newErrors = { ...errors };

      if (newType === "Amount") {
        // Clear maxDiscountPrice error when switching to Amount
        delete newErrors.maxDiscountPrice;
        // Clear percentage-specific validation for discountAmount
        if (errors.discountAmount === "Phần trăm giảm phải nhỏ hơn 100%") {
          delete newErrors.discountAmount;
        }
      } else if (newType === "Percentage") {
        // Clear Amount-specific validations
        if (errors.discountAmount === "Số tiền giảm phải là bội số của 500") {
          delete newErrors.discountAmount;
        }
        if (
          errors.minOrderPrice ===
          "Giá trị đơn hàng tối thiểu phải lớn hơn số tiền giảm"
        ) {
          delete newErrors.minOrderPrice;
        }
      }

      setErrors(newErrors);

      // Re-validate fields based on new type
      if (discountAmount) {
        validateField("discountAmount", discountAmount);
      }
      if (minOrderPrice) {
        validateField("minOrderPrice", minOrderPrice);
      }
      if (maxDiscountPrice && newType === "Percentage") {
        validateField("maxDiscountPrice", maxDiscountPrice);
      }
    }
  };

  const handleDatePickerClick = (inputElement: HTMLInputElement) => {
    try {
      if (inputElement && typeof inputElement.showPicker === "function") {
        inputElement.showPicker();
      }
    } catch (error) {
      console.error("error:", error);
      inputElement.focus();
    }
  };

  const getMinEndDate = () => {
    const tomorrow = getTomorrowStr();
    if (startDate) {
      const dayAfterStart = new Date(startDate);
      dayAfterStart.setDate(dayAfterStart.getDate() + 1);
      const dayAfterStartStr = dayAfterStart.toISOString().split("T")[0];
      return dayAfterStartStr > tomorrow ? dayAfterStartStr : tomorrow;
    }
    return tomorrow;
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
              onChange={handleTypeChange}
              exclusive
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
              inputProps={{
                min: 0,
                max: type === "Percentage" ? 99 : undefined,
                step: type === "Amount" ? 500 : 0.01,
              }}
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
              inputProps={{
                min: 1,
                step: 1,
              }}
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
              inputProps={{
                min: 0,
                step: 500,
              }}
            />

            <TextField
              label="Mức giảm tối đa (₫)"
              type="number"
              value={maxDiscountPrice}
              onChange={(e) => setMaxDiscountPrice(e.target.value)}
              onBlur={() => validateField("maxDiscountPrice", maxDiscountPrice)}
              fullWidth
              disabled={type === "Amount"}
              error={!!errors.maxDiscountPrice}
              helperText={
                type === "Amount"
                  ? "Không cần nhập cho Giảm tiền"
                  : errors.maxDiscountPrice
              }
              inputProps={{
                min: type === "Percentage" ? 500 : 0,
                step: 500,
              }}
            />

            <TextField
              label="Ngày bắt đầu"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onBlur={() => validateField("startDate", startDate)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              inputProps={{
                min: todayStr,
                style: { cursor: "pointer" },
              }}
              error={!!errors.startDate}
              helperText={errors.startDate}
              onClick={(e) =>
                handleDatePickerClick(e.target as HTMLInputElement)
              }
            />

            <TextField
              label="Ngày kết thúc"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onBlur={() => validateField("endDate", endDate)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              inputProps={{
                min: getMinEndDate(),
                style: { cursor: "pointer" },
              }}
              error={!!errors.endDate}
              helperText={errors.endDate}
              onClick={(e) =>
                handleDatePickerClick(e.target as HTMLInputElement)
              }
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
