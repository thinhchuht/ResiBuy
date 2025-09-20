import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useToastify } from "../../hooks/useToastify";
import userApi from "../../api/user.api";
interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newUser: any) => void; // Cập nhật kiểu của onSuccess
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToastify();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      fullName: "",
      phoneNumber: "",
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required("Vui lòng nhập họ tên"),
      phoneNumber: Yup.string()
        .matches(/^(0[0-9]{9})$/, "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0")
        .required("Vui lòng nhập số điện thoại"),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const payload = {
          fullName: values.fullName,
          phoneNumber: values.phoneNumber,
        };
        console.log("Creating user with payload:", payload);
        const response = await userApi.createUser2(payload);
        if (!response.error) {
          toast.success("Tạo người dùng thành công!");
          formik.resetForm();
          onClose();
          if (onSuccess) onSuccess({ id: response.id, fullName: values.fullName, phoneNumber: values.phoneNumber }); // Trả về thông tin người dùng mới
        } else {
          throw new Error(response.error.message || "Tạo người dùng thất bại");
        }
      } catch (error: any) {
        console.error("Create user error:", error);
        toast.error(error.message || "Lỗi khi tạo người dùng");
      } finally {
        setIsSubmitting(false);
      }
    },
  });


  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          maxWidth: "400px",
          borderRadius: 2,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "grey.200",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" sx={{ color: "grey.900", fontWeight: "medium" }}>
          Tạo Người Dùng Mới
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: "grey.400",
            "&:hover": { color: "grey.600", bgcolor: "grey.100" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: "grey.700", fontWeight: "medium", mb: 1 }}>
              Họ Tên *
            </Typography>
            <TextField
              fullWidth
              id="fullName"
              name="fullName"
              value={formik.values.fullName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Nhập họ tên"
              size="small"
              error={formik.touched.fullName && Boolean(formik.errors.fullName)}
              helperText={formik.touched.fullName && formik.errors.fullName}
              disabled={isSubmitting}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "& fieldset": {
                    borderColor: formik.touched.fullName && formik.errors.fullName ? "error.main" : "grey.300",
                  },
                  "&:hover fieldset": {
                    borderColor: formik.touched.fullName && formik.errors.fullName ? "error.main" : "grey.500",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "primary.main",
                    boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.3)",
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

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: "grey.700", fontWeight: "medium", mb: 1 }}>
              Số Điện Thoại *
            </Typography>
            <TextField
              fullWidth
              id="phoneNumber"
              name="phoneNumber"
              value={formik.values.phoneNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Nhập số điện thoại"
              size="small"
              error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
              helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
              disabled={isSubmitting}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "& fieldset": {
                    borderColor: formik.touched.phoneNumber && formik.errors.phoneNumber ? "error.main" : "grey.300",
                  },
                  "&:hover fieldset": {
                    borderColor: formik.touched.phoneNumber && formik.errors.phoneNumber ? "error.main" : "grey.500",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "primary.main",
                    boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.3)",
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
        </form>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "grey.200",
          display: "flex",
          justifyContent: "flex-end",
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          disabled={isSubmitting}
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
          form="create-user-form"
          disabled={isSubmitting}
          onClick={() => formik.handleSubmit()}
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
          {isSubmitting ? <CircularProgress size="20" color="inherit" /> : "Tạo"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserModal;