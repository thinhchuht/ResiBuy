import {
    Box,
    TextField,
    Typography,
    Button,
    Stack,
    Card,
    CardContent,
    CardHeader,
    FormControlLabel,
    Switch,
} from "@mui/material";
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../../api/base.api";
import { useToastify } from "../../../hooks/useToastify.ts";

const PromotionCreatePage: React.FC = () => {
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

    const [name, setName] = useState("");
    const [discount, setDiscount] = useState("");
    const [startDate, setStartDate] = useState(getDefaultStartDate());
    const [endDate, setEndDate] = useState(getDefaultEndDate());
    const [isActive, setIsActive] = useState(true);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateField = (fieldName: string, value: string | boolean) => {
        const newErrors = { ...errors };

        switch (fieldName) {
            case "name":
                if (!value || (typeof value === "string" && value.trim() === "")) {
                    newErrors.name = "Tên khuyến mãi là bắt buộc";
                } else {
                    delete newErrors.name;
                }
                break;

            case "discount":
                if (
                    !value ||
                    isNaN(Number(value)) ||
                    Number(value) <= 0 ||
                    Number(value) > 100
                ) {
                    newErrors.discount = "Giá trị khuyến mãi phải lớn hơn 0 và nhỏ hơn hoặc bằng 100";
                } else {
                    delete newErrors.discount;
                }
                break;

            case "startDate":
                if (!value) {
                    newErrors.startDate = "Chọn ngày bắt đầu";
                } else if (typeof value === "string" && value < todayStr) {
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
                } else if (typeof value === "string" && value <= todayStr) {
                    newErrors.endDate = "Ngày kết thúc phải sau hôm nay";
                } else if (startDate && typeof value === "string" && value <= startDate) {
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

        if (!name || name.trim() === "") {
            newErrors.name = "Tên khuyến mãi là bắt buộc";
        }

        if (
            !discount ||
            isNaN(Number(discount)) ||
            Number(discount) <= 0 ||
            Number(discount) > 100
        ) {
            newErrors.discount = "Giá trị khuyến mãi phải lớn hơn 0 và nhỏ hơn hoặc bằng 100";
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
        if (!validateAll()) return;

        try {
            const payload = {
                name: name.trim(),
                discount: parseInt(discount),
                startDate,
                endDate,
                isActive,
            };

            await axios.post("/api/Promotion/create", payload);
            showSuccess("Tạo khuyến mãi thành công");
            navigate(`/admin/promotion`);
        } catch (error: any) {
            console.error("Lỗi khi tạo khuyến mãi:", error);
            showError(
                `Tạo khuyến mãi thất bại: ${
                    error.response?.data?.message || "Đã có lỗi xảy ra"
                }`
            );
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
    <Box p={4} sx={{ bgcolor: "white", minHeight: "100vh" }}>
            <Card>
                <CardHeader
                    title={<Typography variant="h5">Tạo mới Khuyến mãi</Typography>}
                />
                <CardContent>
                    <Stack spacing={2}>
                        <TextField
                            label="Tên khuyến mãi"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={() => validateField("name", name)}
                            fullWidth
                            error={!!errors.name}
                            helperText={errors.name}
                        />

                        <TextField
                            label="Phần trăm giảm (%)"
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            onBlur={() => validateField("discount", discount)}
                            fullWidth
                            error={!!errors.discount}
                            helperText={errors.discount}
                            inputProps={{
                                min: 1,
                                max: 100,
                                step: 1,
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

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                />
                            }
                            label="Kích hoạt khuyến mãi"
                        />

                        <Button variant="contained" onClick={handleCreate}>
                            Tạo khuyến mãi
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};

export default PromotionCreatePage;