import { useState } from "react";
import type { Store, Product, Voucher, Order, PaymentMethod, User } from "../../../../types/models";
import { OrderStatus } from "../../../../types/models";
import { fakeStores } from "../../../../fakeData/fakeStoreData";
import { fakeOrders } from "../../../../fakeData/fakeOrderData";
import { fakeOrderItems } from "../../../../fakeData/fakeOrderData";
import { fakeUsers } from "../../../../fakeData/fakeUserData";
import type { SxProps, Theme } from "@mui/material";
import { useToastify } from "../../../../hooks/useToastify";
  export interface StoreFormData {
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}


// Hook quản lý stores
export function useStoresLogic() {
  const [stores, setStores] = useState<Store[]>(fakeStores);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

const toast = useToastify();
const getUserById = (userId: string): User | undefined =>{
    fakeUsers.find((user) => user.id === userId);
};

  const handleViewStore = (store: Store) => {
    setSelectedStore(store);
    setIsDetailModalOpen(true);
  };
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedStore(null);
    setSelectedOrder(null);
  };

  const handleAddStore = () => {
    setEditingStore(null);
    setIsAddModalOpen(true);
  };

  const handleEditStore = (store: Store) => {
    setEditingStore(store);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingStore(null);
  };

  const handleSubmitStore = (storeData: Store) => {
    if (editingStore) {
      // Update existing store
      setStores((prev) =>
        prev.map((store) =>
          store.id === storeData.id ? storeData : store
        )
      );
      // Update selectedStore if viewing details
      if (selectedStore && selectedStore.id === storeData.id) {
        setSelectedStore(storeData);
         toast.success("Cập nhật cửa hàng thành công!");
      }
    } else {
      // Add new store
      setStores((prev) => [...prev, storeData]);
         toast.success("Thêm cửa hàng mới thành công!");
    }
    setIsAddModalOpen(false);
    setEditingStore(null);

  };

  const handleDeleteStore = (storeId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this store? This action cannot be undone."
      )
    ) {
      setStores((prev) => prev.filter((store) => store.id !== storeId));
      if (selectedStore && selectedStore.id === storeId) {
        handleCloseDetailModal();
      }
    }
  };

 const handleToggleStoreStatus = (storeId: string) => {
  setStores((prev) =>
    prev.map((store) =>
      store.id === storeId
        ? { ...store, isActive: !store.isActive }
        : store
    )
  );
  if (selectedStore && selectedStore.id === storeId) {
    setSelectedStore((prev) =>
      prev ? { ...prev, isActive: !prev.isActive } : null
    );
  }

  const store = stores.find((s) => s.id === storeId);
  const newStatus = store?.isActive ? "ngừng hoạt động" : "hoạt động lại";
  toast.info(`Cửa hàng đã được ${newStatus}.`);
};

  const handleExportStores = () => {
    const headers = [
      "Store ID",
      "Name",
      "Email",
      "Phone",
      "Address",
      "Description",
      "Status",
      "Total Products",
      "Created At",
    ];
    const csvContent = [
      headers.join(","),
      ...stores.map((store) =>
        [
          store.id,
          `"${store.name}"`,
          store.email,
          store.phoneNumber,
          `"${store.address}"`,
          `"${store.description}"`,
          store.isActive ? "Active" : "Inactive",
          store.products.length,
          new Date(store.createdAt).toLocaleDateString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stores_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
      toast.success("Export danh sách cửa hàng thành công!");
  };

  // Hàm đếm số sản phẩm của một cửa hàng theo storeId
  const countProductsByStoreId = (storeId: string): number => {
    const store = stores.find((store) => store.id === storeId);
    return store ? store.products.length : 0;
  };

  // Hàm lấy danh sách đơn hàng của một cửa hàng
  const getStoreOrders = (storeId: string): Order[] => {
    return fakeOrders.filter((order) =>
      order.orderItems.some((item) =>
        stores
          .find((store) => store.id === storeId)
          ?.products.some((product) => product.id === item.productId)
      )
    );
  };

  // Hàm xem chi tiết một đơn hàng
 const handleViewOrderDetails = (orderId: string) => {
    if (orderId === "") {
      setSelectedOrder(null); // Reset selectedOrder khi orderId rỗng
    } else {
      const order = fakeOrders.find((o) => o.id === orderId);
      setSelectedOrder(order || null);
    }
  };

  // Hàm đếm tổng số sản phẩm đã bán của một cửa hàng
  const countSoldProductsByStoreId = (storeId: string): number => {
    const store = stores.find((store) => store.id === storeId);
    if (!store) return 0;
    return store.products.reduce((sum, product) => sum + product.sold, 0);
  };

  // Hàm đếm tổng số đơn hàng của một cửa hàng
  const countOrdersByStoreId = (storeId: string): number => {
    return getStoreOrders(storeId).length;
  };

  // Hàm lấy trạng thái đơn hàng của một cửa hàng (số lượng đơn hàng theo từng trạng thái)
  const getOrderStatusCounts = (storeId: string) => {
    const orders = getStoreOrders(storeId);
    return {
      total: orders.length,
      pending: orders.filter((order) => order.status === OrderStatus.Pending).length,
      processing: orders.filter((order) => order.status === OrderStatus.Processing).length,
      shipped: orders.filter((order) => order.status === OrderStatus.Shipped).length,
      delivered: orders.filter((order) => order.status === OrderStatus.Delivered).length,
      cancelled: orders.filter((order) => order.status === OrderStatus.Cancelled).length,
    };
  };

  // Hàm định dạng trạng thái đơn hàng
  const formatOrderStatus = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.Pending:
        return "Chờ xử lý";
      case OrderStatus.Processing:
        return "Đang xử lý";
      case OrderStatus.Shipped:
        return "Đã giao";
      case OrderStatus.Delivered:
        return "Đã giao hàng";
      case OrderStatus.Cancelled:
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  // Hàm định dạng màu sắc cho trạng thái đơn hàng
 const getOrderStatusColor = (status: OrderStatus): SxProps<Theme> => {
  switch (status) {
    case OrderStatus.Pending:
      return {
        bgcolor: "warning.light", // Thay bg-yellow-100
        color: "warning.dark", // Thay text-yellow-800
      };
    case OrderStatus.Processing:
      return {
        bgcolor: "info.light", // Thay bg-blue-100
        color: "info.dark", // Thay text-blue-800
      };
    case OrderStatus.Shipped:
      return {
        bgcolor: "secondary.light", // Thay bg-purple-100
        color: "secondary.dark", // Thay text-purple-800
      };
    case OrderStatus.Delivered:
      return {
        bgcolor: "success.light", // Thay bg-green-100
        color: "success.dark", // Thay text-green-800
      };
    case OrderStatus.Cancelled:
      return {
        bgcolor: "error.light", // Thay bg-red-100
        color: "error.dark", // Thay text-red-800
      };
    default:
      return {
        bgcolor: "grey.100", // Thay bg-gray-100
        color: "grey.800", // Thay text-gray-800
      };
  }
};

  // Hàm tính tổng doanh thu của một cửa hàng
  const calculateStoreRevenue = (storeId: string): number => {
    const orders = getStoreOrders(storeId);
    return orders.reduce((sum, order) => sum + order.totalAmount, 0);
  };

  return {
    stores,
    selectedStore,
    isDetailModalOpen,
    isAddModalOpen,
    editingStore,
    selectedOrder,
    handleViewStore,
    handleCloseDetailModal,
    handleAddStore,
    handleEditStore,
    handleCloseAddModal,
    handleSubmitStore,
    handleDeleteStore,
    handleToggleStoreStatus,
    handleExportStores,
    countProductsByStoreId,
    getStoreOrders,
    handleViewOrderDetails,
    countSoldProductsByStoreId,
    countOrdersByStoreId,
    getOrderStatusCounts,
    formatOrderStatus,
    getOrderStatusColor,
    calculateStoreRevenue,
    getUserById,
  };
};

// Hook quản lý store form
export const useStoreForm = (editStore?: Store | null) => {
  const [formData, setFormData] = useState<StoreFormData>({
    name: editStore?.name || "",
    email: editStore?.email || "",
    phoneNumber: editStore?.phoneNumber || "",
    address: editStore?.address || "",
    description: editStore?.description || "",
    imageUrl: editStore?.imageUrl || "",
    isActive: editStore?.isActive ?? true,
  });

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (data: StoreFormData) => {
    const errors: any = {};

    if (!data.name?.trim()) {
      errors.name = "Store name is required";
    }

    if (!data.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Email is invalid";
    }

    if (!data.phoneNumber?.trim()) {
      errors.phoneNumber = "Phone number is required";
    }

    if (!data.address?.trim()) {
      errors.address = "Address is required";
    }

    return errors;
  };

  const handleSubmit = async (
    e: React.FormEvent,
    onSubmit: (data: Store) => void
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

    const storeData: Store = {
      ...formData,
      id:
        editStore?.id ||
        `STORE-${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(3, "0")}`,
      createdAt: editStore?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      products: editStore?.products || [],
      imageUrl: formData.imageUrl || "/images/default-store.jpg",
      isActive: formData.isActive,
    };

    try {
      await onSubmit(storeData);
    } catch (error) {
      console.error("Error submitting store:", error);
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

export const getStatusColor = (isActive: boolean): SxProps<Theme> => {
  return isActive
    ? {
        bgcolor: "success.light", // Thay bg-green-100
        color: "success.dark", // Thay text-green-800
      }
    : {
        bgcolor: "error.light", // Thay bg-red-100
        color: "error.dark", // Thay text-red-800
      };
};
export const calculateStoreStats = (stores: Store[]) => {
  const totalStores = stores.length;
  const activeStores = stores.filter((s) => s.isActive).length;
  const inactiveStores = stores.filter((s) => !s.isActive).length;

  const totalRevenue = stores.reduce(
    (sum, store) =>
      sum +
      store.products.reduce(
        (productSum, product) => productSum + product.price * product.sold,
        0
      ),
    0
  );
  const averageRevenue = totalStores > 0 ? totalRevenue / totalStores : 0;

  const totalProducts = stores.reduce(
    (sum, store) => sum + store.products.length,
    0
  );

  return {
    totalStores,
    activeStores,
    inactiveStores,
    totalRevenue,
    averageRevenue,
    totalProducts,
  };
};