import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Box, Button, Container, TextField, Typography, Paper, InputAdornment, IconButton, Alert, CircularProgress } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useToastify } from "../../hooks/useToastify";
import authApi from "../../api/auth.api";

interface LoginError {
  message?: string;
}

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToastify();

  const formik = useFormik({
    initialValues: {
      phoneNumber: "",
      password: "",
    },
    validationSchema: Yup.object({
      // phoneNumber: Yup.string()
      //   .matches(/^[0-9]+$/, "Phone number must contain only digits")
      //   .min(10, "Phone number must be at least 10 digits")
      //   .required("Phone number is required"),
      password: Yup.string().min(5, "Password must be at least 6 characters").required("Password is required"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      setError("");
      try {
        const result = await authApi.login(values.phoneNumber, values.password);
        if (result.success) {
          toast.success("Login successful!");
          navigate("/home");
        } else {
          const loginError = result.error as LoginError;
          setError(loginError?.message || "Invalid phone number or password");
          toast.error(loginError?.message || "Invalid phone number or password");
        }
      } catch (err: unknown) {
        const error = err as LoginError;
        if (error.message?.includes("ERR_CONNECTION_REFUSED") || error.message?.includes("ERR_SSL_PROTOCOL_ERROR")) {
          const errorMessage = "Cannot connect to server. Please check your internet connection or try again later.";
          setError(errorMessage);
          toast.error(errorMessage);
        } else {
          const errorMessage = error?.message || "An unexpected error occurred.";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}>
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Sign in to your account
          </Typography>
          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              formik.handleSubmit(e);
            }}
            sx={{ width: "100%" }}>
            <TextField
              margin="normal"
              fullWidth
              id="phoneNumber"
              name="phoneNumber"
              label="Phone Number"
              autoComplete="tel"
              autoFocus
              value={formik.values.phoneNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
              helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              fullWidth
              id="password"
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} edge="end" disabled={isLoading}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
            </Button>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{" "}
                <Button
                  color="primary"
                  sx={{ textTransform: "none" }}
                  onClick={() => {
                    toast.info("Register page coming soon!");
                  }}
                  disabled={isLoading}>
                  Sign Up
                </Button>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
