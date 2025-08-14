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
  Input,
  MenuItem,
  Select,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { Close, Category as CategoryIcon } from "@mui/icons-material";
import { useCategoryForm, type CategoryFormData } from "./seg/utlis";
import cloudinaryApi from "../../../api/cloudinary.api";
import type { Category } from "./seg/utlis";
import { useToastify } from "../../../hooks/useToastify";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: CategoryFormData) => void;
  editCategory?: Category | null;
}

export function AddCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  editCategory,
}: AddCategoryModalProps) {
  const { formData, errors, isSubmitting, handleInputChange, handleSubmit } =
    useCategoryForm(editCategory);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(editCategory?.image?.url || null);
  const [imageData, setImageData] = useState<CategoryFormData["image"] | null>(
    editCategory?.image || null
  );
  const  toast  = useToastify();

  // Reset form và hình ảnh khi editCategory thay đổi
  useEffect(() => {
    if (editCategory) {
      handleInputChange("name", editCategory.name || "");
      handleInputChange("status", editCategory.status || "");
      setImagePreview(editCategory.image?.url || null);
      setImageData(editCategory.image || null);
      setSelectedFile(null);
    } else {
      handleInputChange("name", "");
      handleInputChange("status", "");
      setImagePreview(null);
      setImageData(null);
      setSelectedFile(null);
    }
  }, [editCategory]);

  // Xử lý khi chọn file hình ảnh
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      setImageData(null);
    }
  };

  // Xử lý submit form
  const onFormSubmit = async (formData: CategoryFormData) => {
    try {
      console.log("onFormSubmit called with:", formData);
      let uploadedImage = imageData || {
        id: "",
        url: "",
        thumbUrl: "",
        name: "",
      };

      // Upload hình ảnh nếu có file được chọn
      if (selectedFile) {
        console.log("Uploading image to Cloudinary...");
        const response = await cloudinaryApi.upload(selectedFile, editCategory?.image?.id);
        console.log("cloudinaryApi.upload response:", response.data);
        uploadedImage = {
          id: response.data.id,
          url: response.data.url,
          thumbUrl: response.data.thumbnailUrl || "", // Đảm bảo thumbUrl được gửi
          name: response.data.name || "",
        };
        if (!uploadedImage.id || !uploadedImage.url) {
          throw new Error("Upload hình ảnh thất bại");
        }
      }

      // Gửi dữ liệu với image
      const categoryData: CategoryFormData = {
        ...formData,
        image: uploadedImage,
      };

      console.log("Submitting category data:", categoryData);
      await onSubmit(categoryData);
      onClose();
    } catch (error: any) {
      console.error("Lỗi khi submit danh mục:", error);
      toast.error(error.message || "Lỗi khi submit danh mục");
    }
  };

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
            {editCategory ? "Sửa Danh Mục" : "Thêm Danh Mục Mới"}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "grey.500" }}
          >
            {editCategory ? "Cập nhật thông tin danh mục" : "Tạo danh mục mới"}
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
        <form id="category-form" onSubmit={(e) => handleSubmit(e, onFormSubmit)}>
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
              <CategoryIcon sx={{ fontSize: 20 }} />
              Thông Tin Cơ Bản
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Tên Danh Mục */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "grey.700",
                    fontWeight: "medium",
                    mb: 1,
                  }}
                >
                  Tên Danh Mục *
                </Typography>
                <TextField
                  fullWidth
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nhập tên danh mục"
                  size="small"
                  error={!!errors.name}
                  sx={{
                    bgcolor: "background.paper",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "& fieldset": {
                        borderColor: errors.name ? "error.main" : "grey.300",
                      },
                      "&:hover fieldset": {
                        borderColor: errors.name ? "error.main" : "grey.500",
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
                {errors.name && (
                  <Typography
                    variant="caption"
                    sx={{ color: "error.main", mt: 0.5 }}
                  >
                    {errors.name}
                  </Typography>
                )}
              </Box>

              {/* Trạng Thái */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "grey.700",
                    fontWeight: "medium",
                    mb: 1,
                  }}
                >
                  Trạng Thái *
                </Typography>
                <FormControl fullWidth size="small" error={!!errors.status}>
                  <Select
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value === 'true')}
                    displayEmpty
                    sx={{
                      bgcolor: "background.paper",
                      borderRadius: 2,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: errors.status ? "error.main" : "grey.300",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: errors.status ? "error.main" : "grey.500",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                        boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                      },
                    }}
                  >
                    <MenuItem value="true">Hoạt động</MenuItem>
                    <MenuItem value="false">Không hoạt động</MenuItem>
                  </Select>
                  {errors.status && (
                    <FormHelperText error>{errors.status}</FormHelperText>
                  )}
                </FormControl>
              </Box>

              {/* Upload Hình Ảnh */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "grey.700",
                    fontWeight: "medium",
                    mb: 1,
                  }}
                >
                  Hình Ảnh Danh Mục
                </Typography>
                <Input
                  type="file"
                  inputProps={{ accept: "image/*" }}
                  onChange={handleFileChange}
                  sx={{
                    mb: 1,
                    "& input": {
                      py: 1,
                      px: 1.5,
                      borderRadius: 2,
                      border: `1px solid ${errors.image ? "error.main" : "grey.300"}`,
                      bgcolor: "background.paper",
                      "&:hover": {
                        borderColor: errors.image ? "error.main" : "grey.500",
                      },
                    },
                  }}
                />
                {imagePreview && (
                  <Box sx={{ mt: 1 }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: "100px",
                        maxHeight: "100px",
                        borderRadius: "4px",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                )}
                {errors.image && (
                  <Typography
                    variant="caption"
                    sx={{ color: "error.main", mt: 0.5 }}
                  >
                    {typeof errors.image === 'string' ? errors.image : 'Có lỗi xảy ra với hình ảnh'}
                  </Typography>
                )}
              </Box>
            </Box>
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
          form="category-form"
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
          {isSubmitting ? "Đang Lưu..." : editCategory ? "Cập Nhật Danh Mục" : "Thêm Danh Mục"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}