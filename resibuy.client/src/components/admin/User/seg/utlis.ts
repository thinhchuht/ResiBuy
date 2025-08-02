import { useState, useEffect, useCallback } from "react";
import userApi from "../../../../api/user.api";
import { useToastify } from "../../../../hooks/useToastify";
import type { UserDto } from "../../../../types/dtoModels";

interface UserFormData {
  email: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  identityNumber: string;
  password: string;
  roomIds: string[];
}

interface UserFormErrors {
  email: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  identityNumber: string;
  password: string;
  roomIds: string;
}

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

// Hook useUserForm
export const useUserForm = (editingUser?: UserDto | null) => {
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    fullName: "",
    phoneNumber: "",
    dateOfBirth: "",
    identityNumber: "",
    password: "",
    roomIds: [],
  });

  const [errors, setErrors] = useState<UserFormErrors>({
    email: "",
    fullName: "",
    phoneNumber: "",
    dateOfBirth: "",
    identityNumber: "",
    password: "",
    roomIds: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToastify();

  useEffect(() => {
    if (editingUser) {
      setFormData({
        email: editingUser.email || "",
        fullName: editingUser.fullName || "",
        phoneNumber: editingUser.phoneNumber || "",
        dateOfBirth: editingUser.dateOfBirth?.split("T")[0] || "",
        identityNumber: editingUser.identityNumber || "",
        password: "",
        roomIds: editingUser.rooms?.map((room) => room.id) || [],
      });
    } else {
      setFormData({
        email: "",
        fullName: "",
        phoneNumber: "",
        dateOfBirth: "",
        identityNumber: "",
        password: "",
        roomIds: [],
      });
      setErrors({
        email: "",
        fullName: "",
        phoneNumber: "",
        dateOfBirth: "",
        identityNumber: "",
        password: "",
        roomIds: "",
      });
    }
  }, [editingUser]);

  const handleInputChange = (field: keyof UserFormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: UserFormErrors = {
      email: "",
      fullName: "",
      phoneNumber: "",
      dateOfBirth: "",
      identityNumber: "",
      password: "",
      roomIds: "",
    };
    let isValid = true;

    if (!editingUser) {
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

      if (!formData.password) {
        newErrors.password = "Mật khẩu là bắt buộc khi tạo mới";
        isValid = false;
      } else if (formData.password.length < 6) {
        newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    onSubmit: (user: UserFormData) => Promise<void>
  ) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast.success(editingUser ? "Cập nhật người dùng thành công!" : "Thêm người dùng thành công!");
    } catch (error: any) {
      console.error("Submit user error:", error);
      toast.error(error.message || "Lỗi khi lưu người dùng");
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

// Hàm tính thống kê người dùng
export const calculateUserStats = async () => {
  const { toast } = useToastify();
  try {
    const response = await userApi.getstats();
    console.log("API getstats response:", response); // Thêm log để debug
    if (response.code !== 0) {
      throw new Error(response.message || "Lỗi khi lấy thống kê người dùng");
    }
    return {
      totalUsers: response.data?.totalUsers ?? 0,
      lockedUsers: response.data?.lockedUsers ?? 0,
      totalReportCount: response.data?.totalReportCount ?? 0,
    };
  } catch (error: any) {
    console.error("Error in calculateUserStats:", error);
    toast.error(error.message || "Lỗi khi tính thống kê người dùng");
    return {
      totalUsers: 0,
      lockedUsers: 0,
      totalReportCount: 0,
    };
  }
};

// Hook useUsersLogic
export const useUsersLogic = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const  toast  = useToastify();

  // Lấy danh sách người dùng
  const fetchUsers = useCallback(async (page: number = 1, pageSize: number = 15, keyword: string = "") => {
    try {
      const response = keyword
        ? await userApi.searchUsers(keyword, page, pageSize)
        : await userApi.getAllUser(page, pageSize);
      console.log("Fetch users response:", response);
      if (response.code === 0 && Array.isArray(response.data.items)) {
        setUsers(response.data.items);
        setTotalCount(response.data.totalCount || 0);
        setPageNumber(response.data.pageNumber || 1);
        setTotalPages(response.data.totalPages || 1);
      } else {
        throw new Error(response.message || "Dữ liệu người dùng không hợp lệ");
      }
    } catch (error: any) {
      console.error("Fetch users error:", error);
      toast.error(error.message || "Lỗi khi lấy danh sách người dùng");
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers(pageNumber, pageSize, searchTerm);
  }, [fetchUsers, pageNumber, pageSize, searchTerm]);

  const handleViewUser = async (user: UserDto) => {
    try {
      const response = await userApi.getById(user.id);
      console.log("Get user by ID response:", response);
      if (response.code === 0) {
        setSelectedUser(response.data);
        setIsDetailModalOpen(true);
      } else {
        throw new Error(response.message || "Lỗi khi lấy thông tin người dùng");
      }
    } catch (error: any) {
      console.error("Get user by ID error:", error);
      toast.error(error.message || "Lỗi khi lấy thông tin người dùng");
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedUser(null);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsAddModalOpen(true);
  };

  const handleEditUser = async (user: UserDto) => {
    try {
      const response = await userApi.getById(user.id);
      console.log("Get user by ID response:", response);
      if (response.code === 0) {
        setEditingUser(response.data);
        setIsAddModalOpen(true);
        setIsDetailModalOpen(false);
      } else {
        throw new Error(response.message || "Lỗi khi lấy thông tin người dùng");
      }
    } catch (error: any) {
      console.error("Get user by ID error:", error);
      toast.error(error.message || "Lỗi khi lấy thông tin người dùng");
    }
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmitUser = async (user: UserFormData) => {
    try {
      if (editingUser) {
        // Cập nhật người dùng (chỉ cập nhật các trường cần thiết, API createUser hỗ trợ cả cập nhật)
        const updateResponse = await userApi.createUser({
          email: user.email,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName,
          dateOfBirth: new Date(user.dateOfBirth),
          identityNumber: user.identityNumber,
          roomIds: user.roomIds,
          code: editingUser.id,
        });
        console.log("Update user response:", updateResponse);
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? { ...u, ...user, rooms: updateResponse.data.rooms } : u))
        );
      } else {
        const createResponse = await userApi.createUser({
          email: user.email,
          phoneNumber: user.phoneNumber,
          password: user.password,
          fullName: user.fullName,
          dateOfBirth: new Date(user.dateOfBirth),
          identityNumber: user.identityNumber,
          roomIds: user.roomIds,
        });
        console.log("Create user response:", createResponse);
        await fetchUsers(pageNumber, pageSize, searchTerm);
      }
      handleCloseAddModal();
      toast.success(editingUser ? "Cập nhật người dùng thành công!" : "Thêm người dùng thành công!");
    } catch (error: any) {
      console.error("Submit user error:", error);
      toast.error(error.message || "Lỗi khi lưu người dùng");
    }
  };

  const handleToggleLockUser = async (userId: string, currentLockStatus: boolean) => {
    try {
      const response = await userApi.lockUnlockUser(userId);
      console.log("Toggle lock response:", response);
      if (response.code === 0) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, isLocked: !currentLockStatus } : u
          )
        );
        toast.success(!currentLockStatus ? "Khóa người dùng thành công!" : "Mở khóa người dùng thành công!");
      } else {
        throw new Error(response.message || "Lỗi khi thay đổi trạng thái khóa");
      }
    } catch (error: any) {
      console.error("Toggle lock user error:", error);
      toast.error(error.message || "Lỗi khi thay đổi trạng thái khóa người dùng");
    }
  };

  const handleExportUsers = async () => {
    try {
      const response = await userApi.getAllUser(1, 100);
      console.log("Export users response:", response);
      if (response.code !== 0) {
        throw new Error(response.message || "Lỗi khi lấy danh sách người dùng");
      }
      const csvData = response.data.items.map((user: UserDto) => ({
        id: user.id,
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        isLocked: user.isLocked ? "Đã Khóa" : "Hoạt động",
        roles: user.roles.join(", "),
        rooms: user.rooms?.map((room) => room.name).join(", ") || "",
        dateOfBirth: formatDate(user.dateOfBirth),
        createdAt: formatDate(user.createdAt),
      }));
      const csv = [
        ["ID", "Họ Tên", "Email", "Số Điện Thoại", "Trạng Thái", "Vai Trò", "Phòng", "Ngày Sinh", "Ngày Tạo"],
        ...csvData.map((row) => [
          row.id,
          `"${row.fullName}"`,
          row.email,
          row.phoneNumber,
          row.isLocked,
          `"${row.roles}"`,
          `"${row.rooms}"`,
          row.dateOfBirth,
          row.createdAt,
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Xuất danh sách người dùng thành công!");
    } catch (error: any) {
      console.error("Export users error:", error);
      toast.error(error.message || "Lỗi khi xuất danh sách người dùng");
    }
  };

  const handlePageChange = (page: number) => {
    setPageNumber(page);
  };

  const handleSearch = (keyword: string) => {
    setSearchTerm(keyword);
    setPageNumber(1);
  };

  return {
    users,
    totalCount,
    pageNumber,
    pageSize,
    totalPages,
    selectedUser,
    isDetailModalOpen,
    isAddModalOpen,
    editingUser,
    searchTerm,
    handleViewUser,
    handleCloseDetailModal,
    handleAddUser,
    handleEditUser,
    handleCloseAddModal,
    handleSubmitUser,
    handleToggleLockUser,
    handleExportUsers,
    handlePageChange,
    handleSearch,
    fetchUsers,
    calculateUserStats,
  };
};