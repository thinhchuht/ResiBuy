import { Avatar, Box, Button, TextField, Typography } from "@mui/material";
import { Person } from "@mui/icons-material";
import { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import userApi from "../../api/user.api";
import { useAuth } from "../../contexts/AuthContext";
import { useToastify } from "../../hooks/useToastify";

interface PersonalInfoSectionProps {
  isAdmin: boolean;
  formatDate: (dateStr: string | undefined) => string;
  maskMiddle: (str: string | undefined) => string;
}

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Email không hợp lệ")
    .required("Email là bắt buộc"),
  dateOfBirth: Yup.date()
    .max(new Date(), "Ngày sinh không thể lớn hơn ngày hiện tại")
    .required("Ngày sinh là bắt buộc"),
});

const PersonalInfoSection = ({ isAdmin, formatDate, maskMiddle }: PersonalInfoSectionProps) => {
  const { user, setUser } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const toast = useToastify();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 2MB!");
        return;
      }

      if (!["image/jpeg", "image/png"].includes(file.type)) {
        toast.error("Chỉ chấp nhận file ảnh định dạng JPEG hoặc PNG!");
        return;
      }

      setAvatarFile(file);
      setAvatar(URL.createObjectURL(file));
    }
  };

  const initialValues = {
    email: user?.email || "",
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.substring(0, 10) : "1990-01-01",
  };

  const handleSubmit = async (values: typeof initialValues) => {
    if (!user) return;

    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("dateOfBirth", values.dateOfBirth);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    try {
      const response = await userApi.updateUser(user.id, formData);
      if (response.data) {
        setUser(response.data);
        toast.success("Cập nhật thông tin thành công!");
      }
    } catch {
      toast.error("Cập nhật thông tin thất bại!");
    }
  };

  return (
    <Box sx={{ display: { xs: "block", md: "flex" }, gap: 4 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, values, handleChange, handleBlur }) => (
            <Form>
              <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
                  ID
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {user?.id || "-"}
                </Typography>
              </Box>
              <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
                  Họ và tên
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {user?.fullName || "-"}
                </Typography>
              </Box>
              <Field
                as={TextField}
                name="email"
                label="Email"
                variant="outlined"
                fullWidth
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                disabled={isAdmin}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": {
                      borderColor: "#e91e63",
                    },
                  },
                }}
              />
              <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
                  Số điện thoại
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {maskMiddle(user?.phoneNumber) || "-"}
                </Typography>
              </Box>
              <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
                  CCCD/CMND
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {maskMiddle(user?.identityNumber) || "-"}
                </Typography>
              </Box>
              <Field
                as={TextField}
                name="dateOfBirth"
                label="Ngày sinh"
                type="date"
                variant="outlined"
                fullWidth
                value={values.dateOfBirth}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.dateOfBirth && Boolean(errors.dateOfBirth)}
                helperText={touched.dateOfBirth && errors.dateOfBirth}
                disabled={isAdmin}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": {
                      borderColor: "#e91e63",
                    },
                  },
                }}
                InputLabelProps={{ shrink: true }}
              />
              <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
                  Ngày tạo tài khoản
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {formatDate(user?.createdAt)}
                </Typography>
              </Box>
              <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
                  Ngày cập nhật
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {formatDate(user?.updatedAt)}
                </Typography>
              </Box>
              <Button
                type="submit"
                variant="contained"
                disabled={isAdmin}
                sx={{
                  mt: 2,
                  px: 5,
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 2,
                  backgroundColor: "#FF6B6B",
                  boxShadow: "0 3px 12px rgba(233, 30, 99, 0.3)",
                  "&:hover": {
                    backgroundColor: "#FF5C5C",
                    boxShadow: "0 6px 20px rgba(233, 30, 99, 0.4)",
                  },
                }}
              >
                Lưu
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
      {/* Right: Avatar upload */}
      <Box
        sx={{
          minWidth: 180,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          mt: { xs: 4, md: 0 },
        }}
      >
        <Avatar
          src={avatar ? avatar :user?.avatar.url || undefined}
          sx={{
            width: 140,
            height: 140,
            mb: 2,
            bgcolor: "#fce4ec",
            color: "#e91e63",
            fontSize: 64,
            border: "4px solid #fce4ec",
            boxShadow: "0 4px 12px rgba(233, 30, 99, 0.2)",
          }}
        >
          {!user?.avatar && <Person fontSize="inherit" />}
        </Avatar>
        <Button
          variant="outlined"
          component="label"
          disabled={isAdmin}
          sx={{
            mb: 1,
            borderRadius: 2,
            borderColor: "#e91e63",
            color: "#e91e63",
            "&:hover": {
              borderColor: "#c2185b",
              backgroundColor: "rgba(233, 30, 99, 0.04)",
            },
          }}
        >
          Chọn Ảnh
          <input
            hidden
            accept="image/jpeg,image/png"
            type="file"
            onChange={handleAvatarChange}
          />
        </Button>
        <Typography variant="caption" color="text.secondary" align="center">
          Dung lượng file tối đa 2 MB
          <br />
          Định dạng: JPEG, PNG
        </Typography>
      </Box>
    </Box>
  );
};

export default PersonalInfoSection;
