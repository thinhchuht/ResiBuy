import { useState, useEffect } from "react";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import {
  CheckCircle,
  Edit,
  Visibility,
  ToggleOff,
  Store as StoreIcon,
} from "@mui/icons-material";
import CustomTable from "../../../components/CustomTable";
import { AddStoreModal } from "../../../components/admin/Store/add-store-modal";
import { StoreDetailModal } from "../../../components/admin/Store/store-detail-modal";
import { StatsCard } from "../../../layouts/AdminLayout/components/StatsCard";
import { getStatusColor, useStoresLogic } from "../../../components/admin/Store/seg/utlis";

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

  const cards = [
    {
      title: "Tổng Cửa Hàng",
      value: stats.totalStores.toString(),
      icon: StoreIcon,
      iconColor: "#1976d2",
      iconBgColor: "#e3f2fd",
      valueColor: "#1976d2",
    },
    {
      title: "Cửa Hàng Hoạt Động",
      value: stats.activeStores.toString(),
      icon: CheckCircle,
      iconColor: "#2e7d32",
      iconBgColor: "#e8f5e9",
      valueColor: "#2e7d32",
    },
    {
      title: "Cửa Hàng Đang khóa",
      value: stats.inactiveStores.toString(),
      icon: ToggleOff,
      iconColor: "#dc2626",
      iconBgColor: "#fee2e2",
      valueColor: "#dc2626",
    },
    {
      title: "Cửa Hàng Đang mở",
      value: stats.openStore.toString(),
      icon: CheckCircle,
      iconColor: "#2e7d32",
      iconBgColor: "#e8f5e9",
      valueColor: "#2e7d32",
    },
    {
      title: "Cửa Hàng Đang Đóng",
      value: stats.closeStore.toString(),
      icon: ToggleOff,
      iconColor: "#dc2626",
      iconBgColor: "#fee2e2",
      valueColor: "#dc2626",
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
          lg: "1fr 1fr 1fr",
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
          />
        ))
      )}
    </Box>
  );
}

export default function StoresPage() {
  const {
    stores,
    selectedStore,
    isDetailModalOpen,
    isAddModalOpen,
    editingStore,
    handleViewStore,
    handleCloseDetailModal,
    handleAddStore,
    handleEditStore,
    handleCloseAddModal,
    handleSubmitStore,
    handleToggleStoreStatus,
    handleExportStores,
    calculateStoreStats,
  } = useStoresLogic();

  const columns = [
    {
      key: "id",
      label: "ID Cửa Hàng",
      sortable: true,
      render: (store) => (
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            fontWeight: "medium",
            color: "primary.main",
          }}
        >
          {store.id}
        </Typography>
      ),
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
            <ToggleOff sx={{ fontSize: 12 }} />
          ) : (
            <CheckCircle sx={{ fontSize: 12 }} />
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
            onClick={() => handleToggleStoreStatus(store.id)}
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
              <CheckCircle sx={{ fontSize: 16 }} />
            ) : (
              <ToggleOff sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: (theme) => theme.palette.grey[50],
      }}
    >
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

        <CustomTable
          data={stores}
          columns={columns}
          onAddItem={handleAddStore}
          onExport={handleExportStores}
          headerTitle="Tất Cả Cửa Hàng"
          description="Quản lý cửa hàng, đơn hàng, sản phẩm"
          showExport={true}
          showBulkActions={false}
          itemsPerPage={15}
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