import { Box, Button, TextField, Typography, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import type { User } from "../../types/models";
import userApi from "../../api/user.api";
import { useToastify } from "../../hooks/useToastify";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useState } from "react";

interface PasswordChangeSectionProps {
  user: User | null;
  isAdmin: boolean;
  maskMiddle: (str: string | undefined) => string;
}

const validationSchema = Yup.object().shape({
  oldPassword: Yup.string().required("Vui lòng nhập mật khẩu hiện tại"),
  newPassword: Yup.string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .required("Vui lòng nhập mật khẩu mới"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Mật khẩu không khớp")
    .required("Vui lòng xác nhận mật khẩu mới"),
});

const PasswordChangeSection = ({
  user,
  isAdmin,
  maskMiddle,
}: PasswordChangeSectionProps) => {
  const toast = useToastify();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initialValues = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const handleSubmit = async (values: typeof initialValues) => {
    if (!user) return;
    const response = await userApi.changePassword(
      user.id,
      values.oldPassword,
      values.newPassword
    );
    if (response.data) {
      toast.success("Đổi mật khẩu thành công!");
    }
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
          Số điện thoại
        </Typography>
        <Typography variant="body1" fontWeight={500}>
          {maskMiddle(user?.phoneNumber) || "-"}
        </Typography>
      </Box>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, values, handleChange, handleBlur }) => (
          <Form>
            <Field
              as={TextField}
              name="oldPassword"
              label="Mật khẩu hiện tại"
              type={showOldPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              value={values.oldPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.oldPassword && Boolean(errors.oldPassword)}
              helperText={touched.oldPassword && errors.oldPassword}
              disabled={isAdmin}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      edge="end"
                    >
                      {showOldPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
            <Field
              as={TextField}
              name="newPassword"
              label="Mật khẩu mới"
              type={showNewPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              value={values.newPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.newPassword && Boolean(errors.newPassword)}
              helperText={touched.newPassword && errors.newPassword}
              disabled={isAdmin}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
            <Field
              as={TextField}
              name="confirmPassword"
              label="Xác nhận mật khẩu mới"
              type={showConfirmPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.confirmPassword && Boolean(errors.confirmPassword)}
              helperText={touched.confirmPassword && errors.confirmPassword}
              disabled={isAdmin}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
              Đổi mật khẩu
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default PasswordChangeSection;
