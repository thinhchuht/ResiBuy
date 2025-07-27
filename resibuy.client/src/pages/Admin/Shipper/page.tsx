import { useState, useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import {
  Edit,
  Visibility,
  LocalShipping as ShipperIcon,
  Lock,
  LockOpen,
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
import type { Shipper } from "../../../types/models";

function ShipperStatsCards() {
  const [stats, setStats] = useState({
    totalShippers: 0,
    totalOnline: 0,
    totalShipping: 0,
    totalReported: 0,
  });

  useEffect(() => {
    calculateShipperStats().then(setStats);
  }, []);

  const cards = [
    {
      title: "Tổng Shipper",
      value: stats.totalShippers.toString(),
      icon: ShipperIcon,
      iconColor: "#1976d2",
      iconBgColor: "#e3f2fd",
      valueColor: "#1976d2",
    },
    {
      title: "Shipper Đang Hoạt Động",
      value: stats.totalOnline.toString(),
      icon: ShipperIcon,
      iconColor: "#d81b60",
      iconBgColor: "#fce4ec",
      valueColor: "#d81b60",
    },
    {
      title: "Shipper Đang Giao Hàng",
      value: stats.totalShipping.toString(),
      icon: ShipperIcon,
      iconColor: "#2e7d32",
      iconBgColor: "#e8f5e9",
      valueColor: "#2e7d32",
    },
    {
      title: "Shipper Bị Tố Cáo",
      value: stats.totalReported.toString(),
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
    handleViewShipper,
    handleCloseDetailModal,
    handleAddShipper,
    handleEditShipper,
    handleCloseAddModal,
    handleSubmitShipper,
    handleToggleLockShipper,
    handleExportShippers,
    handlePageChange,
    formatWorkTime,
    isShipperAvailable,
  } = useShippersLogic();

  const columns = [
    {
      key: "id" as keyof Shipper,
      label: "ID Shipper",
      sortable: true,
      render: (shipper: Shipper) => (
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            fontWeight: "medium",
            color: "primary.main",
          }}
        >
          {shipper.id}
        </Typography>
      ),
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
            onClick={() => handleToggleLockShipper(shipper.id, shipper.isLocked)}
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

          <ShipperStatsCards />

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