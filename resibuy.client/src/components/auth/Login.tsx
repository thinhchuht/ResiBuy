import React, { useState, useRef } from "react";
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
  MenuItem,
  Autocomplete,
} from "@mui/material";
import { Visibility, VisibilityOff, Phone, Lock } from "@mui/icons-material";
import { useToastify } from "../../hooks/useToastify";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/images/Logo.png";
import background from "../../assets/images/login-background.jpg";
import ConfirmCodeModal from "../ConfirmCodeModal";
import authApi from "../../api/auth.api";
import areaApi from "../../api/area.api";
import buildingApi from "../../api/building.api";
import roomApi from "../../api/room.api";
import userApi from "../../api/user.api";
import type { Area, Building, Room } from "../../types/models";
import type { RoomDto } from "../../types/dtoModels";

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
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [areasData, setAreasData] = useState<Area[]>([]);
  const [buildingsData, setBuildingsData] = useState<Building[]>([]);
  const [roomsData, setRoomsData] = useState<(Room | RoomDto)[]>([]);
  const [fetchedAreas, setFetchedAreas] = useState<Set<string>>(new Set());
  const [areasLoaded, setAreasLoaded] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    identityNumber: "",
    phone: "",
    email: "",
    password: "",
    fullName: "",
    dateOfBirth: "",
    areaId: "",
    buildingId: "",
    roomId: "",
    roomIds: [] as string[],
  });
  const [registerTouched, setRegisterTouched] = useState({
    identityNumber: false,
    phone: false,
    email: false,
    password: false,
    fullName: false,
    dateOfBirth: false,
    areaId: false,
    buildingId: false,
    roomId: false,
    roomIds: false,
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerCodeModalOpen, setRegisterCodeModalOpen] = useState(false);
  const [registerCode, setRegisterCode] = useState("");
  // Debounce fetchRooms khi search phòng
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

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

  const validateRegister = () => {
    return {
      fullName: !registerForm.fullName ? "Vui lòng nhập họ tên" : undefined,
      dateOfBirth: !registerForm.dateOfBirth ? "Vui lòng nhập ngày sinh" : undefined,
      identityNumber: !registerForm.identityNumber ? "Vui lòng nhập số identityNumber" : undefined,
      phone: !registerForm.phone ? "Vui lòng nhập số điện thoại" : undefined,
      email: !registerForm.email || !/^\S+@\S+\.\S+$/.test(registerForm.email) ? "Email không hợp lệ" : undefined,
      password: !registerForm.password || registerForm.password.length < 6 ? "Mật khẩu phải ít nhất 6 ký tự" : undefined,
      areaId: !registerForm.areaId ? "Vui lòng chọn khu vực" : undefined,
      buildingId: !registerForm.buildingId ? "Vui lòng chọn tòa nhà" : undefined,
      roomIds: !registerForm.roomIds || registerForm.roomIds.length === 0 ? "Vui lòng chọn phòng" : undefined,
    };
  };
  const registerErrors = validateRegister();

  const handleRegisterChange = (field: string, value: string | string[]) => {
    setRegisterForm((prev) => ({ ...prev, [field]: value }));
    setRegisterTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterTouched({ identityNumber: true, phone: true, email: true, password: true, fullName: true, dateOfBirth: true, areaId: true, buildingId: true, roomId: true, roomIds: true });
    console.log("submit", registerForm, registerErrors);
    if (Object.values(registerErrors).some(Boolean)) {
      toast.error("Vui lòng nhập đầy đủ thông tin hợp lệ!");
      return;
    }
    setRegisterLoading(true);
    try {
      const payload = {
        identityNumber: registerForm.identityNumber,
        phoneNumber: registerForm.phone,
        email: registerForm.email,
        password: registerForm.password,
        fullName: registerForm.fullName,
        dateOfBirth: new Date(registerForm.dateOfBirth),
        roomIds: registerForm.roomIds,
      };
      console.log("call getCode", payload);
      const res = await userApi.getCode(payload);
      if (!res || res.error) {
        toast.error(res?.error?.message || "Gửi mã xác nhận thất bại!");
      } else {
        setRegisterCodeModalOpen(true);
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleRegisterCodeSubmit = async () => {
    setRegisterLoading(true);
    try {
      const payload = {
        ...registerForm,
        code: registerCode,
        phoneNumber: registerForm.phone,
        roomIds: registerForm.roomIds,
        dateOfBirth: new Date(registerForm.dateOfBirth),
      };
      const res = await userApi.createUser(payload);
      if (!res || res.error) {
        toast.error(res?.error?.message || "Đăng ký thất bại!");
      } else {
        setRegisterCodeModalOpen(false);
        setRegisterModalOpen(false);
        setRegisterForm({ identityNumber: "", phone: "", email: "", password: "", fullName: "", dateOfBirth: "", areaId: "", buildingId: "", roomId: "", roomIds: [] });
        setRegisterTouched({ identityNumber: false, phone: false, email: false, password: false, fullName: false, dateOfBirth: false, areaId: false, buildingId: false, roomId: false, roomIds: false });
        setRegisterCode("");
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  // Fetch logic cho area, building, room
  const fetchBuildings = async (areaId: string) => {
    if (fetchedAreas.has(areaId)) {
      return;
    }
    try {
      setBuildingsData([]);
      const buildingsData = await buildingApi.getByAreaId(areaId);
      setBuildingsData(buildingsData as Building[]);
      setFetchedAreas((prev) => new Set([...prev, areaId]));
    } catch {
      toast.error("Không thể tải danh sách tòa nhà");
    }
  };
  const fetchRooms = async (buildingId: string, page = 1, pageSize = 6, search = "") => {
    try {
      const roomsRes = await roomApi.searchInBuilding({ buildingId, pageNumber: page, pageSize, keyword: search });
      setRoomsData((prev) => {
        const newRooms = roomsRes.items.filter(r => !prev.some(p => p.id === r.id));
        return [...prev, ...newRooms];
      });
    } catch {
      toast.error("Không thể tải danh sách phòng");
    }
  };
  React.useEffect(() => {
    if (registerModalOpen && !areasLoaded) {
      areaApi.getAll().then((areas) => {
        setAreasData(areas);
        setAreasLoaded(true);
      });
    }
  }, [registerModalOpen, areasLoaded]);

  const selectedRoomIds = Array.isArray(registerForm.roomIds) ? registerForm.roomIds.filter(Boolean).map(String) : [];

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

          {/* Forgot password and register links */}
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', mb: 1, width: '100%' }}>
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() => setRegisterModalOpen(true)}
            >
              Đăng ký tài khoản
            </Typography>
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() => setForgotModalOpen(true)}
            >
              Quên mật khẩu?
            </Typography>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            mt={2}
            fontSize={12}
            fontStyle={"italic"}
          >
            Liên hệ với Ban quản lí tòa nhà để được tạo tài khoản bán hàng
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

      <ConfirmCodeModal
        open={codeModalOpen}
        onClose={() => setCodeModalOpen(false)}
        onSubmit={handleVerifyResetCode}
        isSubmitting={isVerifyingCode}
        code={resetCode}
        setCode={setResetCode}
      />

      <Dialog
        open={registerModalOpen}
        onClose={() => {
          setRegisterModalOpen(false);
          setRegisterForm({ identityNumber: "", phone: "", email: "", password: "", fullName: "", dateOfBirth: "", areaId: "", buildingId: "", roomId: "", roomIds: [] });
          setRegisterTouched({ identityNumber: false, phone: false, email: false, password: false, fullName: false, dateOfBirth: false, areaId: false, buildingId: false, roomId: false, roomIds: false });
        }}
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 0,
            boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            background: "linear-gradient(135deg, #fff 80%, #ffe3ec 100%)",
            minWidth: 700,
            maxWidth: 900,
            width: '100%',
          },
        }}
      >
        <Box
          component="form"
          onSubmit={handleRegister}
          sx={{
            p: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: "#EB5C60", letterSpacing: 1, textAlign: 'center' }}>
            Đăng ký tài khoản
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 5, width: '100%', mb: 3, justifyContent: 'center' }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, maxWidth: 360 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Thông tin tài khoản
              </Typography>
              <TextField
                fullWidth
                label="Họ tên"
                value={registerForm.fullName}
                onChange={e => handleRegisterChange("fullName", e.target.value)}
                onBlur={() => setRegisterTouched(prev => ({ ...prev, fullName: true }))}
                error={registerTouched.fullName && Boolean(registerErrors.fullName)}
                helperText={registerTouched.fullName && registerErrors.fullName}
                sx={{ mb: 2, borderRadius: 2, background: "#fff" }}
              />
              <TextField
                fullWidth
                label="Ngày sinh"
                type="date"
                value={registerForm.dateOfBirth}
                onChange={e => handleRegisterChange("dateOfBirth", e.target.value)}
                onBlur={() => setRegisterTouched(prev => ({ ...prev, dateOfBirth: true }))}
                error={registerTouched.dateOfBirth && Boolean(registerErrors.dateOfBirth)}
                helperText={registerTouched.dateOfBirth && registerErrors.dateOfBirth}
                sx={{ mb: 2, borderRadius: 2, background: "#fff" }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Số CCCD"
                value={registerForm.identityNumber}
                onChange={e => handleRegisterChange("identityNumber", e.target.value)}
                onBlur={() => setRegisterTouched(prev => ({ ...prev, identityNumber: true }))}
                error={registerTouched.identityNumber && Boolean(registerErrors.identityNumber)}
                helperText={registerTouched.identityNumber && registerErrors.identityNumber}
                sx={{ mb: 2, borderRadius: 2, background: "#fff" }}
              />
              <TextField
                fullWidth
                label="Số điện thoại"
                value={registerForm.phone}
                onChange={e => handleRegisterChange("phone", e.target.value)}
                onBlur={() => setRegisterTouched(prev => ({ ...prev, phone: true }))}
                error={registerTouched.phone && Boolean(registerErrors.phone)}
                helperText={registerTouched.phone && registerErrors.phone}
                sx={{ mb: 2, borderRadius: 2, background: "#fff" }}
              />
              <TextField
                fullWidth
                label="Email"
                value={registerForm.email}
                onChange={e => handleRegisterChange("email", e.target.value)}
                onBlur={() => setRegisterTouched(prev => ({ ...prev, email: true }))}
                error={registerTouched.email && Boolean(registerErrors.email)}
                helperText={registerTouched.email && registerErrors.email}
                sx={{ mb: 2, borderRadius: 2, background: "#fff" }}
              />
              <TextField
                fullWidth
                label="Mật khẩu"
                type="password"
                value={registerForm.password}
                onChange={e => handleRegisterChange("password", e.target.value)}
                onBlur={() => setRegisterTouched(prev => ({ ...prev, password: true }))}
                error={registerTouched.password && Boolean(registerErrors.password)}
                helperText={registerTouched.password && registerErrors.password}
                sx={{ mb: 2, borderRadius: 2, background: "#fff" }}
              />
            </Box>
            {/* Cột phải: thông tin phòng */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, maxWidth: 360 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Thông tin phòng
              </Typography>
              <TextField
                select
                fullWidth
                label="Khu vực"
                value={registerForm.areaId}
                onChange={e => {
                  handleRegisterChange("areaId", e.target.value);
                  handleRegisterChange("buildingId", "");
                  if (e.target.value) fetchBuildings(e.target.value);
                }}
                onBlur={() => setRegisterTouched(prev => ({ ...prev, areaId: true }))}
                error={registerTouched.areaId && Boolean(registerErrors.areaId)}
                helperText={registerTouched.areaId && registerErrors.areaId}
                sx={{ mb: 2, background: '#fff' }}
                SelectProps={{ native: false }}
                className="register-select-field"
              >
                <MenuItem value="" disabled>Chọn khu vực</MenuItem>
                {areasData.map((area) => (
                  <MenuItem key={area.id} value={area.id}>{area.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Tòa nhà"
                value={registerForm.buildingId}
                onChange={async e => {
                  handleRegisterChange("buildingId", e.target.value);
                  if (e.target.value) {
                    await fetchRooms(e.target.value as string, 1, 6);
                  }
                }}
                onBlur={() => setRegisterTouched(prev => ({ ...prev, buildingId: true }))}
                error={registerTouched.buildingId && Boolean(registerErrors.buildingId)}
                helperText={registerTouched.buildingId && registerErrors.buildingId}
                sx={{ mb: 2, background: '#fff' }}
                disabled={!registerForm.areaId}
                SelectProps={{ native: false }}
                className="register-select-field"
              >
                <MenuItem value="" disabled>Chọn tòa nhà</MenuItem>
                {buildingsData.map((building) => (
                  <MenuItem key={building.id} value={building.id}>{building.name}</MenuItem>
                ))}
              </TextField>
              <Autocomplete
                multiple
                fullWidth
                options={roomsData}
                getOptionLabel={option => option.name || ''}
                value={roomsData.filter(r => selectedRoomIds.includes(String(r.id)))}
                onChange={(_, newValue) => {
                  handleRegisterChange("roomIds", newValue.map(r => String(r.id)).filter((id): id is string => !!id));
                }}
                onInputChange={(_, newInputValue) => {
                  if (!registerForm.buildingId) return;
                  if (searchTimeout.current) clearTimeout(searchTimeout.current);
                  searchTimeout.current = setTimeout(() => {
                    fetchRooms(registerForm.buildingId, 1, 6, newInputValue);
                  }, 500);
                }}
                disabled={!registerForm.buildingId}
                renderInput={(params) => {
                  return (
                    <TextField
                      {...params}
                      label="Phòng"
                      error={registerTouched.roomIds && Boolean(registerErrors.roomIds)}
                      helperText={registerTouched.roomIds && registerErrors.roomIds}
                      sx={{ mb: 2, background: '#fff' }}
                      inputProps={{ ...params.inputProps, readOnly: !registerForm.buildingId }}
                    />
                  );
                }}
              />
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "row", gap: 2, width: "100%", mt: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="text"
              color="secondary"
              onClick={() => setRegisterModalOpen(false)}
              sx={{
                minWidth: 110,
                px: 3,
                py: 1.2,
                fontWeight: 600,
                fontSize: 15,
                borderRadius: 15,
                border: "2px solid #e91e63",
                color: "#e91e63",
                background: "#fff",
                boxShadow: "none",
                '&:hover': {
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
              type="submit"
              disabled={registerLoading}
              sx={{
                minWidth: 130,
                px: 3,
                py: 1.2,
                fontWeight: 600,
                fontSize: 15,
                borderRadius: 15,
                background: "linear-gradient(to right, #EB5C60, #F28B50, #FFD190)",
                boxShadow: "0 3px 12px rgba(233, 30, 99, 0.13)",
                '&:hover': {
                  background: "linear-gradient(to right, #F28B50, #EB5C60, #FFD190)",
                },
              }}
            >
              {registerLoading ? <CircularProgress size={22} color="inherit" /> : "Đăng ký"}
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Modal nhập mã xác nhận đăng ký */}
      <ConfirmCodeModal
        open={registerCodeModalOpen}
        onClose={() => {
          setRegisterCodeModalOpen(false);
          setRegisterCode("");
        }}
        onSubmit={handleRegisterCodeSubmit}
        isSubmitting={registerLoading}
        code={registerCode}
        setCode={setRegisterCode}
      />
    </Box>
  );
};

export default Login;
