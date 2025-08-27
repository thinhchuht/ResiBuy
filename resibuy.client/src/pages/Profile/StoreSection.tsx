import { useEffect, useState } from "react";
import { Box, Typography, Tabs, Tab, CircularProgress, Card, Avatar, Badge, useTheme, useMediaQuery, Chip, TextField, IconButton, Button, Tooltip } from "@mui/material";
import storeApi from "../../api/storee.api";
import { useAuth } from "../../contexts/AuthContext";
import type { Store, RoomResult } from "../../types/models";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Lock } from "@mui/icons-material";
import WarningAmber from "@mui/icons-material/WarningAmber";
import ReportProblemOutlined from "@mui/icons-material/ReportProblemOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";

const StoreSection = () => {
  const { user, setUser } = useAuth();
  const [tabIndex, setTabIndex] = useState(0);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [editingName, setEditingName] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [descValue, setDescValue] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [descLoading, setDescLoading] = useState(false);

  useEffect(() => {
    if (user && user.stores) {
      const storeList = Array.isArray(user.stores) ? user.stores : [user.stores];
      setStores(storeList);
    }
  }, [user]);

  useEffect(() => {
    if (stores.length === 0) return;
    const storeId = stores[tabIndex]?.id;
    if (!storeId) return;
    setLoading(true);
    setError(null);
    storeApi
      .getById(storeId)
      .then((data) => setSelectedStore(data.data))
      .catch(() => setError("Không thể tải thông tin cửa hàng."))
      .finally(() => setLoading(false));
  }, [tabIndex, stores]);

  useEffect(() => {
    if (selectedStore) {
      setNameValue(selectedStore.name || "");
      setDescValue(selectedStore.description || "");
    }
  }, [selectedStore]);

  // Helper để render địa chỉ
  const renderAddress = (address?: RoomResult) => {
    if (!address) return <span style={{ color: "#bdbdbd" }}>Chưa cập nhật</span>;
    return (
      <>
        {address.name ? `${address.name}, ` : ""}
        {address.buildingName ? `${address.buildingName}, ` : ""}
        {address.areaName ? address.areaName : ""}
      </>
    );
  };

  if (!user || stores.length === 0) {
    return (
      <Box sx={{ p: 6, textAlign: "center", color: "text.secondary" }}>
        <Typography variant="h6" fontWeight={600} mb={2} color="#e91e63">
          Bạn chưa có cửa hàng nào.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: "1px solid #f8bbd0", mb: 3, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Typography variant="h6" fontWeight={700} color="#e91e63" sx={{ textAlign: "left" }}>
          Cửa hàng của bạn
        </Typography>
        <Tooltip title="Số lần cảnh cáo 3 lần sẽ bị khóa tài khoản" arrow>
          {(() => {
            const currentStore = stores[tabIndex] as (typeof stores)[number] & { reportCount?: number };
            const rc = currentStore?.reportCount ?? 0;
            return (
              <Chip
                icon={<ReportProblemOutlined sx={{ color: rc > 0 ? "#fb8c00" : "#9e9e9e" }} />}
                label={`Số lần bị tố cáo: ${rc}`}
                color={rc >= 3 ? "error" : rc > 0 ? "warning" : "default"}
                sx={{ fontWeight: 700 }}
              />
            );
          })()}
        </Tooltip>
      </Box>
      <Tabs value={tabIndex} onChange={(_, idx) => setTabIndex(idx)} variant="scrollable" scrollButtons="auto" sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}>
        {stores.map((store) => (
          <Tab key={store.id} label={store.name} />
        ))}
      </Tabs>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Card
          sx={{
            p: isMobile ? 2 : 4,
            borderRadius: 5,
            boxShadow: "0 4px 24px 0 rgba(233,30,99,0.10)",
            minWidth: isMobile ? "100%" : 420,
            maxWidth: 600,
            width: "100%",
            border: "1px solid #fce4ec",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "center" : "flex-start",
            gap: isMobile ? 2 : 4,
            background: "#fff",
          }}>
          {loading ? (
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", minHeight: 180 }}>
              <CircularProgress color="secondary" />
            </Box>
          ) : error ? (
            <Typography color="error" align="center" sx={{ width: "100%" }}>
              {error}
            </Typography>
          ) : selectedStore ? (
            selectedStore.isLocked ? (
              <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 220, p: 4 }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    mb: 2,
                    bgcolor: "#f5f5f5",
                    color: "#bdbdbd",
                    fontSize: 48,
                    border: "4px solid #f5f5f5",
                    boxShadow: "0 4px 12px rgba(233, 30, 99, 0.08)",
                  }}>
                  <Lock fontSize="inherit" />
                </Avatar>
                <Chip
                  icon={<Lock sx={{ color: "#bdbdbd" }} />}
                  label="Cửa hàng của bạn đã bị khóa"
                  color="default"
                  sx={{ fontWeight: 600, fontSize: 16, px: 2, bgcolor: "#f5f5f5", color: "#757575", mt: 2 }}
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
                    Tài khoản Cửa hàng đang bị khóa
                  </button>
                </Box>
              </Box>
            ) : (
              <>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 140 }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    badgeContent={
                      selectedStore.isOpen ? (
                        <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 32, bgcolor: "#fff", borderRadius: "50%" }} />
                      ) : (
                        <WarningAmber sx={{ color: "#ffb300", fontSize: 32, bgcolor: "#fff", borderRadius: "50%" }} />
                      )
                    }>
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        mb: 1,
                        bgcolor: "#fce4ec",
                        color: "#e91e63",
                        fontSize: 48,
                        border: "4px solid #fce4ec",
                        boxShadow: "0 4px 12px rgba(233, 30, 99, 0.2)",
                      }}>
                      <StorefrontIcon fontSize="inherit" />
                    </Avatar>
                  </Badge>
                  <Box mt={2}>
                    {selectedStore.isOpen ? (
                      <Chip icon={<CheckCircleIcon sx={{ color: "#4caf50" }} />} label="Đang hoạt động" color="success" sx={{ fontWeight: 600, fontSize: 16, px: 2 }} />
                    ) : (
                      <Chip
                        icon={<WarningAmber sx={{ color: "#ffb300" }} />}
                        label="Đang đóng cửa"
                        sx={{ fontWeight: 600, fontSize: 16, px: 2, bgcolor: "#fffde7", color: "#ffb300" }}
                      />
                    )}
                  </Box>
                </Box>
                <Box sx={{ flex: 1, pl: isMobile ? 0 : 3, pt: isMobile ? 2 : 0 }}>
                  <Typography sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", color: "#616161", fontWeight: 600, fontSize: 13, mb: 1 }}>
                    <CalendarMonthIcon sx={{ fontSize: 16, mr: 0.5, mb: "1.5px" }} />
                    Ngày thành lập: {new Date(selectedStore.createdAt).toLocaleString()}
                  </Typography>
                  <Box mb={3}>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Tên cửa hàng
                      </Typography>
                      {!selectedStore.isLocked && !editingName && (
                        <IconButton size="small" onClick={() => setEditingName(true)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    <TextField
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value.slice(0, 30))}
                      fullWidth
                      disabled={!editingName || nameLoading}
                      variant="outlined"
                      size="small"
                      sx={{
                        mt: 0.5,
                        bgcolor: editingName ? "#fff" : "#f5f5f5",
                        borderRadius: 2,
                        "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 16, height: 38, padding: "0 10px" },
                      }}
                      inputProps={{ style: { fontWeight: 700, fontSize: 16, color: "#e91e63", padding: "8px 10px" }, maxLength: 30 }}
                      helperText={editingName ? `${nameValue.length}/30 ký tự` : undefined}
                    />
                    {editingName && (
                      <Box display="flex" gap={2} mt={1}>
                        <Button
                          type="button"
                          variant="contained"
                          sx={{ bgcolor: "#e91e63", fontWeight: 600, borderRadius: 2, textTransform: "none" }}
                          disabled={nameLoading || nameValue.length === 0 || nameValue.length > 30}
                          onClick={async () => {
                            setNameLoading(true);
                            try {
                              await storeApi.update(selectedStore.id, { name: nameValue, description: selectedStore.description });
                              setSelectedStore({ ...selectedStore, name: nameValue });
                              if (user && user.stores) {
                                const storeList = Array.isArray(user.stores) ? user.stores : [user.stores];
                                const updatedStores = storeList.map((s) => (s.id === selectedStore.id ? { ...s, name: nameValue } : s));
                                setUser({ ...user, stores: updatedStores });
                              }
                              setEditingName(false);
                            } catch {
                              alert("Cập nhật tên thất bại");
                            } finally {
                              setNameLoading(false);
                            }
                          }}>
                          Lưu
                        </Button>
                        <Button
                          type="button"
                          variant="outlined"
                          sx={{ borderRadius: 2, textTransform: "none" }}
                          disabled={nameLoading}
                          onClick={() => {
                            setEditingName(false);
                            setNameValue(selectedStore.name || "");
                          }}>
                          Hủy
                        </Button>
                      </Box>
                    )}
                  </Box>
                  {/* Địa chỉ */}
                  <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
                      Địa chỉ
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {renderAddress(selectedStore.room)}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" mb={0.5} mt={1}>
                      Số điện thoại
                    </Typography>
                    <Typography variant="body1" fontWeight={600} color="#e91e63">
                      {selectedStore.phoneNumber || <span style={{ color: "#bdbdbd" }}>Chưa cập nhật</span>}
                    </Typography>
                  </Box>
                  {/* Mô tả */}
                  <Box mb={3}>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Mô tả
                      </Typography>
                      {!selectedStore.isLocked && !editingDesc && (
                        <IconButton size="small" onClick={() => setEditingDesc(true)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    <TextField
                      value={descValue}
                      onChange={(e) => setDescValue(e.target.value.slice(0, 500))}
                      fullWidth
                      disabled={!editingDesc || descLoading}
                      variant="outlined"
                      size="small"
                      multiline
                      minRows={2}
                      maxRows={4}
                      sx={{ mt: 0.5, bgcolor: editingDesc ? "#fff" : "#f5f5f5", borderRadius: 2, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 15, padding: "0 10px" } }}
                      inputProps={{ style: { fontWeight: 500, fontSize: 15, padding: "8px 10px" }, maxLength: 500 }}
                      placeholder="Chưa cập nhật"
                      helperText={editingDesc ? `${descValue.length}/500 ký tự` : undefined}
                    />
                    {editingDesc && (
                      <Box display="flex" gap={2} mt={1}>
                        <Button
                          type="button"
                          variant="contained"
                          sx={{ bgcolor: "#e91e63", fontWeight: 600, borderRadius: 2, textTransform: "none" }}
                          disabled={descLoading || descValue.length > 500}
                          onClick={async () => {
                            setDescLoading(true);
                            try {
                              await storeApi.update(selectedStore.id, { name: selectedStore.name, description: descValue });
                              setSelectedStore({ ...selectedStore, description: descValue });
                              setEditingDesc(false);
                            } catch {
                              alert("Cập nhật mô tả thất bại");
                            } finally {
                              setDescLoading(false);
                            }
                          }}>
                          Lưu
                        </Button>
                        <Button
                          type="button"
                          variant="outlined"
                          sx={{ borderRadius: 2, textTransform: "none" }}
                          disabled={descLoading}
                          onClick={() => {
                            setEditingDesc(false);
                            setDescValue(selectedStore.description || "");
                          }}>
                          Hủy
                        </Button>
                      </Box>
                    )}
                  </Box>
                  <Box mt={4} textAlign="center">
                    <button
                      onClick={() => navigate("/store")}
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
                      Đến trang cửa hàng
                    </button>
                  </Box>
                </Box>
              </>
            )
          ) : null}
        </Card>
      </Box>
    </Box>
  );
};

export default StoreSection;
