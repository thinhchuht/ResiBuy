import { Box, Typography, IconButton } from "@mui/material";
import {
  Edit,
  Visibility,
  LocalShipping as ShipperIcon,
  ShoppingCart as OrderIcon,
  Delete,
} from "@mui/icons-material";
import CustomTable from "../../../components/CustomTable";
import { AddShipperModal } from "../../../components/admin/Shipper/add-shipper-modal";
import { ShipperDetailModal } from "../../../components/admin/Shipper/shipper-detail-modal";
import {
  calculateShipperStats,
  formatCurrency,
  useShippersLogic,
} from "../../../components/admin/Shipper/seg/utlis";
import { StatsCard } from "../../../layouts/AdminLayout/components/StatsCard";
import type { Shipper, User } from "../../../types/models";

function ShipperStatsCards() {
  const stats = calculateShipperStats(useShippersLogic().shippers);

  const cards = [
    {
      title: "Tổng Shipper",
      value: stats.totalShippers.toString(),
      icon: ShipperIcon,
      iconColor: "#1976d2", // Xanh dương
      iconBgColor: "#e3f2fd", // Xanh dương nhạt
      valueColor: "#1976d2",
    },
    {
      title: "Tổng Đơn Hàng",
      value: stats.totalOrders.toLocaleString(),
      icon: OrderIcon,
      iconColor: "#d81b60", // Hồng
      iconBgColor: "#fce4ec", // Hồng nhạt
      valueColor: "#d81b60",
    },
    {
      title: "Tổng shipper hoạt động",
      value: formatCurrency(stats.totalRevenue),
      icon: ShipperIcon,
      iconColor: "#2e7d32", // Xanh lá
      iconBgColor: "#e8f5e9", // Xanh lá nhạt
      valueColor: "#2e7d32",
    },
  ];

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
  );
}

export default function ShippersPage() {
  const {
    shippers,
    users,
    selectedShipper,
    selectedUser,
    isDetailModalOpen,
    isAddModalOpen,
    editingShipper,
    editingUser,
    handleViewShipper,
    handleCloseDetailModal,
    handleAddShipper,
    handleEditShipper,
    handleCloseAddModal,
    handleSubmitShipper,
    handleDeleteShipper,
    handleExportShippers,
    countOrdersByShipperId,
    formatWorkTime,
    isShipperAvailable,
  } = useShippersLogic();

  const columns = [
    {
      key: "id",
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
      key: "fullName",
      label: "Họ Tên",
      sortable: true,
      render: (shipper: Shipper) => {
        const user = users.find((u) => u.id === shipper.userId);
        return (
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
                {user?.fullName
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
              {user?.fullName || "N/A"}
            </Typography>
          </Box>
        );
      },
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (shipper: Shipper) => {
        const user = users.find((u) => u.id === shipper.userId);
        return (
          <Typography variant="body2" sx={{ color: "grey.900" }}>
            {user?.email || "N/A"}
          </Typography>
        );
      },
    },
    {
      key: "status",
      label: "Trạng Thái",
      sortable: true,
      render: (shipper: Shipper) => (
        <Typography
          variant="body2"
          sx={{ color: isShipperAvailable(shipper) ? "success.main" : "error.main" }}
        >
          {isShipperAvailable(shipper) ? "Sẵn Sàng" : "Không Sẵn Sàng"}
        </Typography>
      ),
    },
    {
      key: "workTime",
      label: "Thời Gian Làm Việc",
      sortable: false,
      render: (shipper: Shipper) => (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {formatWorkTime(shipper.startWorkTime)} - {formatWorkTime(shipper.endWorkTime)}
        </Typography>
      ),
    },
    {
      key: "totalOrders",
      label: "Tổng Đơn Hàng",
      sortable: true,
      render: (shipper: Shipper) => (
        <Typography
          variant="body2"
          sx={{ fontWeight: "medium", color: "grey.900" }}
        >
          {countOrdersByShipperId(shipper.id)}
        </Typography>
      ),
    },
    {
      key: "actions",
      label: "Hành Động",
      render: (shipper: Shipper) => {
        const user = users.find((u) => u.id === shipper.userId);
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton
              onClick={() => {
                handleViewShipper(shipper);
                console.log("Shipper data:", shipper, user);
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
              onClick={() => user && handleEditShipper(shipper, user)}
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
              onClick={() => handleDeleteShipper(shipper.id)}
              sx={{
                color: "error.main",
                p: 0.5,
                bgcolor: "background.paper",
                borderRadius: 1,
                "&:hover": {
                  color: "error.dark",
                  bgcolor: "red[50]",
                },
              }}
              title="Xóa Shipper"
            >
              <Delete sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        );
      },
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
          columns={columns}
          onAddItem={handleAddShipper}
          onExport={handleExportShippers}
          headerTitle="Tất Cả Shipper"
          description="Quản lý shipper và đơn hàng"
          showExport={true}
          showBulkActions={false}
          itemsPerPage={15}
        />
      </Box>

      <ShipperDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        shipper={selectedShipper}
        user={selectedUser}
        onEdit={handleEditShipper}
        onDelete={handleDeleteShipper}
      />

      <AddShipperModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleSubmitShipper}
        editingShipper={editingShipper}
        editingUser={editingUser}
      />
    </Box>
  );
}