import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
} from "@mui/material";
import { Visibility, VisibilityOff, Phone, Lock } from "@mui/icons-material";
import { useToastify } from "../../hooks/useToastify";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/images/Logo.png";
import background from "../../assets/images/login-background.jpg";
import ConfirmCodeModal from "../ConfirmCodeModal";
import authApi from "../../api/auth.api";

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
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [phoneForReset, setPhoneForReset] = useState("");
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  const formik = useFormik({
    initialValues: {
      phoneNumber: "",
      password: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(5, "Mật khẩu phải ít nhất 6 kí tự")
        .required("Vui lòng điền mật khẩu"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      setError("");
      try {
        const result = await login(values.phoneNumber, values.password);
        if (result.success) {
          toast.success("Chúc bạn mua sắm vui vẻ!");
          navigate("/home");
        } else {
          const loginError = result.error as LoginError;
          setError(
            loginError?.message || "Số điện thoại hoặc mật khẩu không hợp lệ"
          );
        }
      } catch (err: unknown) {
        const error = err as LoginError;
        const errorMessage =
          error.message?.includes("ERR_CONNECTION_REFUSED") ||
          error.message?.includes("ERR_SSL_PROTOCOL_ERROR")
            ? "Không thể kết nối đến máy chủ. Thử lại sau"
            : error?.message || "An unexpected error occurred.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleSendResetCode = async () => {
    if (!phoneForReset) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }
    setIsSendingCode(true);
    authApi
      .forgetPass(phoneForReset)
      .then(() => {
        toast.success("Mã xác nhận đã được gửi về số điện thoại!");
        setForgotModalOpen(false);
        setCodeModalOpen(true);
      })
      .finally(() => {
        setIsSendingCode(false);
      });
  };

  const handleVerifyResetCode = async () => {
    setIsVerifyingCode(true);
    try {
      await authApi.confirmCode(resetCode);
      toast.success("Tài khoản đã được đặt lại mật khẩu");
      setCodeModalOpen(false);
    } finally {
      setIsVerifyingCode(false);
    }
  };

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
      }}
    >
      <Paper
        elevation={10}
        sx={{
          width: 350,
          p: 4,
          borderRadius: 3,
          backgroundColor: "rgba(255, 255, 255, 255)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
          }}
        >
          <img
            src={logo}
            alt="ResiBuy"
            style={{ width: "100px", height: "100px" }}
          />
          <Box>
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

        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{ width: "100%" }}
        >
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
            error={
              formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)
            }
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
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
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
            sx={{
              mt: 3,
              mb: 1,
              py: 1.5,
              borderRadius: 15,
              background:
                "linear-gradient(to right, #EB5C60, #F28B50, #FFD190)",
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Đăng nhập"
            )}
          </Button>

          {/* Forgot password link */}
          <Typography
            variant="body2"
            color="primary"
            align="center"
            sx={{ cursor: "pointer", textDecoration: "underline", mb: 1 }}
            onClick={() => setForgotModalOpen(true)}
          >
            Quên mật khẩu?
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            mt={2}
            fontSize={12}
            fontStyle={"italic"}
          >
            Liên hệ với Ban quản lí tòa nhà của bạn để được tạo tài khoản
          </Typography>
        </Box>
      </Paper>

      {/* Modal nhập số điện thoại */}
      {forgotModalOpen && (
        <Dialog
          open={forgotModalOpen}
          onClose={() => {
            setForgotModalOpen(false);
            setPhoneForReset("");
          }}
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 0,
              boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
              background: "rgba(255,255,255,0.98)",
              minWidth: 350,
              maxWidth: 400,
            },
          }}
        >
          <Box
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isSendingCode && phoneForReset) {
                handleSendResetCode();
              }
            }}
            tabIndex={0}
          >
            <Typography
              variant="h5"
              sx={{
                mb: 2,
                fontWeight: 700,
                color: "#EB5C60",
                letterSpacing: 1,
              }}
            >
              Quên mật khẩu
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, textAlign: "center" }}
            >
              Vui lòng nhập số điện thoại đã đăng ký để nhận mã xác nhận.
            </Typography>
            <TextField
              fullWidth
              label="Số điện thoại"
              value={phoneForReset}
              onChange={(e) => setPhoneForReset(e.target.value)}
              disabled={isSendingCode}
              sx={{ mb: 3, borderRadius: 2, background: "#fff" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone />
                  </InputAdornment>
                ),
              }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2,
                width: "100%",
                mt: 1,
              }}
            >
              <Button
                variant="text"
                color="secondary"
                onClick={() => setForgotModalOpen(false)}
                sx={{
                  flex: 1,
                  fontWeight: 500,
                  borderRadius: 15,
                  border: "1.5px solid #e91e63",
                  color: "#e91e63",
                  background: "#fff",
                  boxShadow: "none",
                  "&:hover": {
                    background: "#ffe3ec",
                    borderColor: "#FF6B6B",
                    color: "#FF6B6B",
                  },
                }}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSendResetCode}
                disabled={isSendingCode || !phoneForReset}
                sx={{
                  flex: 2,
                  py: 1.2,
                  borderRadius: 15,
                  fontWeight: 600,
                  background:
                    "linear-gradient(to right, #EB5C60, #F28B50, #FFD190)",
                  boxShadow: "0 3px 12px rgba(233, 30, 99, 0.13)",
                  "&:hover": {
                    background:
                      "linear-gradient(to right, #F28B50, #EB5C60, #FFD190)",
                  },
                }}
              >
                {isSendingCode ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Gửi mã xác nhận"
                )}
              </Button>
            </Box>
          </Box>
        </Dialog>
      )}

      {/* Modal nhập mã xác nhận */}
      <ConfirmCodeModal
        open={codeModalOpen}
        onClose={() => setCodeModalOpen(false)}
        onSubmit={handleVerifyResetCode}
        isSubmitting={isVerifyingCode}
        code={resetCode}
        setCode={setResetCode}
      />
    </Box>
  );
};

export default Login;
