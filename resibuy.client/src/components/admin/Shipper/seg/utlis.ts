import { useState, useEffect } from "react";
import shipperApi from "../../../../api/ship.api";
import orderApi from "../../../../api/order.api";
import { useToastify } from "../../../../hooks/useToastify";
import type { Shipper, Order } from "../../../../types/models";
import { OrderStatus } from "../../../../types/models";

interface ShipperFormData {
  email: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  identityNumber: string;
  startWorkTime: string;
  endWorkTime: string;
  isAvailable: boolean;
  password: string;
  lastLocationId: string;
}

interface ShipperFormErrors {
  email: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  identityNumber: string;
  startWorkTime: string;
  endWorkTime: string;
  password: string;
  lastLocationId: string;
}

// Hook useShipperForm
export const useShipperForm = (editingShipper?: Shipper | null) => {
  const [formData, setFormData] = useState<ShipperFormData>({
    email: "",
    fullName: "",
    phoneNumber: "",
    dateOfBirth: "",
    identityNumber: "",
    startWorkTime: "08:00",
    endWorkTime: "17:00",
    isAvailable: true,
    password: "",
    lastLocationId: "",
  });

  const [errors, setErrors] = useState<ShipperFormErrors>({
    email: "",
    fullName: "",
    phoneNumber: "",
    dateOfBirth: "",
    identityNumber: "",
    startWorkTime: "",
    endWorkTime: "",
    password: "",
    lastLocationId: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);


  // Hàm reset form về trạng thái ban đầu
  const resetForm = () => {
    setFormData({
      email: "",
      fullName: "",
      phoneNumber: "",
      dateOfBirth: "",
      identityNumber: "",
      startWorkTime: "08:00",
      endWorkTime: "17:00",
      isAvailable: true,
      password: "",
      lastLocationId: "",
    });
    setErrors({
      email: "",
      fullName: "",
      phoneNumber: "",
      dateOfBirth: "",
      identityNumber: "",
      startWorkTime: "",
      endWorkTime: "",
      password: "",
      lastLocationId: "",
    });
  };

  useEffect(() => {
    if (editingShipper) {
      setFormData({
        email: editingShipper.email || "",
        fullName: editingShipper.fullName || "",
        phoneNumber: editingShipper.phoneNumber || "",
        dateOfBirth: editingShipper.dateOfBirth?.split("T")[0] || "",
        identityNumber: editingShipper.identityNumber || "",
        startWorkTime: formatWorkTime(editingShipper.startWorkTime),
        endWorkTime: formatWorkTime(editingShipper.endWorkTime),
        isAvailable: !editingShipper.isLocked,
        password: "",
        lastLocationId: editingShipper.lastLocationId || "",
      });
    } else {
      resetForm();
    }
  }, [editingShipper]);

  const handleInputChange = (field: keyof ShipperFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: ShipperFormErrors = {
      email: "",
      fullName: "",
      phoneNumber: "",
      dateOfBirth: "",
      identityNumber: "",
      startWorkTime: "",
      endWorkTime: "",
      password: "",
      lastLocationId: "",
    };
    let isValid = true;

    if (!editingShipper) {
      if (!formData.email) {
        newErrors.email = "Email là bắt buộc";
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Email không hợp lệ";
        isValid = false;
      }

    if (!formData.fullName || formData.fullName.trim().length === 0) {
      newErrors.fullName = "Họ tên là bắt buộc";
      isValid = false;
    }
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = "Số điện thoại là bắt buộc";
        isValid = false;
      } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = "Số điện thoại phải có 10 chữ số";
        isValid = false;
      }

      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = "Ngày sinh là bắt buộc";
        isValid = false;
      }

      if (!formData.identityNumber) {
        newErrors.identityNumber = "CMND/CCCD là bắt buộc";
        isValid = false;
      } else if (!/^\d{9}(\d{3})?$/.test(formData.identityNumber)) {
        newErrors.identityNumber = "CMND/CCCD phải có 9 hoặc 12 chữ số";
        isValid = false;
      }

      if (!formData.password) {
        newErrors.password = "Mật khẩu là bắt buộc khi tạo mới";
        isValid = false;
      } else if (formData.password.length < 6) {
        newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        isValid = false;
      }
    }

    if (!formData.startWorkTime) {
      newErrors.startWorkTime = "Thời gian bắt đầu là bắt buộc";
      isValid = false;
    }

    if (!formData.endWorkTime) {
      newErrors.endWorkTime = "Thời gian kết thúc là bắt buộc";
      isValid = false;
    }

    if (!formData.lastLocationId) {
      newErrors.lastLocationId = "Khu vực là bắt buộc";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>,
  onSubmit: (shipper: Shipper) => Promise<void>
) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsSubmitting(true);

  const parseTime = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours + (minutes / 60);
  };

  const shipper: Shipper = {
    id: editingShipper?.id || `shipper-${Date.now()}`,
    userId: editingShipper?.userId || `user-${Date.now()}`,
    email: formData.email,
    fullName: formData.fullName,
    phoneNumber: formData.phoneNumber,
    dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
    identityNumber: formData.identityNumber,
    isOnline: editingShipper?.isOnline || formData.isAvailable,
    isLocked: editingShipper?.isLocked ?? !formData.isAvailable,
    isShipping: editingShipper?.isShipping || false,
    orders: editingShipper?.orders || [],
    startWorkTime: parseTime(formData.startWorkTime),
    endWorkTime: parseTime(formData.endWorkTime),
    reportCount: editingShipper?.reportCount || 0,
    lastLocationId: formData.lastLocationId,
    lastLocation: editingShipper?.lastLocation || { id: formData.lastLocationId, name: "" },
    lastLocationName: editingShipper?.lastLocationName || "",
    password: formData.password,
  };

  try {
    await onSubmit(shipper);
    resetForm();
  } catch (error: any) {
    console.error("Submit shipper error:", error);
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
    resetForm, // Export hàm resetForm
  };
};

// Hàm định dạng tiền tệ (VNĐ)
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null || isNaN(amount)) {
    return "0 ₫";
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 1,
    maximumFractionDigits: 3,
  }).format(amount);
};

// Hàm định dạng ngày giờ
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

// Hàm định dạng thời gian làm việc
export const formatWorkTime = (time: number): string => {
  const hours = Math.floor(time);
  const minutes = Math.round((time - hours) * 60);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

export const formatOrderStatus = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.Pending:
      return "Chờ Xử Lý";
    case OrderStatus.Processing:
      return "Đang Xử Lý";
       case OrderStatus.CustomerNotAvailable:
      return "Chờ nhận";
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
      case OrderStatus.CustomerNotAvailable:
      return { bgcolor: "#f4cdcdff", color: "#f78800ff" };
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

// Hàm tính thống kê shipper
export const calculateShipperStats = async () => {
  const  toast  = useToastify;
  try {
    const response = await shipperApi.stats();
    if (response.code !== 0) {
      throw new Error(response.message || "Lỗi khi lấy thống kê shipper");
    }
    return {
      totalShippers: response.data.countAllShipper || 0,
      totalOnline: response.data.onlineTrue || 0,
      totalShipping: response.data.shippingTrue || 0,
      totalReported: response.data.totalReportCount || 0,
    };
  } catch (error: any) {
    console.error("Error in calculateShipperStats:", error);
    toast.error(error.message || "Lỗi khi tính thống kê shipper");
    return {
      totalShippers: 0,
      totalOnline: 0,
      totalShipping: 0,
      totalReported: 0,
    };
  }
};

// Hook useShippersLogic
export const useShippersLogic = (setStats?: (stats: { totalShippers: number; totalOnline: number; totalShipping: number; totalReported: number }) => void) => {
  const [shippers, setShippers] = useState<Shipper[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedShipper, setSelectedShipper] = useState<Shipper | null>(null);
  const [editingShipper, setEditingShipper] = useState<Shipper | null>(null);
  const [searchParams, setSearchParams] = useState<{
    keyWord?: string;
    isOnline?: boolean;
    isLocked?: boolean;
  }>({});
  const toast = useToastify();

  // Lấy danh sách shipper
  const fetchShippers = async (page: number = 1, size: number = 15) => {
    try {
      const response = await shipperApi.getAll(page, size);
      console.log("Fetch shippers response:", response);
      if (response.code === 0 && Array.isArray(response.data.items)) {
        setShippers(response.data.items);
        setTotalCount(response.data.totalCount || 0);
        setPageNumber(response.data.pageNumber || 1);
        setTotalPages(response.data.totalPages || 1);
      } else {
        throw new Error(response.message || "Dữ liệu shipper không hợp lệ");
      }
    } catch (error: any) {
      console.error("Fetch shippers error:", error);
      toast.error(error.message || "Lỗi khi lấy danh sách shipper");
      setShippers([]);
      setTotalCount(0);
      setTotalPages(1);
    }
  };

  // Tìm kiếm shipper với bộ lọc
  const fetchShippersWithFilters = async (
    keyWord?: string,
    isOnline?: boolean,
    isLocked?: boolean,
    page: number = 1,
    size: number = 15
  ) => {
    try {
      const response = await shipperApi.search(keyWord, isOnline, isLocked, page, size);
      console.log("Search shippers response:", response);
      if (response.code === 0 && Array.isArray(response.data.items)) {
        setShippers(response.data.items);
        setTotalCount(response.data.totalCount || 0);
        setPageNumber(response.data.pageNumber || 1);
        setTotalPages(response.data.totalPages || 1);
      } else {
        throw new Error(response.message || "Dữ liệu shipper không hợp lệ");
      }
    } catch (error: any) {
      console.error("Search shippers error:", error);
      toast.error(error.message || "Lỗi khi tìm kiếm shipper");
      setShippers([]);
      setTotalCount(0);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    if (Object.keys(searchParams).length === 0) {
      fetchShippers(pageNumber, pageSize);
    } else {
      fetchShippersWithFilters(
        searchParams.keyWord,
        searchParams.isOnline,
        searchParams.isLocked,
        pageNumber,
        pageSize
      );
    }
  }, [pageNumber, searchParams]);

  const handleViewShipper = async (shipper: Shipper) => {
    try {
      const response = await shipperApi.getById(shipper.id);
      console.log("Get shipper by ID response:", response);
      if (response.code === 0) {
        setSelectedShipper(response.data);
        setIsDetailModalOpen(true);
      } else {
        throw new Error(response.message || "Lỗi khi lấy thông tin shipper");
      }
    } catch (error: any) {
      console.error("Get shipper by ID error:", error);
      toast.error(error.message || "Lỗi khi lấy thông tin shipper");
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedShipper(null);
  };

  const handleAddShipper = () => {
    setEditingShipper(null);
    setIsAddModalOpen(true);
  };

  const handleEditShipper = async (shipper: Shipper) => {
    try {
      const response = await shipperApi.getById(shipper.id);
      console.log("Get shipper by ID response:", response);
      if (response.code === 0) {
        setEditingShipper(response.data);
        setIsAddModalOpen(true);
        setIsDetailModalOpen(false);
      } else {
        throw new Error(response.message || "Lỗi khi lấy thông tin shipper");
      }
    } catch (error: any) {
      console.error("Get shipper by ID error:", error);
      toast.error(error.message || "Lỗi khi lấy thông tin shipper");
    }
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingShipper(null);
  };

  const handleSubmitShipper = async (shipper: Partial<Shipper>) => {
  try {
    if (editingShipper) {
      const updateResponse = await shipperApi.update({
        id: shipper.id,
        startWorkTime: shipper.startWorkTime,
        endWorkTime: shipper.endWorkTime,
        isLocked: shipper.isLocked,
      });
      console.log("Update shipper response:", updateResponse);
      if (updateResponse.code !== 0) {
        throw new Error(updateResponse.message || "Lỗi khi cập nhật shipper");
      }

      if (shipper.lastLocationId !== editingShipper.lastLocationId) {
        const locationResponse = await shipperApi.updateLocation({
          shipperId: shipper.id,
          locationId: shipper.lastLocationId,
        });
        console.log("Update location response:", locationResponse);
        if (locationResponse.code !== 0) {
          throw new Error(locationResponse.message || "Lỗi khi cập nhật vị trí shipper");
        }
      }

      setShippers((prev) =>
        prev.map((s) => (s.id === shipper.id ? { ...s, ...shipper } : s))
      );
      toast.success("Cập nhật shipper thành công!");

      // Làm mới danh sách shipper
      if (Object.keys(searchParams).length === 0) {
        await fetchShippers(pageNumber, pageSize);
      } else {
        await fetchShippersWithFilters(
          searchParams.keyWord,
          searchParams.isOnline,
          searchParams.isLocked,
          pageNumber,
          pageSize
        );
      }

      // Làm mới stats
      if (setStats) {
        const newStats = await calculateShipperStats();
        setStats(newStats);
      }
    } else {
      const createResponse = await shipperApi.create({
        phoneNumber: shipper.phoneNumber,
        email: shipper.email,
        password: shipper.password,
        fullName: shipper.fullName,
        dateOfBirth: shipper.dateOfBirth,
        identityNumber: shipper.identityNumber,
        startWorkTime: shipper.startWorkTime,
        endWorkTime: shipper.endWorkTime,
        lastLocationId: shipper.lastLocationId,
      });
      console.log("Create shipper response:", createResponse);
      if (createResponse.code !== 0) {
        throw new Error(createResponse.message || "Lỗi khi tạo shipper");
      }
      setShippers((prev) => [...prev, createResponse.data]);
      toast.success("Thêm shipper thành công!");
      await fetchShippers(pageNumber, pageSize);

      // Làm mới stats
      if (setStats) {
        const newStats = await calculateShipperStats();
        setStats(newStats);
      }
    }
    handleCloseAddModal();
  } catch (error: any) {
    console.error("Submit shipper error:", error);
    const errorMessage = error.response?.data?.message || "Lỗi khi lưu shipper";
    // toast.error(errorMessage);

    // Làm mới stats ngay cả khi có lỗi để đảm bảo đồng bộ
    if (setStats) {
      const newStats = await calculateShipperStats();
      setStats(newStats);
    }
  }
};
 
  const handleToggleLockShipper = async (shipperId: string, currentLockStatus: boolean) => {
  try {
    const newLockStatus = !currentLockStatus;
    const response = await shipperApi.update({ id: shipperId, isLocked: newLockStatus });
    console.log("Toggle lock response:", response);
    if (response.code !== 0) {
      throw new Error(response.message || "Lỗi khi thay đổi trạng thái khóa shipper");
    }

    setShippers((prev) =>
      prev.map((s) =>
        s.id === shipperId ? { ...s, isLocked: newLockStatus } : s
      )
    );
    toast.success(newLockStatus ? "Khóa shipper thành công!" : "Mở khóa shipper thành công!");

    // Làm mới danh sách shipper
    if (Object.keys(searchParams).length === 0) {
      await fetchShippers(pageNumber, pageSize);
    } else {
      await fetchShippersWithFilters(
        searchParams.keyWord,
        searchParams.isOnline,
        searchParams.isLocked,
        pageNumber,
        pageSize
      );
    }

    // Làm mới stats
    if (setStats) {
      const newStats = await calculateShipperStats();
      console.log("New stats after toggle:", newStats); // Debug log
      setStats(newStats);
    }
  } catch (error: any) {
    console.error("Toggle lock shipper error:", error);
    toast.error(error.message || "Lỗi khi thay đổi trạng thái khóa shipper");

    // Làm mới stats ngay cả khi có lỗi để đảm bảo đồng bộ
    if (setStats) {
      const newStats = await calculateShipperStats();
      console.log("New stats after error:", newStats); // Debug log
      setStats(newStats);
    }
  }
};

  const handleExportShippers = async () => {
    try {
      const response = await shipperApi.getAll(1, 1000);
      console.log("Export shippers response:", response);
      if (response.code !== 0) {
        throw new Error(response.message || "Lỗi khi lấy danh sách shipper");
      }
      const csvData = response.data.items.map((shipper: Shipper) => ({
        id: shipper.id,
        fullName: shipper.fullName || "",
        email: shipper.email || "",
        phoneNumber: shipper.phoneNumber || "",
        isLocked: shipper.isLocked ? "Khóa" : "Không khóa",
        workTime: `${formatWorkTime(shipper.startWorkTime)} - ${formatWorkTime(shipper.endWorkTime)}`,
        lastLocationName: shipper.lastLocationName || "",
      }));
      const csv = [
        ["ID", "Họ tên", "Email", "SĐT", "Trạng thái", "Thời gian làm việc", "Vị trí cuối"],
        ...csvData.map((row) => [
          row.id,
          `"${row.fullName}"`,
          row.email,
          row.phoneNumber,
          row.isLocked,
          row.workTime,
          row.lastLocationName,
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");
         const BOM = "\uFEFF"; 
const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shippers_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      console.log("Export shippers success, showing toast: Xuất danh sách shipper thành công!");
      toast.success("Xuất danh sách shipper thành công!");
    } catch (error: any) {
      console.error("Export shippers error:", error);
      toast.error(error.message || "Lỗi khi xuất danh sách shipper");
    }
  };

  const isShipperAvailable = (shipper: Shipper): boolean => {
    return shipper.isLocked;
  };

  const getShipperOrders = async (shipperId: string, pageNumber: number = 1, pageSize: number = 10) => {
    try {
      const response = await orderApi.getAll(undefined, undefined, undefined, undefined, undefined, shipperId, pageNumber, pageSize);
      console.log(`Get orders for shipper ${shipperId} response:`, response);
      return {
        items: response.items || [],
        totalCount: response.totalCount || 0,
        pageNumber: response.pageNumber || 1,
        pageSize: response.pageSize || pageSize,
        totalPages: response.totalPages || 1,
      };
    } catch (error: any) {
      console.error(`Get orders error for shipper ${shipperId}:`, error);
      toast.error(error.message || "Lỗi khi lấy danh sách đơn hàng");
      return { items: [], totalCount: 0, pageNumber: 1, pageSize, totalPages: 1 };
    }
  };

  return {
    shippers,
    totalCount,
    pageNumber,
    pageSize,
    totalPages,
    selectedShipper,
    isDetailModalOpen,
    isAddModalOpen,
    editingShipper,
    searchParams,
    setSearchParams,
    handleViewShipper,
    handleCloseDetailModal,
    handleAddShipper,
    handleEditShipper,
    handleCloseAddModal,
    handleSubmitShipper,
    handleToggleLockShipper,
    handleExportShippers,
    formatCurrency,
    formatDate,
    formatWorkTime,
    formatOrderStatus,
    getOrderStatusColor,
    isShipperAvailable,
    getShipperOrders,
    calculateShipperStats,
    fetchShippers,
    fetchShippersWithFilters,
  };
};