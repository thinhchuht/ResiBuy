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
  Grid,
  Autocomplete,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { Close, LocalShipping as ShipperIcon } from "@mui/icons-material";
import { useShipperForm } from "./seg/utlis";
import areaApi from "../../../api/area.api";
import type { Shipper } from "../../../types/models";
import { format, parse } from "date-fns";

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

export function AddShipperModal({
  isOpen,
  onClose,
  onSubmit,
  editingShipper,
}: AddShipperModalProps) {
  const { formData, errors, isSubmitting, handleInputChange, handleSubmit, resetForm } = useShipperForm(editingShipper);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);

  // Lấy danh sách khu vực
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await areaApi.getAll(false);
        console.log("Fetch areas response:", response);
        setAreas(response);
      } catch (error: any) {
        console.error("Fetch areas error:", error);
      }
    };
    fetchAreas();
  }, []);

  // Cập nhật selectedArea khi editingShipper hoặc areas thay đổi
  useEffect(() => {
    if (editingShipper && formData.lastLocationId && areas.length > 0) {
      const area = areas.find((a) => a.id === formData.lastLocationId);
      setSelectedArea(area || null);
    } else {
      setSelectedArea(null);
    }
  }, [editingShipper, formData.lastLocationId, areas]);

  // Reset form và selectedArea khi đóng modal
  const handleClose = () => {
    resetForm();
    setSelectedArea(null);
    onClose();
  };

  // Chuyển đổi chuỗi HH:mm thành đối tượng Date để sử dụng trong TimePicker
  const parseTimeToDate = (time: string): Date | null => {
    if (!time) return null;
    return parse(time, "HH:mm", new Date());
  };

  // Xử lý thay đổi thời gian từ TimePicker
  const handleTimeChange = (field: keyof ShipperFormData, newTime: Date | null) => {
    if (newTime) {
      const formattedTime = format(newTime, "HH:mm");
      handleInputChange(field, formattedTime);
    } else {
      handleInputChange(field, "");
    }
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
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 3,
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

            <Grid container spacing={2}>
              {/* Email */}
              <Grid item xs={12}>
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
              </Grid>

              {/* Mật khẩu (chỉ khi tạo mới) */}
              {!editingShipper && (
                <Grid item xs={12}>
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
                </Grid>
              )}

              {/* Họ tên */}
              <Grid item xs={12}>
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
              </Grid>

              {/* Số điện thoại */}
              <Grid item xs={12} md={6}>
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
              </Grid>

              {/* Ngày sinh */}
              <Grid item xs={12} md={6}>
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
              </Grid>

              {/* CMND/CCCD */}
              <Grid item xs={12}>
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
              </Grid>

              {/* Khu vực */}
              <Grid item xs={12}>
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
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Chọn khu vực"
                      size="small"
                      error={!!errors.lastLocationId}
                      helperText={errors.lastLocationId}
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
              </Grid>
            </Grid>
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

            <Grid container spacing={2}>
              {/* Thời gian bắt đầu */}
              <Grid item xs={12} md={6}>
                <Typography
                  variant="body2"
                  sx={{ color: "grey.700", fontWeight: "medium", mb: 1 }}
                >
                  Thời Gian Bắt Đầu *
                </Typography>
                <TimePicker
                  value={parseTimeToDate(formData.startWorkTime)}
                  onChange={(newTime) => handleTimeChange("startWorkTime", newTime)}
                  format="HH:mm"
                  ampm={false}
                  timeSteps={{ minutes: 5 }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      error: !!errors.startWorkTime,
                      helperText: errors.startWorkTime,
                      sx: {
                        bgcolor: "background.paper",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "& fieldset": {
                            borderColor: errors.startWorkTime ? "error.main" : "grey.300",
                          },
                          "&:hover fieldset": {
                            borderColor: errors.startWorkTime ? "error.main" : "grey.500",
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
                      },
                    },
                  }}
                />
              </Grid>

              {/* Thời gian kết thúc */}
              <Grid item xs={12} md={6}>
                <Typography
                  variant="body2"
                  sx={{ color: "grey.700", fontWeight: "medium", mb: 1 }}
                >
                  Thời Gian Kết Thúc *
                </Typography>
                <TimePicker
                  value={parseTimeToDate(formData.endWorkTime)}
                  onChange={(newTime) => handleTimeChange("endWorkTime", newTime)}
                  format="HH:mm"
                  ampm={false}
                  timeSteps={{ minutes: 5 }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      error: !!errors.endWorkTime,
                      helperText: errors.endWorkTime,
                      sx: {
                        bgcolor: "background.paper",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "& fieldset": {
                            borderColor: errors.endWorkTime ? "error.main" : "grey.300",
                          },
                          "&:hover fieldset": {
                            borderColor: errors.endWorkTime ? "error.main" : "grey.500",
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
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          <DialogActions
            sx={{
              p: 3,
              borderTop: 1,
              borderColor: "grey.200",
              bgcolor: "background.paper",
              position: "sticky",
              bottom: 0,
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