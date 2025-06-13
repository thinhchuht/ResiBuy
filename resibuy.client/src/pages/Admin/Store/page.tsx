import CustomTable from "../../../components/CustomTable";
import { AddStoreModal } from "../../../components/admin/Store/add-store-model";
import { StoreDetailModal } from "../../../components/admin/Store/store-detail-modal";
import {
  calculateStoreStats,
  formatCurrency,
  formatDate,
  getStatusColor,
  useStoresLogic,
} from "../../../components/admin/Store/seg/utlis";
import { MiniStatsCard, StatsCard } from "../../../layouts/AdminLayout/components/StatsCard";
import { type Store } from "../../../types/models";
import { Area, Container, Core, RText, Yard } from "../../../lib/by/Div";
import {
  CheckCircle,
  DollarSign,
  Edit,
  Eye,
  Package,
  Store as StoreIcon,
  ToggleLeft,
  Trash2,
} from "lucide-react";

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

  const stats = calculateStoreStats(stores);

  const storeStatusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const columns = [
    {
      key: "id" as const,
      label: "StoreID",
      sortable: true,
      render: (store: Store) => (
        <RText className="font-mono text-sm font-medium text-blue-600">
          {store.id}
        </RText>
      ),
    },
   {
  key: "name" as const,
  label: "Cửa hàng",
  sortable: true,
  render: (store: Store) => (
    <Area className="flex items-center">
      <Yard className="w-10 h-10 mr-3">
        {store.imageUrl ? (
          <img
            src={store.imageUrl}
            alt={store.name}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              e.currentTarget.src = "/images/default-store.png";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {store.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </div>
        )}
      </Yard>
      <Yard>
        <RText className="font-medium text-gray-900">{store.name}</RText>
        <RText className="text-sm text-gray-500">{store.email}</RText>
      </Yard>
    </Area>
  ),
},
    {
      key: "phoneNumber" as const,
      label: "Phone",
      sortable: true,
      render: (store: Store) => (
        <RText className="text-sm text-gray-900">{store.phoneNumber}</RText>
      ),
    },
    {
      key: "isActive" as const,
      label: "Status",
      filterable: true,
      render: (store: Store) => (
        <span
          className={`inline-flex items-center bg-white gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(store.isActive)}`}
        >
          {store.isActive ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <ToggleLeft className="w-3 h-3" />
          )}
          {store.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "products" as const,
      label: "Products",
      sortable: true,
      render: (store: Store) => (
        <RText className="text-sm text-gray-900">{store.products.length}</RText>
      ),
    },
    {
      key: "totalRevenue" as const,
      label: "Total Revenue",
      sortable: true,
      render: (store: Store) => (
        <RText className="text-sm font-semibold text-gray-900">
          {formatCurrency(
            store.products.reduce(
              (sum, product) => sum + product.price * product.sold,
              0
            )
          )}
        </RText>
      ),
    },
    {
      key: "createdAt" as const,
      label: "Created",
      sortable: true,
      render: (store: Store) => (
        <RText className="text-sm text-gray-900">
          {formatDate(store.createdAt)}
        </RText>
      ),
    },
    {
      key: "actions" as const,
      label: "Actions",
      render: (store: Store) => (
        <Area className="flex items-center space-x-1 ">
          <button
            onClick={() => {handleViewStore(store)
                console.log("Store data:", store);}
            }
            className="text-blue-600 hover:text-blue-800 p-1  bg-white hover:bg-blue-50 rounded transition-colors"
            title="View Details"

          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditStore(store)}
            className="text-green-600 hover:text-green-800 p-1  bg-white hover:bg-green-50 rounded transition-colors"
            title="Edit Store"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleStoreStatus(store.id)}
            className={`p-1 rounded transition-colors ${
              store.isActive
                ? "text-yellow-600 hover:text-yellow-800  bg-white hover:bg-yellow-50"
                : "text-green-600 hover:text-green-800  bg-white hover:bg-green-50"
            }`}
            title={store.isActive ? "Deactivate" : "Activate"}
          >
            {store.isActive ? (
              <ToggleLeft className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => handleDeleteStore(store.id)}
            className="text-red-600 hover:text-red-800 p-1  bg-white hover:bg-red-50 rounded transition-colors"
            title="Delete Store"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </Area>
      ),
    },
  ];

  const filters = {
    isActive: storeStatusOptions,
  };

  return (
    <Core className="flex flex-col h-full bg-gray-50">
      {/* Page Header */}
      <header className="flex h-16 items-center justify-between border-b bg-white px-4">
        <RText className="text-lg font-semibold text-gray-700">
          Store Management
        </RText>
      </header>

      <Container className="flex-1 overflow-auto p-6 space-y-6">
        <Area>
          <RText className="text-gray-600">
           Quản lý cửa hàng đơn hàng, sản phẩm
          </RText>
        </Area>
        {/* Main Stats Cards */}
        <Area className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Total Stores"
            value={stats.totalStores}
            icon={StoreIcon}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
          />
          <StatsCard
            title="Chưa kích hoạt"
            value={(stats.inactiveStores)}
            icon={CheckCircle}
            iconColor="text-green-600"
            iconBgColor="bg-green-50"
            valueColor="text-green-600"
          />
          <StatsCard
            title="Active Stores"
            value={stats.activeStores}
            icon={CheckCircle}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-50"
            valueColor="text-purple-600"
          />
          <StatsCard
            title="Total Products"
            value={stats.totalProducts.toLocaleString()}
            icon={Package}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-50"
            valueColor="text-yellow-600"
          />
        </Area>

        {/* Mini Stats Cards */}
        <Area className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MiniStatsCard
            value={stats.activeStores}
            label="Chờ xác nhận"
            valueColor="text-green-600"
          />
          <MiniStatsCard
            value={stats.inactiveStores}
            label="Đang giao"
            valueColor="text-red-600"
          />
          <MiniStatsCard
            value={stats.totalProducts}
            label="Đã giao"
            valueColor="text-blue-600"
          />
          <MiniStatsCard
            value={stats.averageRevenue ? Math.round(stats.averageRevenue) : 0}
            label="Đã huy"
            valueColor="text-purple-600"
          />
        </Area>

        {/* Stores Table */}
        <CustomTable
          data={stores}
          columns={columns}
          onAddItem={handleAddStore}
          onExport={handleExportStores}
          headerTitle="All Stores"
          description="Quản lý cửa hàng, đơn hàn, sản phẩm"
          filters={filters}
          showExport={true}
          showBulkActions={false}
          itemsPerPage={15}
        />
      </Container>

      {/* Store Detail Modal */}
      <StoreDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        store={selectedStore}
        onEdit={handleEditStore}
        onDelete={handleDeleteStore}
        onToggleStatus={handleToggleStoreStatus}
        
      />

      {/* Add/Edit Store Modal */}
      <AddStoreModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleSubmitStore}
        editStore={editingStore}
      />
    </Core>
  );
}