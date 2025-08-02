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
  Alert,
  Skeleton,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../../api/base.api";

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

// Add interface for API response
interface VoucherApiResponse {
  code: number;
  message: string;
  data: Voucher;
}

const UpdateVoucher: React.FC = () => {
  const { storeId, voucherId } = useParams<{
    storeId: string;
    voucherId: string;
  }>();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split("T")[0];

  // Get tomorrow's date for minimum end date
  const getTomorrowStr = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [type, setType] = useState<VoucherType>("Amount");
  const [discountAmount, setDiscountAmount] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minOrderPrice, setMinOrderPrice] = useState("");
  const [maxDiscountPrice, setMaxDiscountPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch voucher data
  const fetchVoucher = async () => {
    try {
      if (!voucherId || !storeId) {
        setError("Thiếu thông tin voucher hoặc store");
        return;
      }

      setLoading(true);
      const response = await axios.get(`/api/Voucher/${voucherId}`, {
        params: { storeId },
      });

      const apiResponse: VoucherApiResponse = response.data;

      // Check if response is successful and has data
      if (apiResponse.code !== 0 || !apiResponse.data) {
        setError("Không tìm thấy voucher");
        return;
      }

      const voucherData: Voucher = apiResponse.data;

      // Set form data from fetched voucher
      setType(voucherData.type);
      setDiscountAmount(voucherData.discountAmount.toString());
      setQuantity(voucherData.quantity.toString());
      setMinOrderPrice(voucherData.minOrderPrice.toString());
      setMaxDiscountPrice(voucherData.maxDiscountPrice.toString());
      // Fix date parsing to avoid timezone issues
      setStartDate(voucherData.startDate.split("T")[0]);
      setEndDate(voucherData.endDate.split("T")[0]);
    } catch (error) {
      console.error("Failed to fetch voucher", error);
      setError("Không thể tải thông tin voucher");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoucher();
  }, [voucherId, storeId]);

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

  const handleUpdate = async () => {
    if (!storeId || !voucherId) {
      setError("Không tìm thấy thông tin cần thiết");
      return;
    }

    if (!validateAll()) return;

    try {
      const payload = {
        id: voucherId,
        storeId,
        type,
        discountAmount: parseFloat(discountAmount),
        quantity: parseInt(quantity),
        minOrderPrice: parseFloat(minOrderPrice),
        maxDiscountPrice:
          type === "Percentage" ? parseFloat(maxDiscountPrice) : 0,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      };

      setLoading(true);
      await axios.put("/api/Voucher", payload);
      setSuccess("Cập nhật voucher thành công!");
      setTimeout(() => {
        navigate(`/store/${storeId}/voucher`);
      }, 1500);
    } catch (error) {
      console.error("Lỗi khi cập nhật voucher:", error);
      setError("Cập nhật voucher thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/store/${storeId}/voucher`);
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

  if (loading && !discountAmount) {
    return (
      <Box p={4}>
        <Card>
          <CardHeader title={<Skeleton width={200} height={32} />} />
          <CardContent>
            <Stack spacing={2}>
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} height={56} />
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Card>
        <CardHeader
          title={<Typography variant="h5">Cập nhật Voucher</Typography>}
        />
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

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

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading ? "Đang cập nhật..." : "Cập nhật voucher"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UpdateVoucher;
