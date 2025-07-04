import { useEffect } from "react";
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
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Close, LocalShipping as ShipperIcon } from "@mui/icons-material";
import { useShipperForm } from "./seg/utlis";
import type { Shipper, User } from "../../../types/models";

interface AddShipperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (shipper: Shipper, user: User) => void;
  editingShipper?: Shipper | null;
  editingUser?: User | null;
}

export function AddShipperModal({
  isOpen,
  onClose,
  onSubmit,
  editingShipper,
  editingUser,
}: AddShipperModalProps) {
  const { formData, errors, isSubmitting, handleInputChange, handleSubmit } =
    useShipperForm(editingShipper, editingUser);

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
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
          onClick={onClose}
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
                    },
                  }}
                />
              </Grid>

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
                    },
                  }}
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
                <TextField
                  fullWidth
                  value={formData.startWorkTime}
                  onChange={(e) => handleInputChange("startWorkTime", e.target.value)}
                  size="small"
                  error={!!errors.startWorkTime}
                  helperText={errors.startWorkTime}
                  type="time"
                  InputLabelProps={{ shrink: true }}
                  sx={{
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
                <TextField
                  fullWidth
                  value={formData.endWorkTime}
                  onChange={(e) => handleInputChange("endWorkTime", e.target.value)}
                  size="small"
                  error={!!errors.endWorkTime}
                  helperText={errors.endWorkTime}
                  type="time"
                  InputLabelProps={{ shrink: true }}
                  sx={{
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
                  }}
                />
              </Grid>

              {/* Trạng thái sẵn sàng */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isAvailable}
                      onChange={(e) => handleInputChange("isAvailable", e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Sẵn Sàng Giao Hàng"
                  sx={{ color: "grey.700" }}
                />
              </Grid>
            </Grid>
          </Box>
        </form>
      </DialogContent>

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
          onClick={onClose}
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
          onClick={(e) => handleSubmit(e as any, onSubmit)}
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
    </Dialog>
  );
}