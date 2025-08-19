import { useState, useEffect, useCallback } from "react";
import storeApi from "../../../../api/storee.api";
import userApi from "../../../../api/user.api";
import roomApi from "../../../../api/room.api";
import productApi from "../../../../api/product.api";
import orderApi from "../../../../api/order.api";
import { useToastify } from "../../../../hooks/useToastify";
import { OrderStatus } from "../../../../types/models";

export function useStoresLogic() {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [searchParams, setSearchParams] = useState<{
    keyWord?: string;
    isOnline?: boolean;
    isLocked?: boolean;
    isPayFee?: boolean;
  }>({});
  const toast = useToastify();

  const getUserById = async (userId) => {
    try {
      const response = await userApi.getById(userId);
      if (response.code === 0) {
        return response.data;
      } else {
        throw new Error(response.error?.message || "Lỗi khi lấy thông tin người dùng");
      }
    } catch (err) {
      toast.error(err.message || "Lỗi khi lấy thông tin người dùng");
      return null;
    }
  };

  const getRoomsByUserId = async (userId) => {
    try {
      const response = await roomApi.getByUserId(userId);
      return response || [];
    } catch (err) {
      toast.error(err.message || "Lỗi khi lấy danh sách phòng");
      return [];
    }
  };

  const getOrdersByStoreId = useCallback(async (storeId: string, pageNumber: number = 1, pageSize: number = 15) => {
    try {
      const response = await orderApi.getAll(undefined, undefined, undefined, storeId, undefined, undefined, pageNumber, pageSize);
      console.log("getOrdersByStoreId response:", response);
      return response;
    } catch (err) {
      toast.error(err.message || "Lỗi khi lấy danh sách đơn hàng");
      return { items: [], totalCount: 0, pageNumber: 1, pageSize, totalPages: 1 };
    }
  }, [toast]);

  const fetchStores = useCallback(async (page: number = 1, size: number = 15) => {
    try {
      const response = await storeApi.getAll(page, size);
      if (response.code === 0) {
        setStores(response.data.items || []);
        setTotalCount(response.data.totalCount || 0);
      } else {
        throw new Error(response.message || "Lỗi khi lấy danh sách cửa hàng");
      }
    } catch (err) {
      toast.error(err.message || "Lỗi khi lấy danh sách cửa hàng");
      setStores([]);
      setTotalCount(0);
    }
  }, [toast]);

  const fetchStoresWithFilters = useCallback(async (
    keyWord?: string,
    isOnline?: boolean,
    isLocked?: boolean,
    isPayFee?: boolean,
    page: number = 1,
    size: number = 15
  ) => {
    try {
      const response = await storeApi.search(keyWord, isOnline, isLocked, isPayFee, page, size);
      if (response.code === 0) {
        setStores(response.data.items || []);
        setTotalCount(response.data.totalCount || 0);
      } else {
        throw new Error(response.message || "Lỗi khi tìm kiếm cửa hàng");
      }
    } catch (err) {
      toast.error(err.message || "Lỗi khi tìm kiếm cửa hàng");
      setStores([]);
      setTotalCount(0);
    }
  }, [toast]);

  const fetchStoreById = useCallback(async (id) => {
    try {
      const response = await storeApi.getById(id);
      if (response.code === 0) {
        return response.data;
      } else {
        throw new Error(response.message || "Lỗi khi lấy chi tiết cửa hàng");
      }
    } catch (err) {
      toast.error(err.message || "Lỗi khi lấy chi tiết cửa hàng");
      return null;
    }
  }, [toast]);

  const getProductsByStoreId = useCallback(async (storeId) => {
    try {
      const response = await productApi.getAll({ storeId, pageNumber: 1, pageSize: 10 });
      return response || [];
    } catch (err) {
      toast.error(err.message || "Lỗi khi lấy danh sách sản phẩm");
      return [];
    }
  }, [toast]);

  const countProductsByStoreId = useCallback(async (storeId) => {
    try {
      const response = await productApi.getAll({ storeId, pageNumber: 1, pageSize: 15 });
      console.log("countProductsByStoreId response:", response);
      return response.totalCount || 0;
    } catch (err) {
      toast.error(err.message || "Lỗi khi đếm sản phẩm");
      return 0;
    }
  }, [toast]);

  const getStoreOrders = () => {
    toast.info("API đơn hàng chưa được triển khai");
    return [];
  };

  const countSoldProductsByStoreId = () => {
    toast.info("API đếm sản phẩm đã bán chưa được triển khai");
    return 0;
  };

  const countOrdersByStoreId = () => {
    toast.info("API đếm đơn hàng chưa được triển khai");
    return 0;
  };

  const calculateStoreRevenue = () => {
    toast.info("API tính doanh thu chưa được triển khai");
    return 0;
  };

  const getOrderStatusCounts = () => {
    toast.info("API trạng thái đơn hàng chưa được triển khai");
    return null;
  };

  const handleViewOrderDetails = (orderId) => {
    toast.info("API chi tiết đơn hàng chưa được triển khai");
    setSelectedOrder(null);
  };

  const handleViewStore = async (store) => {
    const storeDetail = await fetchStoreById(store.id);
    if (storeDetail) {
      setSelectedStore(storeDetail);
      setIsDetailModalOpen(true);
    }
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

  const handleEditStore = (store) => {
    setEditingStore(store);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingStore(null);
  };

  const handleSubmitStore = async (storeData) => {
    try {
      if (editingStore) {
        const updateResponse = await storeApi.update(editingStore.id, {
          id: editingStore.id,
          name: storeData.name,
          description: storeData.description,
          phoneNumber: storeData.phoneNumber,
        });
        if (updateResponse.code !== 0) {
          throw new Error(updateResponse.message || "Lỗi khi cập nhật cửa hàng");
        }

        if (
          storeData.isLocked !== editingStore.isLocked ||
          storeData.isOpen !== editingStore.isOpen
        ) {
          const statusResponse = await storeApi.updateStatus(
            editingStore.id,
            storeData.isLocked,
            storeData.isOpen
          );
          if (statusResponse.code !== 0) {
            throw new Error(statusResponse.message || "Lỗi khi cập nhật trạng thái cửa hàng");
          }
        }

        await fetchStores(pageNumber, pageSize);
        if (selectedStore && selectedStore.id === storeData.id) {
          setSelectedStore({
            ...selectedStore,
            name: storeData.name,
            description: storeData.description,
            isLocked: storeData.isLocked,
            isOpen: storeData.isOpen,
            phoneNumber: storeData.phoneNumber,
          });
        }
        toast.success("Cập nhật cửa hàng thành công!");
      } else {
        const response = await storeApi.create({
          name: storeData.name,
          description: storeData.description,
          ownerId: storeData.ownerId,
          roomId: storeData.roomId,
          phoneNumber: storeData.phoneNumber,
        });
        if (response.code === 0) {
          await fetchStores(pageNumber, pageSize);
          toast.success("Thêm cửa hàng mới thành công!");
        } else {
          throw new Error(response.message || "Lỗi khi thêm cửa hàng");
        }
      }
      setIsAddModalOpen(false);
      setEditingStore(null);
    } catch (err) {
      toast.error(err.message || "Lỗi khi lưu cửa hàng");
    }
  };

  const handleToggleStoreStatus = (storeId, callback) => {
  const store = stores.find((s) => s.id === storeId);
  if (!store) {
    toast.error("Cửa hàng không tồn tại");
    return;
  }
  const newStatus = !store.isLocked;
  callback({
    open: true,
    title: newStatus ? "Khóa cửa hàng" : "Mở khóa cửa hàng",
    message: `Bạn có chắc chắn muốn ${newStatus ? "khóa" : "mở khóa"} cửa hàng ${store.name}?`,
    onConfirm: async () => {
      try {
        const response = await storeApi.updateStatus(storeId, newStatus);
        if (response.code === 0) {
          await fetchStores(pageNumber, pageSize);
          if (selectedStore && selectedStore.id === storeId) {
            const updatedStore = await storeApi.getById(storeId);
            if (updatedStore.code === 0) {
              setSelectedStore(updatedStore.data);
            }
          }
          // Fetch lại thống kê
          const updatedStats = await calculateStoreStats();
          toast.info(`Cửa hàng đã được ${newStatus ? "khóa" : "mở khóa"}.`);
        } else {
          throw new Error(response.message || "Lỗi khi cập nhật trạng thái");
        }
      } catch (err) {
        toast.error(err.message || "Lỗi khi cập nhật trạng thái cửa hàng");
      }
    },
  });
};

  const handleExportStores = async () => {
    try {
      const response = await storeApi.getAll(1, 1000);
      if (response.code !== 0) {
        throw new Error(response.message || "Lỗi khi xuất danh sách cửa hàng");
      }
      const stores = response.data.items || [];
      const headers = [
        "Id",
        "Name",
        "Description",
        "Phone Number",
        "Status",
        "Open",
        "Create at",
        "Room",
        "Building",
        "Area",
      ];
      const csvContent = [
        headers.join(","),
        ...stores.map((store) =>
          [
            store.id,
            `"${store.name}"`,
            `"${store.description || ""}"`,
            `"${store.phoneNumber || ""}"`,
            store.isLocked ? "Locked" : "Unlock",
            store.isOpen ? "Open" : "Close",
            new Date(store.createdAt).toLocaleDateString(),
            `"${store.room?.name || "N/A"}"`,
            `"${store.room?.buildingName || "N/A"}"`,
            `"${store.room?.areaName || "N/A"}"`,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `danh_sach_cua_hang_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Xuất danh sách cửa hàng thành công!");
    } catch (err) {
      toast.error(err.message || "Lỗi khi xuất danh sách cửa hàng");
    }
  };

  const calculateStoreStats = async () => {
    try {
      const totalStores = await storeApi.count();
      const statusCounts = await storeApi.countByIsOpenAndIsLoc();
      return {
        totalStores: totalStores || 0,
        activeStores: statusCounts?.isLocked?.["false"] ?? 0,
        inactiveStores: statusCounts?.isLocked?.["true"] ?? 0,
        openStore: statusCounts?.isOpen?.["true"] ?? 0,
        closeStore: statusCounts?.isOpen?.["false"] ?? 0,
      };
    } catch (err) {
      toast.error(err.message || "Lỗi khi tính thống kê cửa hàng");
      return {
        totalStores: 0,
        activeStores: 0,
        inactiveStores: 0,
        openStore: 0,
        closeStore: 0,
      };
    }
  };

  return {
    stores,
    setStores,
    selectedStore,
    isDetailModalOpen,
    isAddModalOpen,
    editingStore,
    selectedOrder,
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
    getOrdersByStoreId,
    handleToggleStoreStatus,
    handleExportStores,
    getUserById,
    getRoomsByUserId,
    calculateStoreStats,
    getProductsByStoreId,
    countProductsByStoreId,
    getStoreOrders,
    countSoldProductsByStoreId,
    countOrdersByStoreId,
    calculateStoreRevenue,
    getOrderStatusCounts,
    formatOrderStatus,
    getOrderStatusColor,
    handleViewOrderDetails,
    fetchStores,
    fetchStoresWithFilters,
  };
};

// ... (Các hàm khác như useStoreForm, getStatusColor, formatCurrency, formatOrderStatus, getOrderStatusColor, formatDate không thay đổi)
export const useStoreForm = (editStore) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ownerId: "",
    roomId: "",
    phoneNumber: "",
    isLocked: false,
    isOpen: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToastify();

  useEffect(() => {
    if (editStore) {
      setFormData({
        name: editStore.name || "",
        description: editStore.description || "",
        ownerId: editStore.ownerId || "",
        phoneNumber: editStore.phoneNumber || "",
        roomId: editStore.roomId || "",
        isLocked: editStore.isLocked ?? false,
        isOpen: editStore.isOpen ?? true,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        ownerId: "",
        roomId: "",
        phoneNumber: "",
        isLocked: false,
        isOpen: true,
      });
    }
  }, [editStore]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (data) => {
    const errors = {};

    if (!data.name?.trim()) {
      errors.name = "Tên cửa hàng là bắt buộc";
    }

    if (!editStore && !data.ownerId) {
      errors.ownerId = "Chủ sở hữu là bắt buộc khi tạo cửa hàng mới";
    }

    if (!editStore && !data.roomId) {
      errors.roomId = "Phòng là bắt buộc khi tạo cửa hàng mới";
    } else if (!/^\d{10,11}$/.test(data.phoneNumber)) {
      errors.phoneNumber = "Số điện thoại phải có 10 hoặc 11 chữ số";
    }

    return errors;
  };

  const handleSubmit = async (e, onSubmit) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    const storeData = {
      ...formData,
      id: editStore?.id || `STORE-${Math.floor(Math.random() * 10000).toString().padStart(3, "0")}`,
      createdAt: editStore?.createdAt || new Date().toISOString(),
      reportCount: editStore?.reportCount || 0,
    };

    try {
      await onSubmit(storeData);
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu cửa hàng:", error);
      toast.error("Lỗi khi gửi dữ liệu cửa hàng");
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

export const getStatusColor = (isOpen, isLocked) => {
  if (isLocked) {
    return {
      bgcolor: "error.light",
      color: "error.dark",
    };
  }
  return isOpen
    ? {
        bgcolor: "success.light",
        color: "success.dark",
      }
    : {
        bgcolor: "warning.light",
        color: "warning.dark",
      };
};

export const formatCurrency = (value) => {
  if (value == null) return "0 VNĐ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export const formatOrderStatus = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.Pending:
      return "Chờ Xử Lý";
    case OrderStatus.Processing:
      return "Đang Xử Lý";
    case OrderStatus.Shipped:
      return "Đang Giao";
    case OrderStatus.Delivered:
      return "Đã Giao";
    case OrderStatus.Cancelled:
      return "Đã Hủy";
    case OrderStatus.Reported:
      return "Bị Tố Cáo";
    default:
      return status;
  }
};

export const getOrderStatusColor = (
  status: OrderStatus
): { bgcolor: string; color: string } => {
  switch (status) {
    case OrderStatus.Pending:
      return { bgcolor: "#FFF3E0", color: "#F97316" };
    case OrderStatus.Processing:
      return { bgcolor: "#E0F7FA", color: "#0891B2" };
    case OrderStatus.Shipped:
      return { bgcolor: "#DBEAFE", color: "#3B82F6" };
    case OrderStatus.Delivered:
      return { bgcolor: "#DCFCE7", color: "#22C55E" };
    case OrderStatus.Cancelled:
      return { bgcolor: "#FEE2E2", color: "#EF4444" };
    case OrderStatus.Reported:
      return { bgcolor: "#FEE2E2", color: "#EF4444" };
    default:
      return { bgcolor: "#F3F4F6", color: "#6B7280" };
  }
};

export const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};