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
  Checkbox,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import {
  Close,
  Store as StoreIcon,
  Email,
  Phone,
  LocationOn,
  Info,
  Image,
  ToggleOff,
} from "@mui/icons-material";
import { useStoreForm } from "../../../components/admin/Store/seg/utlis";
import type { Store } from "../../../types/models";

interface AddStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (store: Store) => void;
  editStore?: Store | null;
}

export function AddStoreModal({
  isOpen,
  onClose,
  onSubmit,
  editStore,
}: AddStoreModalProps) {
  const { formData, errors, isSubmitting, handleInputChange, handleSubmit } =
    useStoreForm(editStore);

  // Reset form when editStore changes
  useEffect(() => {
    if (editStore) {
      Object.entries(formData).forEach(([key]) => {
        handleInputChange(key, editStore[key as keyof Store] || "");
      });
    }
  }, [editStore]);

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          maxWidth: "48rem", // Thay max-w-2xl
          height: "100%",
          margin: 0,
          borderRadius: 0,
          boxShadow: 24, // Thay shadow-2xl
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease-in-out", // Thay transition-transform duration-300 ease-in-out
        },
      }}
      PaperProps={{ sx: { bgcolor: "background.paper" } }}
      
    >
      {/* Backdrop */}
      {/* <Box
        sx={{
          position: "fixed",
          inset: 0,
          bgcolor: "rgba(0, 0, 0, 0.6)", // Thay bg-black bg-opacity-60
          zIndex: 9998,
          transition: "opacity 0.3s", // Thay transition-opacity duration-300
          opacity: isOpen ? 1 : 0,
        }}
        onClick={onClose}
      /> */}

      <DialogTitle
        sx={{
          p: 3, // Thay p-6
          borderBottom: 1,
          borderColor: "grey.200", // Thay border-b border-gray-200
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
            sx={{ color: "grey.900", fontWeight: "medium" }} // Thay text-xl font-semibold text-gray-900
          >
            {editStore ? "Sửa Cửa Hàng" : "Thêm Cửa Hàng Mới"}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "grey.500" }} // Thay text-sm text-gray-500
          >
            {editStore ? "Cập nhật thông tin cửa hàng" : "Tạo cửa hàng mới"}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "grey.400", // Thay text-gray-400
            bgcolor: "background.paper",
            p: 1, // Thay p-2
            borderRadius: 2, // Thay rounded-lg
            "&:hover": {
              color: "grey.600", // Thay hover:text-gray-600
              bgcolor: "grey.100", // Thay hover:bg-gray-100
            },
          }}
        >
          <Close sx={{ fontSize: 20 }} /> {/* Thay h-5 w-5 */}
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 3, // Thay p-6
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 3, // Thay space-y-6
        }}
      >
        <form onSubmit={(e) => handleSubmit(e, onSubmit)}>
          {/* Basic Information */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              sx={{
                color: "grey.900", // Thay text-lg font-medium text-gray-900
                mb: 2, // Thay mb-4
                display: "flex",
                alignItems: "center",
                gap: 1, // Thay gap-2
              }}
            >
              <StoreIcon sx={{ fontSize: 20 }} /> {/* Thay w-5 h-5 */}
              Thông Tin Cơ Bản
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Store Name */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "grey.700", // Thay text-gray-700
                    fontWeight: "medium",
                    mb: 1, // Thay mb-2
                  }}
                >
                  Tên Cửa Hàng *
                </Typography>
                <TextField
                  fullWidth
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nhập tên cửa hàng"
                  size="small"
                  error={!!errors.name}
                  sx={{
                    bgcolor: "background.paper", // Thay bg-white
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2, // Thay rounded-lg
                      "& fieldset": {
                        borderColor: errors.name ? "error.main" : "grey.300", // Thay border-red-500, border-gray-300
                      },
                      "&:hover fieldset": {
                        borderColor: errors.name ? "error.main" : "grey.500",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "primary.main", // Thay focus:ring-blue-500 focus:border-transparent
                        boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)", // Thay focus:ring-2
                      },
                    },
                    "& .MuiInputBase-input": {
                      color: "grey.700", // Thay text-gray-400
                      px: 1.5, // Thay px-3
                      py: 1, // Thay py-2
                    },
                  }}
                />
                {errors.name && (
                  <Typography
                    variant="caption"
                    sx={{ color: "error.main", mt: 0.5 }} // Thay text-red-500 text-sm mt-1
                  >
                    {errors.name}
                  </Typography>
                )}
              </Box>

              {/* Email and Phone */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, // Thay grid-cols-1 md:grid-cols-2
                  gap: 2, // Thay gap-4
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "grey.700",
                      fontWeight: "medium",
                      mb: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5, // Thay gap-1
                    }}
                  >
                    <Email sx={{ fontSize: 16 }} /> {/* Thay w-4 h-4 */}
                    Địa Chỉ Email *
                  </Typography>
                  <TextField
                    fullWidth
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="store@email.com"
                    size="small"
                    error={!!errors.email}
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
                  {errors.email && (
                    <Typography
                      variant="caption"
                      sx={{ color: "error.main", mt: 0.5 }}
                    >
                      {errors.email}
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "grey.700",
                      fontWeight: "medium",
                      mb: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Phone sx={{ fontSize: 16 }} /> {/* Thay w-4 h-4 */}
                    Số Điện Thoại *
                  </Typography>
                  <TextField
                    fullWidth
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    placeholder="+84 123 456 789"
                    size="small"
                    error={!!errors.phoneNumber}
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
                  {errors.phoneNumber && (
                    <Typography
                      variant="caption"
                      sx={{ color: "error.main", mt: 0.5 }}
                    >
                      {errors.phoneNumber}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Address */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "grey.700",
                    fontWeight: "medium",
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <LocationOn sx={{ fontSize: 16 }} /> {/* Thay w-4 h-4 */}
                  Địa Chỉ *
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Nhập địa chỉ đầy đủ"
                  error={!!errors.address}
                  sx={{
                    bgcolor: "background.paper",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "& fieldset": {
                        borderColor: errors.address ? "error.main" : "grey.300",
                      },
                      "&:hover fieldset": {
                        borderColor: errors.address ? "error.main" : "grey.500",
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
                {errors.address && (
                  <Typography
                    variant="caption"
                    sx={{ color: "error.main", mt: 0.5 }}
                  >
                    {errors.address}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Store Settings */}
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
              <Info sx={{ fontSize: 20 }} /> {/* Thay w-5 h-5 */}
              Cài Đặt Cửa Hàng
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Description */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "grey.700",
                    fontWeight: "medium",
                    mb: 1,
                  }}
                >
                  Mô Tả
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Nhập mô tả cửa hàng"
                  sx={{
                    bgcolor: "background.paper",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "& fieldset": {
                        borderColor: "grey.300",
                      },
                      "&:hover fieldset": {
                        borderColor: "grey.500",
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
                <Typography
                  variant="caption"
                  sx={{ color: "grey.500", mt: 0.5 }} // Thay text-xs text-gray-500 mt-1
                >
                  Tùy chọn: Mô tả ngắn về cửa hàng
                </Typography>
              </Box>

              {/* Image URL */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "grey.700",
                    fontWeight: "medium",
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Image sx={{ fontSize: 16 }} /> {/* Thay w-4 h-4 */}
                  URL Hình Ảnh
                </Typography>
                <TextField
                  fullWidth
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  size="small"
                  sx={{
                    bgcolor: "background.paper",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "& fieldset": {
                        borderColor: "grey.300",
                      },
                      "&:hover fieldset": {
                        borderColor: "grey.500",
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
                <Typography
                  variant="caption"
                  sx={{ color: "grey.500", mt: 0.5 }}
                >
                  Tùy chọn: URL đến hình ảnh cửa hàng
                </Typography>
              </Box>

              {/* Active Status */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "grey.700",
                    fontWeight: "medium",
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <ToggleOff sx={{ fontSize: 16 }} /> {/* Thay w-4 h-4 */}
                  Trạng Thái Hoạt Động
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange("isActive", e.target.checked)}
                      sx={{
                        color: "grey.300", // Thay border-gray-300
                        "&.Mui-checked": {
                          color: "primary.main", // Thay text-blue-600
                        },
                        "&.Mui-focused": {
                          boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)", // Thay focus:ring-blue-500
                        },
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{ color: "grey.700" }} // Thay text-sm text-gray-700
                    >
                      Cửa hàng đang hoạt động
                    </Typography>
                  }
                />
                <Typography
                  variant="caption"
                  sx={{ color: "grey.500", mt: 0.5 }}
                >
                  Bật hoặc tắt khả năng hiển thị cửa hàng
                </Typography>
              </Box>
            </Box>
          </Box>
        </form>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3, // Thay pt-6
          borderTop: 1,
          borderColor: "grey.200", // Thay border-t border-gray-200
          bgcolor: "background.paper",
          position: "sticky",
          bottom: 0,
          display: "flex",
          justifyContent: "flex-end",
          gap: 1, // Thay space-x-3
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            px: 3, // Thay px-6
            py: 1, // Thay py-2
            bgcolor: "grey.100", // Thay bg-gray-100
            color: "grey.700", // Thay text-gray-700
            borderRadius: 2, // Thay rounded-lg
            "&:hover": { bgcolor: "grey.200" }, // Thay hover:bg-gray-200
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
            bgcolor: "primary.main", // Thay bg-blue-600
            color: "white", // Thay text-white
            borderRadius: 2,
            "&:hover": { bgcolor: "primary.dark" }, // Thay hover:bg-blue-700
            "&:disabled": { opacity: 0.5, cursor: "not-allowed" }, // Thay disabled:opacity-50 disabled:cursor-not-allowed
          }}
        >
          {isSubmitting ? "Đang Lưu..." : editStore ? "Cập Nhật Cửa Hàng" : "Thêm Cửa Hàng"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}