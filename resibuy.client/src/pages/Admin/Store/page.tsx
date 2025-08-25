import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  TextField,
  InputAdornment,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Lock,
  LockOpen,
  Edit,
  Visibility,
  CheckCircle,
  ToggleOff,
  Store as StoreIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import CustomTable from "../../../components/CustomTable";
import { AddStoreModal } from "../../../components/admin/Store/add-store-modal";
import { StoreDetailModal } from "../../../components/admin/Store/store-detail-modal";
import { StatsCard } from "../../../layouts/AdminLayout/components/StatsCard";
import { getStatusColor, useStoresLogic } from "../../../components/admin/Store/seg/utlis";
import { ConfirmModal } from "../../../components/ConfirmModal";

function StoreStatsCards({ calculateStoreStats }) {
  const [stats, setStats] = useState({
    totalStores: 0,
    activeStores: 0,
    inactiveStores: 0,
    openStore: 0,
    closeStore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const result = await calculateStoreStats();
        setStats(result);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi lấy thống kê:", err);
        setError("Không thể tải thống kê cửa hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [calculateStoreStats]);

  // Định nghĩa cards trước để tránh lỗi "Cannot access 'cards' before initialization"
  const cards = [
    {
      title: "Tổng Cửa Hàng",
      value: stats.totalStores.toString(),
      icon: StoreIcon,
      iconColor: "#1976d2",
      iconBgColor: "#e3f2fd",
      valueColor: "#1976d2",
          sx: { gridColumn: { lg: "span 2" } },
    },
    {
      title: "Cửa Hàng Hoạt Động",
      value: stats.activeStores.toString(),
      icon: LockOpen,
      iconColor: "#2e7d32",
      iconBgColor: "#e8f5e9",
      valueColor: "#2e7d32",
          sx: { gridColumn: { lg: "span 2" } },
    },
    {
      title: "Cửa Hàng Đang khóa",
      value: stats.inactiveStores.toString(),
      icon: Lock,
      iconColor: "#dc2626",
      iconBgColor: "#fee2e2",
      valueColor: "#dc2626",
       sx: { gridColumn: { lg: "span 2" } },
    },
    {
      title: "Cửa Hàng Đang mở",
      value: stats.openStore.toString(),
      icon: CheckCircle,
      iconColor: "#2e7d32",
      iconBgColor: "#e8f5e9",
      valueColor: "#2e7d32",
      sx: { gridColumn: { lg: "span 3" } }, // Mở rộng để chiếm 2 cột
    },
    {
      title: "Cửa Hàng Đang Đóng",
      value: stats.closeStore.toString(),
      icon: ToggleOff,
      iconColor: "#dc2626",
      iconBgColor: "#fee2e2",
      valueColor: "#dc2626",
      sx: { gridColumn: { lg: "span 3" } }, // Mở rộng để chiếm 2 cột
    },
  ];

  if (error) {
    return (
      <Box sx={{ p: 2, bgcolor: "error.light", borderRadius: 2 }}>
        <Typography color="error.main">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "1fr 1fr",
          lg: "1fr 1fr 1fr 1fr 1fr 1fr", // Luôn dùng 4 cột cho 5 thẻ ở lg
        },
        gap: 3,
        mb: 3,
      }}
    >
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        cards.map((card, index) => (
          <StatsCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            iconColor={card.iconColor}
            iconBgColor={card.iconBgColor}
            valueColor={card.valueColor}
            sx={card.sx} // Truyền sx prop
          />
        ))
      )}
    </Box>
  );
}
export default function StoresPage() {
  const {
    stores,
    setStores,
    selectedStore,
    isDetailModalOpen,
    isAddModalOpen,
    editingStore,
    pageNumber,
    setPageNumber,
    totalCount,
    searchParams,
    setSearchParams,
    handleViewStore,
    handleCloseDetailModal,
    handleAddStore,
    handleEditStore,
    handleCloseAddModal,
    handleSubmitStore,
    handleToggleStoreStatus,
    handleExportStores,
    calculateStoreStats,
    fetchStores,
    fetchStoresWithFilters,
  } = useStoresLogic();

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [searchInput, setSearchInput] = useState("");
  const [localFilters, setLocalFilters] = useState<{
    isOnline?: boolean;
    isLocked?: boolean;
    isPayFee?: boolean;
  }>({});

  // Debug trạng thái confirmModal
  useEffect(() => {
    console.log("confirmModal state:", confirmModal);
  }, [confirmModal]);

  useEffect(() => {
    if (Object.keys(searchParams).length === 0) {
      fetchStores(pageNumber, 15);
    } else {
      fetchStoresWithFilters(
        searchParams.keyWord,
        searchParams.isOnline,
        searchParams.isLocked,
        searchParams.isPayFee,
        pageNumber,
        15
      );
    }
  }, [pageNumber, searchParams]);

  const handleSearch = () => {
    setSearchParams({
      keyWord: searchInput || undefined,
      isOnline: localFilters.isOnline,
      isLocked: localFilters.isLocked,
      isPayFee: localFilters.isPayFee,
    });
    setPageNumber(1);
  };

  const handleFilterChange = (key: string, value: string | boolean | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
  };

  const columns = [
     {
      key: "stt",
      label: "STT",
      sortable: false,
      render: (store) => {
        const index = stores.indexOf(store);
        const pageSize = 15; // Lấy từ itemsPerPage của CustomTable
        console.log("STT render (StoresPage):", { pageNumber, pageSize, index });
        const stt = index >= 0 && !isNaN(pageNumber) && pageNumber > 0
          ? (pageNumber - 1) * pageSize + index + 1
          : index + 1;
        return (
          <Typography variant="body2" sx={{ color: "grey.900" }}>
            {stt}
          </Typography>
        );
      },
    },
    {
      key: "name",
      label: "Cửa Hàng",
      sortable: true,
      render: (store) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              mr: 1.5,
              bgcolor: "linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "0.875rem",
              fontWeight: "bold",
            }}
          >
            {store.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </Box>
          <Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: "medium", color: "grey.900" }}
            >
              {store.name}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "isLocked",
      label: "Hoạt Động",
      sortable: true,
      render: (store) => (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            px: 1,
            py: 0.5,
            fontSize: "0.75rem",
            fontWeight: "medium",
            borderRadius: 1,
            color: store.isLocked ? "error.dark" : "success.dark",
          }}
        >
          {store.isLocked ? (
            <Lock sx={{ fontSize: 12, color: "error.main" }} />
          ) : (
            <LockOpen sx={{ fontSize: 12, color: "success.main" }} />
          )}
          {store.isLocked ? "Khóa" : "Hoạt động"}
        </Box>
      ),
    },
    {
      key: "isOpen",
      label: "Mở Cửa",
      sortable: true,
      render: (store) => (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            px: 1,
            py: 0.5,
            fontSize: "0.75rem",
            fontWeight: "medium",
            borderRadius: 1,
            color: store.isOpen ? "success.dark" : "warning.dark",
          }}
        >
          {store.isOpen ? (
            <CheckCircle sx={{ fontSize: 12 }} />
          ) : (
            <ToggleOff sx={{ fontSize: 12 }} />
          )}
          {store.isOpen ? "Mở" : "Đóng"}
        </Box>
      ),
    },
    {
      key: "reportCount",
      label: "Số Báo Cáo",
      sortable: true,
      render: (store) => (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {store.reportCount || 0}
        </Typography>
      ),
    },
    {
      key: "phoneNumber",
      label: "Số điện thoại",
      sortable: true,
      render: (store) => (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {store.phoneNumber || "N/A"}
        </Typography>
      ),
    },
    {
      key: "createdAt",
      label: "Ngày Tạo",
      sortable: true,
      render: (store) => (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {new Date(store.createdAt).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </Typography>
      ),
    },
    {
      key: "actions",
      label: "Hành Động",
      render: (store) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            onClick={() => {
              handleViewStore(store);
              console.log("Store data:", store);
            }}
            sx={{
              color: "primary.main",
              p: 0.5,
              bgcolor: "background.paper",
              borderRadius: 1,
              "&:hover": {
                color: "primary.dark",
                bgcolor: "blue[50]",
              },
            }}
            title="Xem Chi Tiết"
          >
            <Visibility sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            onClick={() => handleEditStore(store)}
            sx={{
              color: "success.main",
              p: 0.5,
              bgcolor: "background.paper",
              borderRadius: 1,
              "&:hover": {
                color: "success.dark",
                bgcolor: "green[50]",
              },
            }}
            title="Sửa Cửa Hàng"
          >
            <Edit sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            onClick={() => handleToggleStoreStatus(store.id, setConfirmModal)}
            sx={{
              color: store.isLocked ? "success.main" : "error.main",
              p: 0.5,
              bgcolor: "background.paper",
              borderRadius: 1,
              "&:hover": {
                color: store.isLocked ? "success.dark" : "error.dark",
                bgcolor: store.isLocked ? "green[50]" : "red[50]",
              },
            }}
            title={store.isLocked ? "Mở Khóa" : "Khóa"}
          >
            {store.isLocked ? (
              <LockOpen sx={{ fontSize: 16, color: "success.main" }} />
            ) : (
              <Lock sx={{ fontSize: 16, color: "error.main" }} />
            )}
          </IconButton>
        </Box>
      ),
    },
  ];

  const filters = {
    isOnline: [
      { label: "Mở", value: "true" },
      { label: "Đóng", value: "false" },
    ],
    isLocked: [
      { label: "Hoạt động", value: "false" },
      { label: "Khóa", value: "true" },
    ],
    isPayFee: [
      { label: "Đã thanh toán", value: "true" },
      { label: "Chưa thanh toán", value: "false" },
    ],
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: (theme) => theme.palette.grey[50],
      }}
    >
      <ConfirmModal
        open={confirmModal.open ?? false}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal({ open: false, title: "", message: "", onConfirm: () => {} })}
      />
      <Box
        component="header"
        sx={{
          display: "flex",
          height: 64,
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          px: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={(theme) => ({
            color: theme.palette.grey[700],
            fontWeight: theme.typography.fontWeightMedium,
          })}
        >
          Quản Lý Cửa Hàng
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Box>
          <Typography variant="body2" sx={(theme) => ({ color: theme.palette.grey[600] })}>
            Quản lý cửa hàng, đơn hàng, sản phẩm
          </Typography>
        </Box>

        <StoreStatsCards calculateStoreStats={calculateStoreStats} />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            mb: 2,
          }}
        >
          <TextField
            placeholder="Tìm kiếm cửa hàng..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="small"
            sx={{ maxWidth: 300, flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "grey.400" }} />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel>Trạng thái cửa hàng</InputLabel>
              <Select
                value={localFilters.isOnline ?? ""}
                onChange={(e) => handleFilterChange("isOnline", e.target.value)}
                label="Trạng thái cửa hàng"
              >
                <MenuItem value="">Tất cả</MenuItem>
                {filters.isOnline.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel>Trạng thái Khóa</InputLabel>
              <Select
                value={localFilters.isLocked ?? ""}
                onChange={(e) => handleFilterChange("isLocked", e.target.value)}
                label="Trạng thái Khóa"
              >
                <MenuItem value="">Tất cả</MenuItem>
                {filters.isLocked.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel>Phí</InputLabel>
              <Select
                value={localFilters.isPayFee ?? ""}
                onChange={(e) => handleFilterChange("isPayFee", e.target.value)}
                label="Phí"
              >
                <MenuItem value="">Tất cả</MenuItem>
                {filters.isPayFee.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                px: 2,
                py: 1,
                borderRadius: 1,
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              Tìm kiếm
            </Button>
          </Box>
        </Box>

        <CustomTable
          data={stores}
          totalCount={totalCount}
          columns={columns}
          onAddItem={handleAddStore}
          onExport={handleExportStores}
          onPageChange={handlePageChange}
          headerTitle="Tất Cả Cửa Hàng"
          description="Quản lý cửa hàng, đơn hàng, sản phẩm"
          showExport={true}
          showSearch={false}
          showBulkActions={false}
          itemsPerPage={15}
         
          onFilterChange={(newFilters) => {
            setLocalFilters((prev) => ({
              ...prev,
              ...Object.fromEntries(
                Object.entries(newFilters).map(([key, value]) => [
                  key,
                  value === "" ? undefined : value === "true",
                ])
              ),
            }));
          }}
        />
      </Box>

      <StoreDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        store={selectedStore}
        onEdit={handleEditStore}
        onToggleStatus={handleToggleStoreStatus}
      />

      <AddStoreModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleSubmitStore}
        editStore={editingStore}
      />
    </Box>
  );
}