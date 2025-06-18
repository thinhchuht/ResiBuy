import { Box, Typography, IconButton } from "@mui/material";
import {
  CheckCircle,
  Edit,
  Visibility,
  Inventory,
  Store as StoreIcon,
  ToggleOff,
  Delete,
} from "@mui/icons-material";
import CustomTable from "../../../components/CustomTable";
import { AddStoreModal } from "../../../components/admin/Store/add-store-modal";
import { StoreDetailModal } from "../../../components/admin/Store/store-detail-modal";
import {
  calculateStoreStats,
  formatCurrency,
  formatDate,
  getStatusColor,
  useStoresLogic,
} from "../../../components/admin/Store/seg/utlis";
import { StatsCard } from "../../../layouts/AdminLayout/components/StatsCard";
import type { Store } from "../../../types/models";
import { TrendingUp } from "@mui/icons-material";

function StoreStatsCards() {
  const stats = calculateStoreStats(useStoresLogic().stores);

  const cards = [
    {
      title: "Tổng Cửa Hàng",
      value: stats.totalStores.toString(),
      icon: StoreIcon,
      iconColor: "#1976d2", // Xanh dương
      iconBgColor: "#e3f2fd", // Xanh dương nhạt
      valueColor: "#1976d2",
    },
    {
      title: "Chưa Kích Hoạt",
      value: stats.inactiveStores.toString(),
      icon: CheckCircle,
      iconColor: "#2e7d32", // Xanh lá
      iconBgColor: "#e8f5e9", // Xanh lá nhạt
      valueColor: "#2e7d32",
    },
    {
      title: "Cửa Hàng Hoạt Động",
      value: stats.activeStores.toString(),
      icon: CheckCircle,
      iconColor: "#7b1fa2", // Tím
      iconBgColor: "#f3e5f5", // Tím nhạt
      valueColor: "#7b1fa2",
    },
    {
      title: "Tổng Sản Phẩm",
      value: stats.totalProducts.toLocaleString(),
      icon: Inventory,
      iconColor: "#d81b60", // Hồng
      iconBgColor: "#fce4ec", // Hồng nhạt
      valueColor: "#d81b60",
    },
  ];

  const miniCards = [
    {
      title: "Chờ Xác Nhận",
      value: stats.activeStores.toString(),
      icon: CheckCircle,
      iconColor: "#2e7d32", // Xanh lá
      iconBgColor: "#e8f5e9", // Xanh lá nhạt
      valueColor: "#2e7d32",
    },
    {
      title: "Đang Giao",
      value: stats.inactiveStores.toString(),
      icon: CheckCircle,
      iconColor: "#dc2626", // Đỏ
      iconBgColor: "#fee2e2", // Đỏ nhạt
      valueColor: "#dc2626",
    },
    {
      title: "Đã Giao",
      value: stats.totalProducts.toString(),
      icon: CheckCircle,
      iconColor: "#1976d2", // Xanh dương
      iconBgColor: "#e3f2fd", // Xanh dương nhạt
      valueColor: "#1976d2",
    },
    {
      title: "Đã Hủy",
      value: stats.averageRevenue
        ? Math.round(stats.averageRevenue).toString()
        : "0",
      icon: CheckCircle,
      iconColor: "#7b1fa2", // Tím
      iconBgColor: "#f3e5f5", // Tím nhạt
      valueColor: "#7b1fa2",
    },
  ];

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
            lg: "1fr 1fr 1fr 1fr",
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
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
          gap: 2,
          mb: 3,
        }}
      >
        {miniCards.map((card, index) => (
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
    </>
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
    handleDeleteStore,
    handleToggleStoreStatus,
    handleExportStores,
  } = useStoresLogic();

  const storeStatusOptions = [
    { value: "active", label: "Hoạt Động" },
    { value: "inactive", label: "Không Hoạt Động" },
  ];

  const columns = [
    {
      key: "id",
      label: "ID Cửa Hàng",
      sortable: true,
      render: (store: Store) => (
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
      render: (store: Store) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box sx={{ width: 40, height: 40, mr: 1.5 }}>
            {store.imageUrl ? (
              <Box
                component="img"
                src={store.imageUrl}
                alt={store.name}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
                onError={(e) => {
                  e.currentTarget.src = "/images/default-store.png";
                }}
              />
            ) : (
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
                {store.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </Box>
            )}
          </Box>
          <Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: "medium", color: "grey.900" }}
            >
              {store.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "grey.500" }}>
              {store.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "phoneNumber",
      label: "Số Điện Thoại",
      sortable: true,
      render: (store: Store) => (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {store.phoneNumber}
        </Typography>
      ),
    },
    {
      key: "isActive",
      label: "Trạng Thái",
      filterable: true,
      render: (store: Store) => (
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
            bgcolor: "background.paper",
            ...getStatusColor(store.isActive),
          }}
        >
          {store.isActive ? (
            <CheckCircle sx={{ fontSize: 12 }} />
          ) : (
            <ToggleOff sx={{ fontSize: 12 }} />
          )}
          {store.isActive ? "Hoạt Động" : "Không Hoạt Động"}
        </Box>
      ),
    },
    {
      key: "products",
      label: "Sản Phẩm",
      sortable: true,
      render: (store: Store) => (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {store.products.length}
        </Typography>
      ),
    },
    {
      key: "totalRevenue",
      label: "Tổng Doanh Thu",
      sortable: true,
      render: (store: Store) => (
        <Typography
          variant="body2"
          sx={{ fontWeight: "medium", color: "grey.900" }}
        >
          {formatCurrency(
            store.products.reduce(
              (sum, product) => sum + product.price * product.sold,
              0
            )
          )}
        </Typography>
      ),
    },
    {
      key: "createdAt",
      label: "Ngày Tạo",
      sortable: true,
      render: (store: Store) => (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {formatDate(store.createdAt)}
        </Typography>
      ),
    },
    {
      key: "actions",
      label: "Hành Động",
      render: (store: Store) => (
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
              color: store.isActive ? "warning.main" : "success.main",
              p: 0.5,
              bgcolor: "background.paper",
              borderRadius: 1,
              "&:hover": {
                color: store.isActive ? "warning.dark" : "success.dark",
                bgcolor: store.isActive ? "yellow[50]" : "green[50]",
              },
            }}
            title={store.isActive ? "Vô Hiệu Hóa" : "Kích Hoạt"}
          >
            {store.isActive ? (
              <ToggleOff sx={{ fontSize: 16 }} />
            ) : (
              <CheckCircle sx={{ fontSize: 16 }} />
            )}
          </IconButton>
          <IconButton
            onClick={() => handleDeleteStore(store.id)}
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
            title="Xóa Cửa Hàng"
          >
            <Delete sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      ),
    },
  ];

  const filters = {
    isActive: storeStatusOptions,
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
            fontWeight: theme.typography.fontWeightMedium, // hoặc số: 500
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
          <Typography
            variant="body2"
            sx={(theme) => ({
              color: theme.palette.grey[600],
            })}
          >
            Quản lý cửa hàng, đơn hàng, sản phẩm
          </Typography>
        </Box>

        <StoreStatsCards />

        <CustomTable
          data={stores}
          columns={columns}
          onAddItem={handleAddStore}
          onExport={handleExportStores}
          headerTitle="Tất Cả Cửa Hàng"
          description="Quản lý cửa hàng, đơn hàng, sản phẩm"
          filters={filters}
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
        onDelete={handleDeleteStore}
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
