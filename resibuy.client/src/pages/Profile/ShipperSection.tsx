import { Box, Typography, CircularProgress, Chip, Paper, Tooltip } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";
import shipperApi from "../../api/ship.api";
import type { Shipper } from "../../types/models";
import { LocalShipping, LocationOn, CalendarMonth, Assignment, ReportProblem, Lock } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const ShipperSection = () => {
  const { user } = useAuth();
  const [shipper, setShipper] = useState<Shipper | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShipper = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await shipperApi.getByUserId(user.id);
        console.log(data);
        setShipper(data.data);
      } catch {
        setError("Không tìm thấy thông tin tài khoản giao hàng cho user này.");
        setShipper(null);
      } finally {
        setLoading(false);
      }
    };
    fetchShipper();
  }, [user?.id]);

  if (loading) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 6, textAlign: "center", color: "text.secondary" }}>
        <Typography variant="h6" fontWeight={600} mb={2} color="#e91e63">
          Khu vực tài khoản giao hàng
        </Typography>
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!shipper) {
    return (
      <Box sx={{ p: 6, textAlign: "center", color: "text.secondary" }}>
        <Typography variant="h6" fontWeight={600} mb={2} color="#e91e63">
          Khu vực tài khoản giao hàng
        </Typography>
        <Typography variant="body2">Không có dữ liệu shipper cho tài khoản này.</Typography>
      </Box>
    );
  }

  // Lấy thông tin vị trí
  const location = shipper.lastLocation?.name || "-";
  // Helper: float hour (8.5) -> '8:30'
  const floatToTime = (num: number) => {
    if (typeof num !== "number" || isNaN(num)) return "-";
    const h = Math.floor(num);
    const m = Math.round((num - h) * 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, bgcolor: "#fff", boxShadow: "0 2px 8px rgba(233,30,99,0.10)", maxWidth: 700, mx: "auto", border: "1.5px solid #f8bbd0" }}>
        <Box sx={{ borderBottom: "1px solid #f8bbd0", mb: 3, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Typography variant="h6" fontWeight={700} color="#e91e63" sx={{ textAlign: "left" }}>
            Thông tin tài khoản giao hàng
          </Typography>
          <Tooltip title="Số lần cảnh cáo 3 lần sẽ bị khóa tài khoản" arrow>
            <Chip
              icon={<ReportProblem sx={{ color: (shipper?.reportCount ?? 0) > 0 ? "inherit" : "#9e9e9e" }} />}
              label={`Số lần bị tố cáo: ${shipper?.reportCount ?? 0}`}
              variant="filled"
              color={(shipper?.reportCount ?? 0) >= 3 ? "error" : (shipper?.reportCount ?? 0) > 0 ? "warning" : "default"}
              sx={{ fontWeight: 700 }}
            />
          </Tooltip>
        </Box>
        {shipper.isLocked ? (
          <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 220, p: 4 }}>
            <Box
              sx={{
                bgcolor: "#f5f5f5",
                borderRadius: "50%",
                width: 100,
                height: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(233,30,99,0.08)",
                mb: 2,
              }}>
              <Lock sx={{ fontSize: 56, color: "#bdbdbd" }} />
            </Box>
            <Chip
              icon={<Lock sx={{ color: "#bdbdbd" }} />}
              label="Tài khoản giao hàng của bạn đã bị khóa"
              color="default"
              sx={{ fontWeight: 600, fontSize: 16, px: 2, bgcolor: "#f5f5f5", color: "#757575", mt: 1 }}
            />
            <Typography variant="body2" color="text.secondary" mt={2}>
              Liên hệ với ban quản lí để biết thêm chi tiết
            </Typography>
            <Box mt={3}>
              <button
                disabled
                style={{
                  background: "#f5f5f5",
                  color: "#9e9e9e",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 32px",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "not-allowed",
                  boxShadow: "0 2px 8px rgba(233,30,99,0.08)",
                }}>
                Tài khoản Giao hàng đang bị khóa
              </button>
            </Box>
          </Box>
        ) : (
          <>
            <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={4} alignItems={{ md: "center" }}>
              <Box flex={1} minWidth={0}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Assignment sx={{ mr: 1, color: "#e91e63" }} />
                  <Typography variant="body2">
                    Số đơn đã giao: <b>{shipper.orders?.length ?? 0}</b>
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <ReportProblem sx={{ mr: 1, color: "#e91e63" }} />
                  <Typography variant="body2">
                    Số lần bị báo cáo: <b>{shipper.reportCount}</b>
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <CalendarMonth sx={{ mr: 1, color: "#e91e63" }} />
                  <Typography variant="body2">
                    Bắt đầu ca: <b>{floatToTime(shipper.startWorkTime)}</b>
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <CalendarMonth sx={{ mr: 1, color: "#e91e63" }} />
                  <Typography variant="body2">
                    Kết thúc ca: <b>{floatToTime(shipper.endWorkTime)}</b>
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <LocationOn sx={{ mr: 1, color: "#e91e63" }} />
                  <Typography variant="body2">
                    Vị trí hiện tại: <b>{location}</b>
                  </Typography>
                </Box>
              </Box>
              <Box display={{ xs: "none", md: "flex" }} flexDirection="column" alignItems="center" justifyContent="center" sx={{ minWidth: 140 }}>
                <Box
                  sx={{
                    bgcolor: "#fce4ec",
                    borderRadius: "50%",
                    width: 100,
                    height: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(233,30,99,0.12)",
                    mb: 2,
                  }}>
                  <LocalShipping sx={{ fontSize: 56, color: "#e91e63" }} />
                </Box>
                <Chip
                  icon={<LocalShipping sx={{ color: shipper.isOnline ? "#4caf50" : "#bdbdbd" }} />}
                  label={shipper.isOnline ? "Đang hoạt động" : "Ngoại tuyến"}
                  color={shipper.isOnline ? "success" : "default"}
                  size="medium"
                  sx={{ fontWeight: 600, fontSize: 16, px: 2, bgcolor: shipper.isOnline ? undefined : "#f5f5f5", color: shipper.isOnline ? undefined : "#757575" }}
                />
              </Box>
              <Box display={{ xs: "flex", md: "none" }} alignItems="center" gap={2} mb={2}>
                <Chip
                  icon={<LocalShipping sx={{ color: shipper.isOnline ? "#4caf50" : "#bdbdbd" }} />}
                  label={shipper.isOnline ? "Đang hoạt động" : "Ngoại tuyến"}
                  color={shipper.isOnline ? "success" : "default"}
                  size="medium"
                  sx={{ fontWeight: 600, fontSize: 16, px: 2, bgcolor: shipper.isOnline ? undefined : "#f5f5f5", color: shipper.isOnline ? undefined : "#757575" }}
                />
              </Box>
            </Box>
            <Box mt={4} textAlign="center">
              <button
                onClick={() => navigate("/shipper")}
                style={{
                  background: "#e91e63",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 32px",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(233,30,99,0.12)",
                  transition: "background 0.2s",
                }}>
                Đến trang giao hàng
              </button>
            </Box>
          </>
        )}
      </Paper>
    </>
  );
};

export default ShipperSection;
