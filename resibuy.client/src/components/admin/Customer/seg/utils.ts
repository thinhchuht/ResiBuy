
import type React from "react";

import { useState } from "react";
import type {
  Customer,
  GameScoreTransaction,
  CustomerOrder,
} from "../../../../constants/manage-customers/index";
import {
  sampleCustomers,
  sampleGameScoreTransactions,
} from "../../../../constants/manage-customers/index";
import { sampleOrders } from "../../../../constants/manage-orders/index";

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  status: "active" | "inactive" | "blocked";
  loyaltyTier: "bronze" | "silver" | "gold" | "platinum";
  gameScore: string;
  notes: string;
}

// Hook quản lý customers
export const useCustomersLogic = () => {
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [gameScoreTransactions, setGameScoreTransactions] = useState<
    GameScoreTransaction[]
  >(sampleGameScoreTransactions);

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsAddModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingCustomer(null);
  };

  const handleSubmitCustomer = (customerData: Customer) => {
    if (editingCustomer) {
      // Update existing customer
      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === customerData.id ? customerData : customer
        )
      );
      // Update selectedCustomer if viewing details
      if (selectedCustomer && selectedCustomer.id === customerData.id) {
        setSelectedCustomer(customerData);
      }
    } else {
      // Add new customer
      setCustomers((prev) => [...prev, customerData]);
    }
    setIsAddModalOpen(false);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this customer? This action cannot be undone."
      )
    ) {
      setCustomers((prev) =>
        prev.filter((customer) => customer.id !== customerId)
      );
      if (selectedCustomer && selectedCustomer.id === customerId) {
        handleCloseDetailModal();
      }
    }
  };

  const handleDeactivateCustomer = (customerId: string) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              status: customer.status === "active" ? "inactive" : "active",
            }
          : customer
      )
    );
    // Update selectedCustomer if viewing details
    if (selectedCustomer && selectedCustomer.id === customerId) {
      setSelectedCustomer((prev) =>
        prev
          ? {
              ...prev,
              status: prev.status === "active" ? "inactive" : "active",
            }
          : null
      );
    }
  };

  const handleUpdateGameScore = (
    customerId: string,
    amount: number,
    description: string,
    type: GameScoreTransaction["type"]
  ) => {
    // Update customer game score
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === customerId
          ? { ...customer, gameScore: Math.max(0, customer.gameScore + amount) }
          : customer
      )
    );

    // Add transaction record
    const newTransaction: GameScoreTransaction = {
      id: `GST-${Date.now()}`,
      customerId,
      type,
      amount,
      description,
      date: new Date().toISOString(),
    };
    setGameScoreTransactions((prev) => [newTransaction, ...prev]);

    // Update selectedCustomer if viewing details
    if (selectedCustomer && selectedCustomer.id === customerId) {
      setSelectedCustomer((prev) =>
        prev
          ? {
              ...prev,
              gameScore: Math.max(0, prev.gameScore + amount),
            }
          : null
      );
    }
  };

  const handleExportCustomers = () => {
    const headers = [
      "Customer ID",
      "Name",
      "Email",
      "Phone",
      "Status",
      "Total Spent",
      "Total Orders",
      "Game Score",
      "Loyalty Tier",
      "Date Joined",
    ];
    const csvContent = [
      headers.join(","),
      ...customers.map((customer) =>
        [
          customer.id,
          `"${customer.name}"`,
          customer.email,
          customer.phone,
          customer.status,
          `$${customer.totalSpent.toFixed(2)}`,
          customer.totalOrders,
          customer.gameScore,
          customer.loyaltyTier,
          new Date(customer.dateJoined).toLocaleDateString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return {
    customers,
    selectedCustomer,
    isDetailModalOpen,
    isAddModalOpen,
    editingCustomer,
    gameScoreTransactions,
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
  };
};

// Hook quản lý customer form
export const useCustomerForm = (editCustomer?: Customer | null) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: editCustomer?.name || "",
    email: editCustomer?.email || "",
    phone: editCustomer?.phone || "",
    address: editCustomer?.address || "",
    status: editCustomer?.status || "active",
    loyaltyTier: editCustomer?.loyaltyTier || "bronze",
    gameScore: editCustomer?.gameScore?.toString() || "0",
    notes: editCustomer?.notes || "",
  });

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (data: CustomerFormData) => {
    const errors: any = {};

    if (!data.name?.trim()) {
      errors.name = "Customer name is required";
    }

    if (!data.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Email is invalid";
    }

    if (!data.phone?.trim()) {
      errors.phone = "Phone number is required";
    }

    if (!data.address?.trim()) {
      errors.address = "Address is required";
    }

    if (data.gameScore && isNaN(Number(data.gameScore))) {
      errors.gameScore = "Game score must be a number";
    }

    return errors;
  };

  const handleSubmit = async (
    e: React.FormEvent,
    onSubmit: (data: Customer) => void
  ) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    const customerData: Customer = {
      ...formData,
      id:
        editCustomer?.id ||
        `CUST-${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(3, "0")}`,
      gameScore: Number.parseInt(formData.gameScore) || 0,
      totalSpent: editCustomer?.totalSpent || 0,
      totalOrders: editCustomer?.totalOrders || 0,
      dateJoined: editCustomer?.dateJoined || new Date().toISOString(),
      lastLogin: editCustomer?.lastLogin || new Date().toISOString(),
    };

    try {
      await onSubmit(customerData);
    } catch (error) {
      console.error("Error submitting customer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleInputChange,
    handleSubmit,
  };
};

// Utility functions
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusColor = (status: Customer["status"]) => {
  const colors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-yellow-100 text-yellow-800",
    blocked: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

export const getLoyaltyTierColor = (tier: Customer["loyaltyTier"]) => {
  const colors = {
    bronze: "bg-orange-100 text-orange-800",
    silver: "bg-gray-100 text-gray-800",
    gold: "bg-yellow-100 text-yellow-800",
    platinum: "bg-purple-100 text-purple-800",
  };
  return colors[tier] || "bg-gray-100 text-gray-800";
};

export const getCustomerOrders = (customerId: string): CustomerOrder[] => {
  return sampleOrders
    .filter(
      (order) =>
        order.customerEmail ===
        sampleCustomers.find((c) => c.id === customerId)?.email
    )
    .map((order) => ({
      id: order.id,
      date: order.orderDate,
      status: order.status,
      total: order.total,
      items: order.items.length,
    }));
};

export const getGameScoreTransactions = (
  customerId: string
): GameScoreTransaction[] => {
  return sampleGameScoreTransactions.filter(
    (transaction) => transaction.customerId === customerId
  );
};

export const calculateCustomerStats = (customers: Customer[]) => {
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === "active").length;
  const inactiveCustomers = customers.filter(
    (c) => c.status === "inactive"
  ).length;
  const blockedCustomers = customers.filter(
    (c) => c.status === "blocked"
  ).length;

  const totalRevenue = customers.reduce(
    (sum, customer) => sum + customer.totalSpent,
    0
  );
  const averageSpent = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  const totalGameScore = customers.reduce(
    (sum, customer) => sum + customer.gameScore,
    0
  );

  const loyaltyTierCounts = customers.reduce(
    (acc, customer) => {
      acc[customer.loyaltyTier] = (acc[customer.loyaltyTier] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    totalCustomers,
    activeCustomers,
    inactiveCustomers,
    blockedCustomers,
    totalRevenue,
    averageSpent,
    totalGameScore,
    loyaltyTierCounts,
  };
};
