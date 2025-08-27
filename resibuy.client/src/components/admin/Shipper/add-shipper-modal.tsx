import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    Autocomplete,
    CircularProgress,
} from "@mui/material";
import { Close, LocalShipping as ShipperIcon } from "@mui/icons-material";
import { useShipperForm } from "./seg/utlis";
import areaApi from "../../../api/area.api";
import type { Shipper } from "../../../types/models";

interface Area {
    id: string;
    name: string;
    isActive: boolean;
    latitude: number;
    longitude: number;
}

interface AddShipperModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (shipper: Shipper) => void;
    editingShipper?: Shipper | null;
}

// Định nghĩa các ca làm việc cố định
const shiftOptions = [
    { label: "0:00 - 8:00", start: "00:00", end: "08:00" },
    { label: "8:00 - 16:00", start: "08:00", end: "16:00" },
    { label: "16:00 - 24:00", start: "16:00", end: "24:00" },
    
];

export function AddShipperModal({
    isOpen,
    onClose,
    onSubmit,
    editingShipper,
}: AddShipperModalProps) {
    const { formData, errors, isSubmitting, handleInputChange, handleSubmit, resetForm } = useShipperForm(editingShipper);
    const [areas, setAreas] = useState<Area[]>([]);
    const [selectedArea, setSelectedArea] = useState<Area | null>(null);
    const [isLoadingAreas, setIsLoadingAreas] = useState(false);
    const [selectedShift, setSelectedShift] = useState<(typeof shiftOptions)[0] | null>(null);

    // Lấy danh sách khu vực
    useEffect(() => {
        const fetchAreas = async () => {
            try {
                setIsLoadingAreas(true);
                const response = await areaApi.getAll(false);
                console.log("Fetch areas response:", response);
                setAreas(response);
            } catch (error: any) {
                console.error("Fetch areas error:", error);
            } finally {
                setIsLoadingAreas(false);
            }
        };
        fetchAreas();
    }, []);

    // Cập nhật selectedArea và selectedShift khi formData thay đổi
    useEffect(() => {
        if (formData.lastLocationId && areas.length > 0) {
            const area = areas.find((a) => a.id === formData.lastLocationId);
            setSelectedArea(area || null);
        } else {
            setSelectedArea(null);
        }

        if (formData.startWorkTime && formData.endWorkTime) {
            const shift = shiftOptions.find(
                (s) => s.start === formData.startWorkTime && s.end === formData.endWorkTime
            );
            setSelectedShift(shift || null);
        } else {
            setSelectedShift(null);
        }
    }, [formData.lastLocationId, formData.startWorkTime, formData.endWorkTime, areas]);

    // Reset form, selectedArea và selectedShift khi đóng modal
    const handleClose = () => {
        resetForm();
        setSelectedArea(null);
        setSelectedShift(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
       <Dialog
            open={isOpen}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            sx={{
                "& .MuiDialog-paper": {
                    maxWidth: "32rem",
                    margin: 0,
                    borderRadius: 0,
                    boxShadow: 24,
                    transform: isOpen ? "translateX(0)" : "translateX(100%)",
                    transition: "transform 0.3s ease-in-out",
                },
            }}
            PaperProps={{ sx: { bgcolor: "background.paper" } }}
        >
            <DialogTitle
                sx={{
                    p: 3,
                    borderBottom: 1,
                    borderColor: "grey.200",
                    bgcolor: "background.paper",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Box>
                    <Typography
                        variant="h6"
                        sx={{ color: "grey.900", fontWeight: "medium" }}
                    >
                        {editingShipper ? "Sửa Shipper" : "Thêm Shipper Mới"}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: "grey.500" }}
                    >
                        {editingShipper ? "Cập nhật thông tin shipper" : "Tạo shipper mới"}
                    </Typography>
                </Box>
                <IconButton
                    onClick={handleClose}
                    sx={{
                        color: "grey.400",
                        bgcolor: "background.paper",
                        p: 1,
                        borderRadius: 2,
                        "&:hover": {
                            color: "grey.600",
                            bgcolor: "grey.100",
                        },
                    }}
                >
                    <Close sx={{ fontSize: 20 }} />
                </IconButton>
            </DialogTitle>

            <DialogContent
                sx={{
                    p: 3,
                    pb: 0, // Loại bỏ padding dưới
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                    maxHeight: "calc(100vh - 128px - 72px)", // Trừ chiều cao DialogTitle (128px) và DialogActions (72px)
                }}
            >
                <form onSubmit={(e) => handleSubmit(e, onSubmit)}>
                    {/* Thông Tin Cơ Bản */}
                    <Box sx={{ mb: 2 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                color: "grey.900",
                                mb: 2,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <ShipperIcon sx={{ fontSize: 20 }} />
                            Thông Tin Cơ Bản
                        </Typography>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {/* Email */}
                            <Box>
                                <Typography
                                    variant="body2"
                                    sx={{ color: "grey.700", fontWeight: "medium", mb: 1 }}
                                >
                                    Email *
                                </Typography>
                                <TextField
                                    fullWidth
                                    value={formData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    placeholder="Nhập email"
                                    size="small"
                                    error={!!errors.email}
                                    helperText={errors.email}
                                    InputProps={{
                                        readOnly: !!editingShipper,
                                    }}
                                    sx={{
                                        bgcolor: "background.paper",
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                            "& fieldset": {
                                                borderColor: errors.email ? "error.main" : "grey.300",
                                            },
                                            "&:hover fieldset": {
                                                borderColor: errors.email ? "error.main" : "grey.500",
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "primary.main",
                                                boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                                            },
                                        },
                                        "& .MuiInputBase-input": {
                                            color: "grey.700",
                                            px: 1.5,
                                            py: 1,
                                            backgroundColor: editingShipper ? "grey.100" : "background.paper",
                                        },
                                    }}
                                />
                            </Box>

                            {/* Mật khẩu (chỉ khi tạo mới) */}
                            {!editingShipper && (
                                <Box>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: "grey.700", fontWeight: "medium", mb: 1 }}
                                    >
                                        Mật Khẩu *
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        value={formData.password}
                                        onChange={(e) => handleInputChange("password", e.target.value)}
                                        placeholder="Nhập mật khẩu"
                                        size="small"
                                        error={!!errors.password}
                                        helperText={errors.password}
                                        type="text"
                                        sx={{
                                            bgcolor: "background.paper",
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: 2,
                                                "& fieldset": {
                                                    borderColor: errors.password ? "error.main" : "grey.300",
                                                },
                                                "&:hover fieldset": {
                                                    borderColor: errors.password ? "error.main" : "grey.500",
                                                },
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "primary.main",
                                                    boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                                                },
                                            },
                                            "& .MuiInputBase-input": {
                                                color: "grey.700",
                                                px: 1.5,
                                                py: 1,
                                            },
                                        }}
                                    />
                                </Box>
                            )}

                            {/* Họ tên */}
                            <Box>
                                <Typography
                                    variant="body2"
                                    sx={{ color: "grey.700", fontWeight: "medium", mb: 1 }}
                                >
                                    Họ Tên *
                                </Typography>
                                <TextField
                                    fullWidth
                                    value={formData.fullName}
                                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                                    placeholder="Nhập họ tên"
                                    size="small"
                                    error={!!errors.fullName}
                                    helperText={errors.fullName}
                                    InputProps={{
                                        readOnly: !!editingShipper,
                                    }}
                                    sx={{
                                        bgcolor: "background.paper",
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                            "& fieldset": {
                                                borderColor: errors.fullName ? "error.main" : "grey.300",
                                            },
                                            "&:hover fieldset": {
                                                borderColor: errors.fullName ? "error.main" : "grey.500",
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "primary.main",
                                                boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                                            },
                                        },
                                        "& .MuiInputBase-input": {
                                            color: "grey.700",
                                            px: 1.5,
                                            py: 1,
                                            backgroundColor: editingShipper ? "grey.100" : "background.paper",
                                        },
                                    }}
                                />
                            </Box>

                            {/* Số điện thoại */}
                            <Box>
                                <Typography
                                    variant="body2"
                                    sx={{ color: "grey.700", fontWeight: "medium", mb: 1 }}
                                >
                                    Số Điện Thoại *
                                </Typography>
                                <TextField
                                    fullWidth
                                    value={formData.phoneNumber}
                                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                                    placeholder="Nhập số điện thoại"
                                    size="small"
                                    error={!!errors.phoneNumber}
                                    helperText={errors.phoneNumber}
                                    type="tel"
                                    InputProps={{
                                        readOnly: !!editingShipper,
                                    }}
                                    sx={{
                                        bgcolor: "background.paper",
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                            "& fieldset": {
                                                borderColor: errors.phoneNumber ? "error.main" : "grey.300",
                                            },
                                            "&:hover fieldset": {
                                                borderColor: errors.phoneNumber ? "error.main" : "grey.500",
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "primary.main",
                                                boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                                            },
                                        },
                                        "& .MuiInputBase-input": {
                                            color: "grey.700",
                                            px: 1.5,
                                            py: 1,
                                            backgroundColor: editingShipper ? "grey.100" : "background.paper",
                                        },
                                    }}
                                />
                            </Box>

                            {/* Ngày sinh */}
                            <Box>
                                <Typography
                                    variant="body2"
                                    sx={{ color: "grey.700", fontWeight: "medium", mb: 1 }}
                                >
                                    Ngày Sinh *
                                </Typography>
                                <TextField
                                    fullWidth
                                    value={formData.dateOfBirth}
                                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                                    size="small"
                                    error={!!errors.dateOfBirth}
                                    helperText={errors.dateOfBirth}
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    InputProps={{
                                        readOnly: !!editingShipper,
                                    }}
                                    sx={{
                                        bgcolor: "background.paper",
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                            "& fieldset": {
                                                borderColor: errors.dateOfBirth ? "error.main" : "grey.300",
                                            },
                                            "&:hover fieldset": {
                                                borderColor: errors.dateOfBirth ? "error.main" : "grey.500",
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "primary.main",
                                                boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                                            },
                                        },
                                        "& .MuiInputBase-input": {
                                            color: "grey.700",
                                            px: 1.5,
                                            py: 1,
                                            backgroundColor: editingShipper ? "grey.100" : "background.paper",
                                        },
                                    }}
                                />
                            </Box>

                            {/* CMND/CCCD */}
                            <Box>
                                <Typography
                                    variant="body2"
                                    sx={{ color: "grey.700", fontWeight: "medium", mb: 1 }}
                                >
                                    CMND/CCCD *
                                </Typography>
                                <TextField
                                    fullWidth
                                    value={formData.identityNumber}
                                    onChange={(e) => handleInputChange("identityNumber", e.target.value)}
                                    placeholder="Nhập CMND/CCCD"
                                    size="small"
                                    error={!!errors.identityNumber}
                                    helperText={errors.identityNumber}
                                    InputProps={{
                                        readOnly: !!editingShipper,
                                    }}
                                    sx={{
                                        bgcolor: "background.paper",
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                            "& fieldset": {
                                                borderColor: errors.identityNumber ? "error.main" : "grey.300",
                                            },
                                            "&:hover fieldset": {
                                                borderColor: errors.identityNumber ? "error.main" : "grey.500",
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "primary.main",
                                                boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                                            },
                                        },
                                        "& .MuiInputBase-input": {
                                            color: "grey.700",
                                            px: 1.5,
                                            py: 1,
                                            backgroundColor: editingShipper ? "grey.100" : "background.paper",
                                        },
                                    }}
                                />
                            </Box>

                            {/* Khu vực */}
                            <Box>
                                <Typography
                                    variant="body2"
                                    sx={{ color: "grey.700", fontWeight: "medium", mb: 1 }}
                                >
                                    Vị trí cuối *
                                </Typography>
                                <Autocomplete
                                    options={areas}
                                    getOptionLabel={(option) => option.name}
                                    value={selectedArea}
                                    onChange={(event, newValue) => {
                                        setSelectedArea(newValue);
                                        handleInputChange("lastLocationId", newValue ? newValue.id : "");
                                        console.log("Selected area:", newValue); // Debug log
                                    }}
                                    disabled={isLoadingAreas}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder={isLoadingAreas ? "Đang tải khu vực..." : "Chọn khu vực"}
                                            size="small"
                                            error={!!errors.lastLocationId}
                                            helperText={errors.lastLocationId}
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {isLoadingAreas ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                            sx={{
                                                bgcolor: "background.paper",
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: 2,
                                                    "& fieldset": {
                                                        borderColor: errors.lastLocationId ? "error.main" : "grey.300",
                                                    },
                                                    "&:hover fieldset": {
                                                        borderColor: errors.lastLocationId ? "error.main" : "grey.500",
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "primary.main",
                                                        boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                                                    },
                                                },
                                                "& .MuiInputBase-input": {
                                                    color: "grey.700",
                                                    px: 1.5,
                                                    py: 1,
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Box>
                        </Box>
                    </Box>

                    {/* Thông Tin Làm Việc */}
                    <Box sx={{ mb: 2 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                color: "grey.900",
                                mb: 2,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <ShipperIcon sx={{ fontSize: 20 }} />
                            Thông Tin Làm Việc
                        </Typography>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {/* Ca làm việc */}
                            <Box>
                                <Typography
                                    variant="body2"
                                    sx={{ color: "grey.700", fontWeight: "medium", mb: 1 }}
                                >
                                    Ca Làm Việc *
                                </Typography>
                                <Autocomplete
                                    options={shiftOptions}
                                    getOptionLabel={(option) => option.label}
                                    value={selectedShift}
                                    onChange={(event, newValue) => {
                                        setSelectedShift(newValue);
                                        handleInputChange("startWorkTime", newValue ? newValue.start : "");
                                        handleInputChange("endWorkTime", newValue ? newValue.end : "");
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Chọn ca làm việc"
                                            size="small"
                                            error={!!errors.startWorkTime || !!errors.endWorkTime}
                                            helperText={errors.startWorkTime || errors.endWorkTime}
                                            sx={{
                                                bgcolor: "background.paper",
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: 2,
                                                    "& fieldset": {
                                                        borderColor:
                                                            errors.startWorkTime || errors.endWorkTime
                                                                ? "error.main"
                                                                : "grey.300",
                                                    },
                                                    "&:hover fieldset": {
                                                        borderColor:
                                                            errors.startWorkTime || errors.endWorkTime
                                                                ? "error.main"
                                                                : "grey.500",
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "primary.main",
                                                        boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                                                    },
                                                },
                                                "& .MuiInputBase-input": {
                                                    color: "grey.700",
                                                    px: 1.5,
                                                    py: 1,
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Box>
                        </Box>
                    </Box>

                    <DialogActions
                        sx={{
                            p: 3,
                            pt: 0, // Loại bỏ padding trên để sát với nội dung
                            borderTop: 1,
                            borderColor: "grey.200",
                            bgcolor: "background.paper",
                            position: "sticky",
                            bottom: 0,
                            zIndex: 10, // Đảm bảo DialogActions luôn ở trên cùng khi cuộn
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 1,
                        }}
                    >
                        <Button
                            onClick={handleClose}
                            sx={{
                                px: 3,
                                py: 1,
                                bgcolor: "grey.100",
                                color: "grey.700",
                                borderRadius: 2,
                                "&:hover": { bgcolor: "grey.200" },
                            }}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            sx={{
                                px: 3,
                                py: 1,
                                bgcolor: "primary.main",
                                color: "white",
                                borderRadius: 2,
                                "&:hover": { bgcolor: "primary.dark" },
                                "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
                            }}
                        >
                            {isSubmitting ? "Đang Lưu..." : editingShipper ? "Cập Nhật Shipper" : "Thêm Shipper"}
                        </Button>
                    </DialogActions>
                </form>
            </DialogContent>
        </Dialog>
    );
}