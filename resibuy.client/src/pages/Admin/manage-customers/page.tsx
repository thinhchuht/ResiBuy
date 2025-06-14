

import CustomTable from "../../../components/CustomTable";
import { AddCustomerModal } from "../../../components/admin/Customer/add-customer-modal";
import  { CustomerDetailModal } from "./../../../components/admin/Customer/customer-detail-modal";
import {
  calculateCustomerStats,
  formatCurrency,
  formatDate,
  getLoyaltyTierColor,
  getStatusColor,
  useCustomersLogic,
} from "./../../../components/admin/Customer/seg/utils";
import { MiniStatsCard, StatsCard } from "../../../layouts/AdminLayout/components/StatsCard";
import {
  customerStatusOptions,
  loyaltyTierOptions, type Customer
} from "../../..//constants/manage-customers/index";
import { Area, Container, Core, RText, Yard } from "../../../lib/by/Div";
import {
  Ban,
  CheckCircle,
  DollarSign,
  Edit,
  Eye,
  Star,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";

export default function CustomersPage() {
  const {
    customers,
    selectedCustomer,
    isDetailModalOpen,
    isAddModalOpen,
    editingCustomer,
    handleViewCustomer,
    handleCloseDetailModal,
    handleAddCustomer,
    handleEditCustomer,
    handleCloseAddModal,
    handleSubmitCustomer,
    handleDeleteCustomer,
    handleDeactivateCustomer,
    handleUpdateGameScore,
    handleExportCustomers,
  } = useCustomersLogic();

  const stats = calculateCustomerStats(customers);

  const columns = [
    {
      key: "id" as const,
      label: "CusID",
      sortable: true,
      render: (customer: Customer) => (
        <RText className="font-mono text-sm font-medium text-blue-600">
          {customer.id}
        </RText>
      ),
    },
    {
      key: "name" as const,
      label: "Customer",
      sortable: true,
      render: (customer: Customer) => (
        <Area className="flex items-center">
          <Yard className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
            {customer.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </Yard>
          <Yard>
            <RText className="font-medium text-gray-900">{customer.name}</RText>
            <RText className="text-sm text-gray-500">{customer.email}</RText>
          </Yard>
        </Area>
      ),
    },
    {
      key: "phone" as const,
      label: "Phone",
      sortable: true,
      render: (customer: Customer) => (
        <RText className="text-sm text-gray-900">{customer.phone}</RText>
      ),
    },
    {
      key: "status" as const,
      label: "Status",
      filterable: true,
      render: (customer: Customer) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}
        >
          {customer.status === "active" && <CheckCircle className="w-3 h-3" />}
          {customer.status === "inactive" && <Ban className="w-3 h-3" />}
          {customer.status === "blocked" && <Ban className="w-3 h-3" />}
          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
        </span>
      ),
    },
    {
      key: "loyaltyTier" as const,
      label: "Tier",
      filterable: true,
      render: (customer: Customer) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getLoyaltyTierColor(customer.loyaltyTier)}`}
        >
          <Star className="w-3 h-3" />
          {customer.loyaltyTier.charAt(0).toUpperCase() +
            customer.loyaltyTier.slice(1)}
        </span>
      ),
    },
    {
      key: "totalOrders" as const,
      label: "Orders",
      sortable: true,
      render: (customer: Customer) => (
        <RText className="text-sm text-gray-900">{customer.totalOrders}</RText>
      ),
    },
    {
      key: "totalSpent" as const,
      label: "Total Spent",
      sortable: true,
      render: (customer: Customer) => (
        <RText className="text-sm font-semibold text-gray-900">
          {formatCurrency(customer.totalSpent)}
        </RText>
      ),
    },
    {
      key: "gameScore" as const,
      label: "Game Score",
      sortable: true,
      render: (customer: Customer) => (
        <RText className="text-sm font-medium text-purple-600">
          {customer.gameScore}
        </RText>
      ),
    },
    {
      key: "dateJoined" as const,
      label: "Joined",
      sortable: true,
      render: (customer: Customer) => (
        <RText className="text-sm text-gray-900">
          {formatDate(customer.dateJoined)}
        </RText>
      ),
    },
    {
      key: "actions" as const,
      label: "Actions",
      render: (customer: Customer) => (
        <Area className="flex items-center space-x-1">
          <button
            onClick={() => handleViewCustomer(customer)}
            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditCustomer(customer)}
            className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded transition-colors"
            title="Edit Customer"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeactivateCustomer(customer.id)}
            className={`p-1 rounded transition-colors ${
              customer.status === "active"
                ? "text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50"
                : "text-green-600 hover:text-green-800 hover:bg-green-50"
            }`}
            title={customer.status === "active" ? "Deactivate" : "Activate"}
          >
            {customer.status === "active" ? (
              <Ban className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => handleDeleteCustomer(customer.id)}
            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
            title="Delete Customer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </Area>
      ),
    },
  ];

  const filters = {
    status: customerStatusOptions,
    loyaltyTier: loyaltyTierOptions,
  };

  return (
    <Core className="flex flex-col h-full bg-gray-50">
      {/* Page Header */}
      <header className="flex h-16 items-center justify-between border-b bg-white px-4">
        <RText className="text-lg font-semibold text-gray-700">
          Customer Management
        </RText>
      </header>

      <Container className="flex-1 overflow-auto p-6 space-y-6">
        <Area>
          <RText className="text-gray-600">
            Manage customer accounts, loyalty programs, and game scores
          </RText>
        </Area>
        {/* Main Stats Cards */}
        <Area className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon={Users}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
          />
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            iconColor="text-green-600"
            iconBgColor="bg-green-50"
            valueColor="text-green-600"
          />
          <StatsCard
            title="Active Customers"
            value={stats.activeCustomers}
            icon={CheckCircle}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-50"
            valueColor="text-purple-600"
          />
          <StatsCard
            title="Total Game Score"
            value={stats.totalGameScore.toLocaleString()}
            icon={Trophy}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-50"
            valueColor="text-yellow-600"
          />
        </Area>

        {/* Mini Stats Cards */}
        <Area className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MiniStatsCard
            value={stats.loyaltyTierCounts.bronze || 0}
            label="Bronze"
            valueColor="text-orange-600"
          />
          <MiniStatsCard
            value={stats.loyaltyTierCounts.silver || 0}
            label="Silver"
            valueColor="text-gray-600"
          />
          <MiniStatsCard
            value={stats.loyaltyTierCounts.gold || 0}
            label="Gold"
            valueColor="text-yellow-600"
          />
          <MiniStatsCard
            value={stats.loyaltyTierCounts.platinum || 0}
            label="Platinum"
            valueColor="text-purple-600"
          />
        </Area>

        {/* Customers Table */}
        <CustomTable
          data={customers}
          columns={columns}
          onAddItem={handleAddCustomer}
          onExport={handleExportCustomers}
          headerTitle="All Customers"
          description="Manage customer accounts and information"
          filters={filters}
          showExport={true}
          showBulkActions={false}
          itemsPerPage={15}
        />
      </Container>

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        customer={selectedCustomer}
        onEdit={handleEditCustomer}
        onDelete={handleDeleteCustomer}
        onDeactivate={handleDeactivateCustomer}
        onUpdateGameScore={handleUpdateGameScore}
      />

      {/* Add/Edit Customer Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleSubmitCustomer}
        editCustomer={editingCustomer}
      />
    </Core>
  );
}
