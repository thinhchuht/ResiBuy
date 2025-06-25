import { useState, useEffect, type FormEvent } from "react";
import  {type Shipper,type User, UserRole, type Order, OrderStatus } from "../../../../types/models";
import { fakeOrders } from "../../../../fakeData/fakeOrderData";
import { fakeShippers } from "../../../../fakeData/fakeShipperData";
import { fakeUsers } from "../../../../fakeData/fakeUserData";

interface ShipperFormData {
  email: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  identityNumber: string;
  startWorkTime: string;
  endWorkTime: string;
  isAvailable: boolean;
}

interface ShipperFormErrors {
  email: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  identityNumber: string;
  startWorkTime: string;
  endWorkTime: string;
}

// Hook useShipperForm
export const useShipperForm = (editingShipper?: Shipper | null, editingUser?: User | null) => {
  const [formData, setFormData] = useState<ShipperFormData>({
    email: "",
    fullName: "",
    phoneNumber: "",
    dateOfBirth: "",
    identityNumber: "",
    startWorkTime: "08:00",
    endWorkTime: "17:00",
    isAvailable: true,
  });

  const [errors, setErrors] = useState<ShipperFormErrors>({
    email: "",
    fullName: "",
    phoneNumber: "",
    dateOfBirth: "",
    identityNumber: "",
    startWorkTime: "",
    endWorkTime: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingShipper && editingUser) {
      setFormData({
        email: editingUser.email,
        fullName: editingUser.fullName,
        phoneNumber: editingUser.phoneNumber,
        dateOfBirth: editingUser.dateOfBirth.split("T")[0],
        identityNumber: editingUser.identityNumber,
        startWorkTime: new Date(editingShipper.startWorkTime).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        endWorkTime: new Date(editingShipper.endWorkTime).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        isAvailable: editingShipper.isAvailable,
      });
    } else {
      setFormData({
        email: "",
        fullName: "",
        phoneNumber: "",
        dateOfBirth: "",
        identityNumber: "",
        startWorkTime: "08:00",
        endWorkTime: "17:00",
        isAvailable: true,
      });
      setErrors({
        email: "",
        fullName: "",
        phoneNumber: "",
        dateOfBirth: "",
        identityNumber: "",
        startWorkTime: "",
        endWorkTime: "",
      });
    }
  }, [editingShipper, editingUser]);

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
    };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = "Email là bắt buộc";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
      isValid = false;
    }

    if (!formData.fullName) {
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

    if (!formData.startWorkTime) {
      newErrors.startWorkTime = "Thời gian bắt đầu là bắt buộc";
      isValid = false;
    }

    if (!formData.endWorkTime) {
      newErrors.endWorkTime = "Thời gian kết thúc là bắt buộc";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (
    e: FormEvent<HTMLFormElement>,
    onSubmit: (shipper: Shipper, user: User) => void
  ) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const user: User = {
      id: editingUser?.id || `user-${Date.now()}`,
      email: formData.email,
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      dateOfBirth: formData.dateOfBirth,
      identityNumber: formData.identityNumber,
      roles: editingUser?.roles.includes(UserRole.Shipper)
        ? editingUser.roles
        : [...(editingUser?.roles || []), UserRole.Shipper],
      refreshTokens: editingUser?.refreshTokens || [],
      orders: editingUser?.orders || [],
      userVouchers: editingUser?.userVouchers || [],
      userRooms: editingUser?.userRooms || [],
    };

    const shipper: Shipper = {
      id: editingShipper?.id || `shipper-${Date.now()}`,
      userId: user.id,
      isAvailable: formData.isAvailable,
      orders: editingShipper?.orders || [],
      startWorkTime: new Date(`2025-06-19T${formData.startWorkTime}:00Z`).toISOString(),
      endWorkTime: new Date(`2025-06-19T${formData.endWorkTime}:00Z`).toISOString(),
      reportCount: editingShipper?.reportCount || 0,
    };

    onSubmit(shipper, user);
    setIsSubmitting(false);
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleInputChange,
    handleSubmit,
  };
};

// Hàm định dạng tiền tệ (VNĐ)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
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
  });
};

// Hàm định dạng thời gian làm việc
export const formatWorkTime = (time: string): string => {
  return new Date(time).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

// Hàm định dạng trạng thái đơn hàng
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
    default:
      return status;
  }
};

// Hàm lấy màu trạng thái đơn hàng
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
    default:
      return { bgcolor: "#F3F4F6", color: "#6B7280" };
  }
};

// Hàm tính thống kê shipper
export const calculateShipperStats = (shippers: Shipper[]) => {
  const totalShippers = shippers.length;
  const totalOrders = fakeOrders.length;
  const totalRevenue = fakeOrders
    .filter((order) => order.status === OrderStatus.Delivered)
    .reduce((sum, order) => sum + order.totalAmount, 0);

  return {
    totalShippers,
    totalOrders,
    totalRevenue,
  };
};

// Hook useShippersLogic
export const useShippersLogic = () => {
  const [shippers, setShippers] = useState<Shipper[]>(fakeShippers);
  const [users, setUsers] = useState<User[]>(fakeUsers);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedShipper, setSelectedShipper] = useState<Shipper | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingShipper, setEditingShipper] = useState<Shipper | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleViewShipper = (shipper: Shipper) => {
    const user = users.find((u) => u.id === shipper.userId);
    setSelectedShipper(shipper);
    setSelectedUser(user || null);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedShipper(null);
    setSelectedUser(null);
  };

  const handleAddShipper = () => {
    setEditingShipper(null);
    setEditingUser(null);
    setIsAddModalOpen(true);
  };

  const handleEditShipper = (shipper: Shipper, user: User) => {
    setEditingShipper(shipper);
    setEditingUser(user);
    setIsAddModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingShipper(null);
    setEditingUser(null);
  };

  const handleSubmitShipper = (shipper: Shipper, user: User) => {
    if (editingShipper) {
      // Cập nhật shipper
      setShippers((prev) =>
        prev.map((s) => (s.id === shipper.id ? shipper : s))
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? user : u))
      );
    } else {
      // Thêm shipper mới
      setShippers((prev) => [...prev, shipper]);
      setUsers((prev) => [...prev, user]);
    }
    handleCloseAddModal();
  };

  const handleDeleteShipper = (shipperId: string) => {
    const shipper = shippers.find((s) => s.id === shipperId);
    if (shipper) {
      setShippers((prev) => prev.filter((s) => s.id !== shipperId));
      setUsers((prev) => prev.filter((u) => u.id !== shipper.userId));
    }
    handleCloseDetailModal();
  };

  const handleExportShippers = () => {
    const csvData = shippers.map((shipper) => {
      const user = users.find((u) => u.id === shipper.userId);
      return {
        id: shipper.id,
        fullName: user?.fullName || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        isAvailable: shipper.isAvailable ? "Sẵn Sàng" : "Không Sẵn Sàng",
        workTime: `${formatWorkTime(shipper.startWorkTime)} - ${formatWorkTime(shipper.endWorkTime)}`,
        totalOrders: countOrdersByShipperId(shipper.id),
      };
    });
    const csv = [
      ["ID", "Họ Tên", "Email", "Số Điện Thoại", "Trạng Thái", "Thời Gian Làm Việc", "Tổng Đơn Hàng"],
      ...csvData.map((row) => [
        row.id,
        row.fullName,
        row.email,
        row.phoneNumber,
        row.isAvailable,
        row.workTime,
        row.totalOrders,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shippers.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const isShipperAvailable = (shipper: Shipper): boolean => {
    return shipper.isAvailable;
  };

  const countOrdersByShipperId = (shipperId: string): number => {
    return fakeOrders.filter((order) => order.shipperId === shipperId).length;
  };

  const calculateShipperRevenue = (shipperId: string): number => {
    return fakeOrders
      .filter(
        (order) =>
          order.shipperId === shipperId && order.status === OrderStatus.Delivered
      )
      .reduce((total, order) => total + order.totalAmount, 0);
  };

  const getShipperOrders = (shipperId: string): Order[] => {
    return fakeOrders.filter((order) => order.shipperId === shipperId);
  };

  return {
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
    formatCurrency,
    formatDate,
    formatWorkTime,
    formatOrderStatus,
    getOrderStatusColor,
    isShipperAvailable,
    countOrdersByShipperId,
    calculateShipperRevenue,
    getShipperOrders,
    calculateShipperStats,
  };
};