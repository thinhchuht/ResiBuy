import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Box, Button, TextField, Typography, Paper, InputAdornment, IconButton, Alert, CircularProgress } from "@mui/material";
import { Visibility, VisibilityOff, Phone, Lock } from "@mui/icons-material";
import { useToastify } from "../../hooks/useToastify";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/Logo.png";
import background from "../../assets/login-background.jpg";
interface LoginError {
  message?: string;
}

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToastify();

  const formik = useFormik({
    initialValues: {
      phoneNumber: "",
      password: "",
    },
    validationSchema: Yup.object({
      password: Yup.string().min(5, "Mật khẩu phải ít nhất 6 kí tự").required("Vui lòng điền mật khẩu"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      setError("");
      try {
        const result = await login(values.phoneNumber, values.password);
        if (result.success) {
          toast.success("Login successful!");
          navigate("/home");
        } else {
          const loginError = result.error as LoginError;
          setError(loginError?.message || "Số điện thoại hoặc mật khẩu không hợp lệ");
          toast.error(loginError?.message || "Số điện thoại hoặc mật khẩu không hợp lệ");
        }
      } catch (err: unknown) {
        const error = err as LoginError;
        const errorMessage =
          error.message?.includes("ERR_CONNECTION_REFUSED") || error.message?.includes("ERR_SSL_PROTOCOL_ERROR")
            ? "Không thể kết nối đến máy chủ. Thử lại sau"
            : error?.message || "An unexpected error occurred.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: `url(${background})`,
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(2px)",
      }}>
      <Paper
        elevation={10}
        sx={{
          width: 350,
          p: 4,
          borderRadius: 3,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2 }}>
          <img src={logo} alt="ResiBuy" style={{ width: "100px", height: "100px" }} />
          <Box>
            {" "}
            <Typography color="text.secondary" mb={2} sx={{ fontWeight: 600 }}>
              Trải nghiệm mua sắm tại nhà
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: "100%" }}>
          <TextField
            fullWidth
            margin="normal"
            id="phoneNumber"
            name="phoneNumber"
            label="Số điện thoại"
            autoComplete="tel"
            autoFocus
            value={formik.values.phoneNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
            helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            margin="normal"
            id="password"
            name="password"
            label="Mật khẩu"
            variant="outlined"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 3, mb: 1, py: 1.5, borderRadius: 15, background: "linear-gradient(to right, #EB5C60, #F28B50, #FFD190)" }}
            disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Đăng nhập"}
          </Button>

          <Typography variant="body2" color="text.secondary" align="center" mt={2} fontSize={12} fontStyle={"italic"}>
            Liên hệ với Ban quản lí tòa nhà của bạn để được tạo tài khoản
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
