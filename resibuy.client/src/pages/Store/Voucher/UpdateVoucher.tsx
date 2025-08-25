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
    CircularProgress,
    Paper,
    Container,
    Avatar,
    Divider,
} from "@mui/material";
import {
    LocalOffer,
    CalendarToday,
    AttachMoney,
    Inventory,
} from "@mui/icons-material";
import React, { useState, useEffect, useCallback } from "react";
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

interface VoucherApiResponse {
    code: number;
    message: string;
    data: Voucher;
}

interface ValidationErrors {
    [key: string]: string;
}

interface VoucherFormData {
    type: VoucherType;
    discountAmount: string;
    quantity: string;
    minOrderPrice: string;
    maxDiscountPrice: string;
    startDate: string;
    endDate: string;
}

const UpdateVoucher: React.FC = () => {
    const { storeId, voucherId } = useParams<{
        storeId: string;
        voucherId: string;
    }>();
    const navigate = useNavigate();

    // State management
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [errors, setErrors] = useState<ValidationErrors>({});

    const [formData, setFormData] = useState<VoucherFormData>({
        type: "Amount",
        discountAmount: "",
        quantity: "",
        minOrderPrice: "",
        maxDiscountPrice: "",
        startDate: "",
        endDate: "",
    });

    // Utility functions
    const todayStr = new Date().toISOString().split("T")[0];

    const getTomorrowStr = useCallback(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0];
    }, []);

    const getMinEndDate = useCallback(() => {
        const tomorrow = getTomorrowStr();
        if (formData.startDate) {
            const dayAfterStart = new Date(formData.startDate);
            dayAfterStart.setDate(dayAfterStart.getDate() + 1);
            const dayAfterStartStr = dayAfterStart.toISOString().split("T")[0];
            return dayAfterStartStr > tomorrow ? dayAfterStartStr : tomorrow;
        }
        return tomorrow;
    }, [formData.startDate, getTomorrowStr]);

    // Form update handlers
    const updateFormField = useCallback((field: keyof VoucherFormData, value: string | VoucherType) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear related errors when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }, [errors]);

    // Validation functions
    const validateField = useCallback((fieldName: string, value: string) => {
        const newErrors = { ...errors };

        switch (fieldName) {
            case "discountAmount":
                if (!value || isNaN(Number(value)) || Number(value) <= 0) {
                    newErrors.discountAmount = "Giá trị giảm phải lớn hơn 0";
                } else if (formData.type === "Percentage" && Number(value) >= 100) {
                    newErrors.discountAmount = "Phần trăm giảm phải nhỏ hơn 100%";
                } else if (formData.type === "Amount" && Number(value) % 500 !== 0) {
                    newErrors.discountAmount = "Số tiền giảm phải là bội số của 500";
                } else {
                    delete newErrors.discountAmount;
                    // Re-validate minOrderPrice when discountAmount changes for Amount type
                    if (formData.type === "Amount" && formData.minOrderPrice) {
                        if (Number(formData.minOrderPrice) <= Number(value)) {
                            newErrors.minOrderPrice = "Giá trị đơn hàng tối thiểu phải lớn hơn số tiền giảm";
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
                    formData.type === "Amount" &&
                    formData.discountAmount &&
                    Number(value) <= Number(formData.discountAmount)
                ) {
                    newErrors.minOrderPrice = "Giá trị đơn hàng tối thiểu phải lớn hơn số tiền giảm";
                } else if (Number(value) % 500 !== 0) {
                    newErrors.minOrderPrice = "Giá trị đơn hàng tối thiểu phải là bội số của 500";
                } else {
                    delete newErrors.minOrderPrice;
                }
                break;

            case "maxDiscountPrice":
                if (formData.type === "Percentage") {
                    if (!value || isNaN(Number(value)) || Number(value) <= 0) {
                        newErrors.maxDiscountPrice = "Mức giảm tối đa phải lớn hơn 0";
                    } else if (Number(value) % 500 !== 0) {
                        newErrors.maxDiscountPrice = "Mức giảm tối đa phải là bội số của 500";
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
                    if (formData.endDate) {
                        if (value >= formData.endDate) {
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
                } else if (formData.startDate && value <= formData.startDate) {
                    newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
                } else {
                    delete newErrors.endDate;
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
    }, [errors, formData, todayStr]);

    const validateAll = useCallback((): boolean => {
        const newErrors: ValidationErrors = {};

        // Validate discount amount
        if (!formData.discountAmount || isNaN(Number(formData.discountAmount)) || Number(formData.discountAmount) <= 0) {
            newErrors.discountAmount = "Giá trị giảm phải lớn hơn 0";
        } else if (formData.type === "Percentage" && Number(formData.discountAmount) >= 100) {
            newErrors.discountAmount = "Phần trăm giảm phải nhỏ hơn 100%";
        } else if (formData.type === "Amount" && Number(formData.discountAmount) % 500 !== 0) {
            newErrors.discountAmount = "Số tiền giảm phải là bội số của 500";
        }

        // Validate quantity
        if (
            !formData.quantity ||
            isNaN(Number(formData.quantity)) ||
            Number(formData.quantity) <= 0 ||
            !Number.isInteger(Number(formData.quantity))
        ) {
            newErrors.quantity = "Số lượng phải là số nguyên lớn hơn 0";
        }

        // Validate min order price
        if (!formData.minOrderPrice || isNaN(Number(formData.minOrderPrice)) || Number(formData.minOrderPrice) < 0) {
            newErrors.minOrderPrice = "Giá trị đơn hàng tối thiểu không hợp lệ";
        } else if (
            formData.type === "Amount" &&
            formData.discountAmount &&
            Number(formData.minOrderPrice) <= Number(formData.discountAmount)
        ) {
            newErrors.minOrderPrice = "Giá trị đơn hàng tối thiểu phải lớn hơn số tiền giảm";
        } else if (Number(formData.minOrderPrice) % 500 !== 0) {
            newErrors.minOrderPrice = "Giá trị đơn hàng tối thiểu phải là bội số của 500";
        }

        // Validate max discount price for percentage type
        if (formData.type === "Percentage") {
            if (
                !formData.maxDiscountPrice ||
                isNaN(Number(formData.maxDiscountPrice)) ||
                Number(formData.maxDiscountPrice) <= 0
            ) {
                newErrors.maxDiscountPrice = "Mức giảm tối đa phải lớn hơn 0";
            } else if (Number(formData.maxDiscountPrice) % 500 !== 0) {
                newErrors.maxDiscountPrice = "Mức giảm tối đa phải là bội số của 500";
            }
        }

        // Validate dates
        if (!formData.startDate) {
            newErrors.startDate = "Chọn ngày bắt đầu";
        } else if (formData.startDate < todayStr) {
            newErrors.startDate = "Ngày bắt đầu phải là hôm nay hoặc sau hôm nay";
        }

        if (!formData.endDate) {
            newErrors.endDate = "Chọn ngày kết thúc";
        } else if (formData.endDate <= todayStr) {
            newErrors.endDate = "Ngày kết thúc phải sau hôm nay";
        } else if (formData.startDate && formData.endDate <= formData.startDate) {
            newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, todayStr]);

    // API functions
    const fetchVoucher = useCallback(async () => {
        try {
            if (!voucherId || !storeId) {
                setError("Thiếu thông tin voucher hoặc store");
                return;
            }

            setIsLoading(true);
            setError("");

            const response = await axios.get(`/api/Voucher/${voucherId}`, {
                params: { storeId },
            });

            const apiResponse: VoucherApiResponse = response.data;

            if (apiResponse.code !== 0 || !apiResponse.data) {
                setError("Không tìm thấy voucher");
                return;
            }

            const voucherData: Voucher = apiResponse.data;

            // Set form data from fetched voucher
            setFormData({
                type: voucherData.type,
                discountAmount: voucherData.discountAmount.toString(),
                quantity: voucherData.quantity.toString(),
                minOrderPrice: voucherData.minOrderPrice.toString(),
                maxDiscountPrice: voucherData.maxDiscountPrice.toString(),
                startDate: voucherData.startDate.split("T")[0],
                endDate: voucherData.endDate.split("T")[0],
            });

        } catch (error) {
            console.error("Failed to fetch voucher", error);
            setError("Không thể tải thông tin voucher");
        } finally {
            setIsLoading(false);
        }
    }, [voucherId, storeId]);

    // Event handlers
    const handleUpdate = async () => {
        if (!storeId || !voucherId) {
            setError("Không tìm thấy thông tin cần thiết");
            return;
        }

        if (!validateAll()) {
            setError("Vui lòng sửa các lỗi trong form trước khi cập nhật");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const payload = {
                id: voucherId,
                storeId,
                type: formData.type,
                discountAmount: parseFloat(formData.discountAmount),
                quantity: parseInt(formData.quantity),
                minOrderPrice: parseFloat(formData.minOrderPrice),
                maxDiscountPrice: formData.type === "Percentage" ? parseFloat(formData.maxDiscountPrice) : 0,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
            };

            await axios.put("/api/Voucher", payload);
            setSuccess("Cập nhật voucher thành công!");

            setTimeout(() => {
                navigate(`/store/${storeId}/voucher`);
            }, 1500);
        } catch (error) {
            console.error("Lỗi khi cập nhật voucher:", error);
            setError("Cập nhật voucher thất bại. Vui lòng thử lại!");
        } finally {
            setIsSubmitting(false);
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
            updateFormField('type', newType);

            // Clear relevant errors when switching types
            const newErrors = { ...errors };

            if (newType === "Amount") {
                delete newErrors.maxDiscountPrice;
                if (errors.discountAmount === "Phần trăm giảm phải nhỏ hơn 100%") {
                    delete newErrors.discountAmount;
                }
            } else if (newType === "Percentage") {
                if (errors.discountAmount === "Số tiền giảm phải là bội số của 500") {
                    delete newErrors.discountAmount;
                }
                if (errors.minOrderPrice === "Giá trị đơn hàng tối thiểu phải lớn hơn số tiền giảm") {
                    delete newErrors.minOrderPrice;
                }
            }

            setErrors(newErrors);

            // Re-validate fields based on new type
            setTimeout(() => {
                if (formData.discountAmount) {
                    validateField("discountAmount", formData.discountAmount);
                }
                if (formData.minOrderPrice) {
                    validateField("minOrderPrice", formData.minOrderPrice);
                }
                if (formData.maxDiscountPrice && newType === "Percentage") {
                    validateField("maxDiscountPrice", formData.maxDiscountPrice);
                }
            }, 0);
        }
    };

    const handleDatePickerClick = (inputElement: HTMLInputElement) => {
        try {
            if (inputElement && typeof inputElement.showPicker === "function") {
                inputElement.showPicker();
            }
        } catch (error) {
            console.error("Date picker error:", error);
            inputElement.focus();
        }
    };

    // Effects
    useEffect(() => {
        fetchVoucher();
    }, [fetchVoucher]);

    // Loading state
    if (isLoading && !formData.discountAmount) {
        return (
            <Box sx={{ p: 3, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
                <Container maxWidth="md">
                    <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
                        <CardHeader title={<Skeleton width={200} height={32} />} />
                        <CardContent>
                            <Stack spacing={3}>
                                {[...Array(7)].map((_, i) => (
                                    <Skeleton key={i} height={56} />
                                ))}
                            </Stack>
                        </CardContent>
                    </Paper>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
            <Container maxWidth="md">
                <Stack spacing={4}>
                    {/* Header */}
                    <Paper elevation={0} sx={{ p: 3, bgcolor: "white", borderRadius: 2 }}>
                        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                            Cập nhật Voucher
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Chỉnh sửa thông tin voucher cho cửa hàng của bạn
                        </Typography>
                    </Paper>

                    {/* Alert Messages */}
                    {error && (
                        <Alert severity="error" sx={{ borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert severity="success" sx={{ borderRadius: 2 }}>
                            {success}
                        </Alert>
                    )}

                    {/* Form Validation Summary */}
                    {Object.keys(errors).length > 0 && (
                        <Alert severity="warning" sx={{ borderRadius: 2 }}>
                            Vui lòng sửa các lỗi sau: {Object.values(errors).join(", ")}
                        </Alert>
                    )}

                    {/* Voucher Type Section */}
                    <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
                        <Box
                            sx={{
                                p: 3,
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "white",
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                                    <LocalOffer />
                                </Avatar>
                                <Typography variant="h6" fontWeight="bold">
                                    Loại voucher
                                </Typography>
                            </Stack>
                        </Box>
                        <CardContent sx={{ p: 4 }}>
                            <ToggleButtonGroup
                                value={formData.type}
                                onChange={handleTypeChange}
                                exclusive
                                color="primary"
                                sx={{
                                    "& .MuiToggleButton-root": {
                                        borderRadius: 2,
                                        px: 3,
                                        py: 1.5,
                                    },
                                }}
                            >
                                <ToggleButton value="Amount">Giảm tiền</ToggleButton>
                                <ToggleButton value="Percentage">Giảm %</ToggleButton>
                            </ToggleButtonGroup>
                        </CardContent>
                    </Paper>

                    {/* Voucher Details Section */}
                    <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
                        <Box
                            sx={{
                                p: 3,
                                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                                color: "white",
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                                    <AttachMoney />
                                </Avatar>
                                <Typography variant="h6" fontWeight="bold">
                                    Chi tiết voucher
                                </Typography>
                            </Stack>
                        </Box>
                        <CardContent sx={{ p: 4 }}>
                            <Stack spacing={3}>
                                <Stack direction="row" spacing={3}>
                                    <TextField
                                        label={formData.type === "Amount" ? "Số tiền giảm (₫)" : "Phần trăm giảm (%)"}
                                        type="number"
                                        fullWidth
                                        value={formData.discountAmount}
                                        onChange={(e) => updateFormField('discountAmount', e.target.value)}
                                        onBlur={() => validateField("discountAmount", formData.discountAmount)}
                                        error={!!errors.discountAmount}
                                        helperText={errors.discountAmount}
                                        inputProps={{
                                            min: 0,
                                            max: formData.type === "Percentage" ? 99 : undefined,
                                            step: formData.type === "Amount" ? 500 : 0.01,
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": { borderRadius: 2 },
                                        }}
                                    />

                                    <TextField
                                        label="Số lượng voucher"
                                        type="number"
                                        fullWidth
                                        value={formData.quantity}
                                        onChange={(e) => updateFormField('quantity', e.target.value)}
                                        onBlur={() => validateField("quantity", formData.quantity)}
                                        error={!!errors.quantity}
                                        helperText={errors.quantity}
                                        inputProps={{
                                            min: 1,
                                            step: 1,
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": { borderRadius: 2 },
                                        }}
                                    />
                                </Stack>

                                <Stack direction="row" spacing={3}>
                                    <TextField
                                        label="Giá trị đơn hàng tối thiểu (₫)"
                                        type="number"
                                        fullWidth
                                        value={formData.minOrderPrice}
                                        onChange={(e) => updateFormField('minOrderPrice', e.target.value)}
                                        onBlur={() => validateField("minOrderPrice", formData.minOrderPrice)}
                                        error={!!errors.minOrderPrice}
                                        helperText={errors.minOrderPrice}
                                        inputProps={{
                                            min: 0,
                                            step: 500,
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": { borderRadius: 2 },
                                        }}
                                    />

                                    <TextField
                                        label="Mức giảm tối đa (₫)"
                                        type="number"
                                        fullWidth
                                        value={formData.maxDiscountPrice}
                                        onChange={(e) => updateFormField('maxDiscountPrice', e.target.value)}
                                        onBlur={() => validateField("maxDiscountPrice", formData.maxDiscountPrice)}
                                        disabled={formData.type === "Amount"}
                                        error={!!errors.maxDiscountPrice}
                                        helperText={
                                            formData.type === "Amount"
                                                ? "Không cần nhập cho Giảm tiền"
                                                : errors.maxDiscountPrice
                                        }
                                        inputProps={{
                                            min: formData.type === "Percentage" ? 500 : 0,
                                            step: 500,
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": { borderRadius: 2 },
                                        }}
                                    />
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Paper>

                    {/* Date Section */}
                    <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
                        <Box
                            sx={{
                                p: 3,
                                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                color: "white",
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                                    <CalendarToday />
                                </Avatar>
                                <Typography variant="h6" fontWeight="bold">
                                    Thời gian hiệu lực
                                </Typography>
                            </Stack>
                        </Box>
                        <CardContent sx={{ p: 4 }}>
                            <Stack direction="row" spacing={3}>
                                <TextField
                                    label="Ngày bắt đầu"
                                    type="date"
                                    fullWidth
                                    value={formData.startDate}
                                    onChange={(e) => updateFormField('startDate', e.target.value)}
                                    onBlur={() => validateField("startDate", formData.startDate)}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{
                                        min: todayStr,
                                        style: { cursor: "pointer" },
                                    }}
                                    error={!!errors.startDate}
                                    helperText={errors.startDate}
                                    onClick={(e) => handleDatePickerClick(e.target as HTMLInputElement)}
                                    sx={{
                                        "& .MuiOutlinedInput-root": { borderRadius: 2 },
                                    }}
                                />

                                <TextField
                                    label="Ngày kết thúc"
                                    type="date"
                                    fullWidth
                                    value={formData.endDate}
                                    onChange={(e) => updateFormField('endDate', e.target.value)}
                                    onBlur={() => validateField("endDate", formData.endDate)}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{
                                        min: getMinEndDate(),
                                        style: { cursor: "pointer" },
                                    }}
                                    error={!!errors.endDate}
                                    helperText={errors.endDate}
                                    onClick={(e) => handleDatePickerClick(e.target as HTMLInputElement)}
                                    sx={{
                                        "& .MuiOutlinedInput-root": { borderRadius: 2 },
                                    }}
                                />
                            </Stack>
                        </CardContent>
                    </Paper>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                            variant="outlined"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            size="large"
                            sx={{ borderRadius: 3, px: 4, py: 2 }}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleUpdate}
                            disabled={isSubmitting || isLoading}
                            size="large"
                            sx={{
                                borderRadius: 3,
                                px: 6,
                                py: 2,
                                boxShadow: 4,
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                "&:hover": { boxShadow: 6 },
                                "&:disabled": { opacity: 0.7 },
                            }}
                        >
                            {isSubmitting ? (
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <CircularProgress size={20} color="inherit" />
                                    <Typography>Đang cập nhật...</Typography>
                                </Stack>
                            ) : (
                                "Cập nhật voucher"
                            )}
                        </Button>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
};

export default UpdateVoucher;