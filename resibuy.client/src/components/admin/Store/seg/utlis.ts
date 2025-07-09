import { useState, useEffect, useCallback } from "react";
import storeApi from "../../../../api/storee.api";
import userApi from "../../../../api/user.api";
import roomApi from "../../../../api/room.api";
import productApi from "../../../../api/product.api";
import { useToastify } from "../../../../hooks/useToastify";

export function useStoresLogic() {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const fetchStores = useCallback(async () => {
    try {
      const response = await storeApi.getAll(1, 15);
      if (response.code === 0) {
        setStores(response.data.items || []);
      } else {
        throw new Error(response.message || "Lỗi khi lấy danh sách cửa hàng");
      }
    } catch (err) {
      toast.error(err.message || "Lỗi khi lấy danh sách cửa hàng");
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
      const response = await productApi.getAll({ storeId, pageNumber: 1, pageSize: 100 });
      return response.items || [];
    } catch (err) {
      toast.error(err.message || "Lỗi khi lấy danh sách sản phẩm");
      return [];
    }
  }, [toast]);

  const countProductsByStoreId = useCallback(async (storeId) => {
    try {
      const response = await productApi.getAll({ storeId, pageNumber: 1, pageSize: 100 });
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

  const formatOrderStatus = (status) => {
    return "N/A";
  };

  const getOrderStatusColor = (status) => {
    return { bgcolor: "grey.200", color: "grey.700" };
  };

  const handleViewOrderDetails = (orderId) => {
    toast.info("API chi tiết đơn hàng chưa được triển khai");
    setSelectedOrder(null);
  };

  useEffect(() => {
    fetchStores();
  }, []);

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

        await fetchStores();
        if (selectedStore && selectedStore.id === storeData.id) {
          setSelectedStore({
            ...selectedStore,
            name: storeData.name,
            description: storeData.description,
            isLocked: storeData.isLocked,
            isOpen: storeData.isOpen,
          });
        }
        toast.success("Cập nhật cửa hàng thành công!");
      } else {
        const response = await storeApi.create({
          name: storeData.name,
          description: storeData.description,
          ownerId: storeData.ownerId,
          roomId: storeData.roomId,
        });
        if (response.code === 0) {
          await fetchStores();
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

const handleToggleStoreStatus = async (storeId) => {
  try {
    const store = stores.find((s) => s.id === storeId);
    if (!store) throw new Error("Cửa hàng không tồn tại");

    const response = await storeApi.updateStatus(storeId, !store.isLocked);

    if (response.code === 0) {
      await fetchStores();

      // ✅ Cập nhật lại selectedStore nếu đang mở modal chi tiết
      if (selectedStore && selectedStore.id === storeId) {
        const updatedStore = await storeApi.getById(storeId);
        if (updatedStore.code === 0) {
          setSelectedStore(updatedStore.data); // <-- cập nhật modal
        }
      }

      const newStatus = !store.isLocked ? "khóa" : "mở khóa";
      toast.info(`Cửa hàng đã được ${newStatus}.`);
    } else {
      throw new Error(response.message || "Lỗi khi cập nhật trạng thái");
    }
  } catch (err) {
    toast.error(err.message || "Lỗi khi cập nhật trạng thái cửa hàng");
  }
};


  const handleExportStores = async () => {
    try {
      const response = await storeApi.getAll(1, 1000);
      if (response.code !== 0) {
        throw new Error(response.message || "Lỗi khi xuất danh sách cửa hàng");
      }
      const stores = response.data.items || [];
      const headers = [
        "ID Cửa hàng",
        "Tên",
        "Mô tả",
        "Hoạt Động",
        "Mở Cửa",
        "Ngày tạo",
        "Phòng",
        "Tòa nhà",
        "Khu vực",
      ];
      const csvContent = [
        headers.join(","),
        ...stores.map((store) =>
          [
            store.id,
            `"${store.name}"`,
            `"${store.description || ""}"`,
            store.isLocked ? "Khóa" : "Hoạt động",
            store.isOpen ? "Mở" : "Đóng",
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
  };
};

export const useStoreForm = (editStore) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ownerId: "",
    roomId: "",
    isLocked: false,
    isOpen: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToastify();

  useEffect(() => {
    if (editStore) {
      setFormData({
        name: editStore.name || "",
        description: editStore.description || "",
        ownerId: editStore.ownerId || "",
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

export const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};