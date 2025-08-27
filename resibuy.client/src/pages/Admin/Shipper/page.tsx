
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Edit,
  Visibility,
  LocalShipping as ShipperIcon,
  Lock,
  LockOpen,
  Search as SearchIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CustomTable from "../../../components/CustomTable";
import { AddShipperModal } from "../../../components/admin/Shipper/add-shipper-modal";
import { ShipperDetailModal } from "../../../components/admin/Shipper/shipper-detail-modal";
import {
  calculateShipperStats,
  useShippersLogic,
} from "../../../components/admin/Shipper/seg/utlis";
import { StatsCard } from "../../../layouts/AdminLayout/components/StatsCard";
import { ConfirmModal } from "../../../components/ConfirmModal"; // Thêm import ConfirmModal
import type { Shipper } from "../../../types/models";

function ShipperStatsCards({
  stats,
  setStats,
}: {
  stats: { totalShippers: number; totalOnline: number; totalShipping: number; totalReported: number };
  setStats: (stats: { totalShippers: number; totalOnline: number; totalShipping: number; totalReported: number }) => void;
}) {
  const [localStats, setLocalStats] = useState(stats);

  // Đồng bộ localStats với stats từ props
  useEffect(() => {
    setLocalStats(stats);
  }, [stats]);

  // Khởi tạo stats khi component mount
  useEffect(() => {
    calculateShipperStats().then((newStats) => {
      console.log("Initial stats in ShipperStatsCards:", newStats); // Debug log
      setLocalStats(newStats);
      setStats(newStats);
    });
  }, []);

  const cards = [
    {
      title: "Tổng Shipper",
      value: localStats.totalShippers.toString(),
      icon: ShipperIcon,
      iconColor: "#1976d2",
      iconBgColor: "#e3f2fd",
      valueColor: "#1976d2",
    },
    {
      title: "Shipper Đang Hoạt Động",
      value: localStats.totalOnline.toString(),
      icon: ShipperIcon,
      iconColor: "#d81b60",
      iconBgColor: "#fce4ec",
      valueColor: "#d81b60",
    },
    {
      title: "Shipper Đang Giao Hàng",
      value: localStats.totalShipping.toString(),
      icon: ShipperIcon,
      iconColor: "#2e7d32",
      iconBgColor: "#e8f5e9",
      valueColor: "#2e7d32",
    },
    {
      title: "Shipper Bị Khóa",
      value: localStats.totalReported.toString(),
      icon: ShipperIcon,
      iconColor: "#ef4444",
      iconBgColor: "#fee2e2",
      valueColor: "#ef4444",
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        mb: 3,
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
            lg: "1fr 1fr 1fr 1fr",
          },
          gap: 3,
        }}
      >
        {cards.map((card, index) => (
          <StatsCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            iconColor={card.iconColor}
            iconBgColor={card.iconBgColor}
            valueColor={card.valueColor}
          />
        ))}
      </Box>
    </Box>
  );
}

export default function ShippersPage() {
  const [stats, setStats] = useState({
    totalShippers: 0,
    totalOnline: 0,
    totalShipping: 0,
    totalReported: 0,
  });

  const {
    shippers,
    totalCount,
    pageNumber,
    pageSize,
    totalPages,
    selectedShipper,
    isDetailModalOpen,
    isAddModalOpen,
    editingShipper,
    searchParams,
    setSearchParams,
    handleViewShipper,
    handleCloseDetailModal,
    handleAddShipper,
    handleEditShipper,
    handleCloseAddModal,
    handleSubmitShipper,
    handleToggleLockShipper,
    handleExportShippers,
    formatWorkTime,
    isShipperAvailable,
    fetchShippers,
    fetchShippersWithFilters,
  } = useShippersLogic(setStats);


  const [searchInput, setSearchInput] = useState("");
  const [localFilters, setLocalFilters] = useState<{
    isOnline?: boolean;
    isLocked?: boolean;
  }>({});
  // Thêm state cho ConfirmModal
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

  const handlePageChange = (newPage: number) => {
    console.log("Page changed to:", newPage);
    fetchShippers(newPage, pageSize);
  };

  useEffect(() => {
    if (Object.keys(searchParams).length === 0) {
      fetchShippers(pageNumber, pageSize);
    } else {
      fetchShippersWithFilters(
        searchParams.keyWord,
        searchParams.isOnline,
        searchParams.isLocked,
        pageNumber,
        pageSize
      );
    }
  }, [pageNumber]);

  const handleSearch = () => {
    setSearchParams({
      keyWord: searchInput || undefined,
      isOnline: localFilters.isOnline,
      isLocked: localFilters.isLocked,
    });
    handlePageChange(1);
  };

  const handleFilterChange = (key: string, value: string | boolean | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value === "true",
    }));
  };

  // Hàm mở modal xác nhận khi khóa/mở khóa shipper
  const handleOpenConfirmModal = (shipperId: string, isLocked: boolean) => {
    setConfirmModal({
      open: true,
      title: isLocked ? "Mở Khóa Shipper" : "Khóa Shipper",
      message: `Bạn có muốn ${isLocked ? "mở khóa" : "khóa"} shipper này?`,
      onConfirm: () => {
        handleToggleLockShipper(shipperId, isLocked);
        setConfirmModal((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const columns = [
    {
    key: "stt" as keyof Shipper,
    label: "STT",
    sortable: false,
    render: (user: Shipper) => {
      const index = shippers.indexOf(user); // Tính index từ mảng users
      console.log("STT render:", { pageNumber, pageSize, index }); // Debug log
      const stt = isNaN(pageNumber) || isNaN(pageSize) || !pageNumber || !pageSize
        ? index + 1
        : (pageNumber - 1) * pageSize + index + 1;
      return (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {stt}
        </Typography>
      );
    },
  },
    {
      key: "fullName" as keyof Shipper,
      label: "Họ Tên",
      sortable: true,
      render: (shipper: Shipper) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box sx={{ width: 40, height: 40, mr: 1.5 }}>
            <Box
              sx={{
                width: "100%",
                height: "100%",
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
              {shipper.fullName
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "?"}
            </Box>
          </Box>
          <Typography
            variant="body2"
            sx={{ fontWeight: "medium", color: "grey.900" }}
          >
            {shipper.fullName || "N/A"}
          </Typography>
        </Box>
      ),
    },
    {
      key: "email" as keyof Shipper,
      label: "Email",
      sortable: true,
      render: (shipper: Shipper) => (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {shipper.email || "N/A"}
        </Typography>
      ),
    },
    {
      key: "phoneNumber" as keyof Shipper,
      label: "Số Điện Thoại",
      sortable: true,
      render: (shipper: Shipper) => (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {shipper.phoneNumber || "N/A"}
        </Typography>
      ),
    },
    {
      key: "isLocked" as keyof Shipper,
      label: "Trạng Thái Khóa",
      sortable: true,
      render: (shipper: Shipper) => (
        <Typography
          variant="body2"
          sx={{ color: shipper.isLocked ? "error.main" : "success.main" }}
        >
          {shipper.isLocked ? "Đã Khóa" : "Không Khóa"}
        </Typography>
      ),
    },
    {
      key: "lastLocationName" as keyof Shipper,
      label: "Vị Trí Cuối",
      sortable: true,
      render: (shipper: Shipper) => (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {shipper.lastLocationName || "N/A"}
        </Typography>
      ),
    },
    {
      key: "startWorkTime" as keyof Shipper,
      label: "Thời Gian Làm Việc",
      sortable: false,
      render: (shipper: Shipper) => (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {formatWorkTime(shipper.startWorkTime)} - {formatWorkTime(shipper.endWorkTime)}
        </Typography>
      ),
    },
    {
      key: "actions" as keyof Shipper,
      label: "Hành Động",
      render: (shipper: Shipper) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            onClick={() => {
              handleViewShipper(shipper);
              console.log("Shipper data:", shipper);
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
            onClick={() => handleEditShipper(shipper)}
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
            title="Sửa Shipper"
          >
            <Edit sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            onClick={() => handleOpenConfirmModal(shipper.id, shipper.isLocked)} // Gọi modal xác nhận
            sx={{
              color: shipper.isLocked ? "warning.main" : "info.main",
              p: 0.5,
              bgcolor: "background.paper",
              borderRadius: 1,
              "&:hover": {
                color: shipper.isLocked ? "warning.dark" : "info.dark",
                bgcolor: shipper.isLocked ? "yellow[50]" : "cyan[50]",
              },
            }}
            title={shipper.isLocked ? "Mở Khóa Shipper" : "Khóa Shipper"}
          >
            {shipper.isLocked ? <LockOpen sx={{ fontSize: 16 }} /> : <Lock sx={{ fontSize: 16 }} />}
          </IconButton>
        </Box>
      ),
    },
  ];

  const filters = {
    isOnline: [
      { label: "Online", value: "true" },
      { label: "Offline", value: "false" },
    ],
    isLocked: [
      { label: "Hoạt động", value: "false" },
      { label: "Khóa", value: "true" },
    ],
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          bgcolor: (theme) => theme.palette.grey[50],
        }}
      >
        {/* Thêm ConfirmModal */}
        <ConfirmModal
          open={confirmModal.open}
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
            Quản Lý Shipper
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
            <Typography
              variant="body2"
              sx={(theme) => ({
                color: theme.palette.grey[600],
              })}
            >
              Quản lý shipper và đơn hàng
            </Typography>
          </Box>

         <ShipperStatsCards stats={stats} setStats={setStats} /> {/* Truyền stats vào ShipperStatsCards */}


          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              mb: 2,
            }}
          >
            <TextField
              placeholder="Tìm kiếm shipper..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              size="small"
              sx={{ maxWidth: 400, flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "grey.400" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <FormControl size="small" sx={{ minWidth: 190 }}>
                <InputLabel>Trạng thái hoạt động</InputLabel>
                <Select
                  value={localFilters.isOnline ?? ""}
                  onChange={(e) => handleFilterChange("isOnline", e.target.value)}
                  label="Trạng thái hoạt động"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {filters.isOnline.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 185 }}>
                <InputLabel>Khóa</InputLabel>
                <Select
                  value={localFilters.isLocked ?? ""}
                  onChange={(e) => handleFilterChange("isLocked", e.target.value)}
                  label="Khóa"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {filters.isLocked.map((option) => (
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
            data={shippers}
            totalCount={totalCount}
            columns={columns}
            onAddItem={handleAddShipper}
            onExport={handleExportShippers}
            onPageChange={handlePageChange}
            headerTitle="Tất Cả Shipper"
            description="Quản lý shipper và đơn hàng"
            showExport={true}
            showBulkActions={false}
            itemsPerPage={pageSize}
showSearch={false}
          
          />
        </Box>

        <ShipperDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          shipper={selectedShipper}
          onEdit={handleEditShipper}
        />

        <AddShipperModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          onSubmit={handleSubmitShipper}
          editingShipper={editingShipper}
        />
      </Box>
    </LocalizationProvider>
  );
}
