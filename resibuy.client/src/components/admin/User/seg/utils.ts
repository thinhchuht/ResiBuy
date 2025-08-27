import { useState, useEffect, useCallback } from "react";
import userApi from "../../../../api/user.api";
import { useToastify } from "../../../../hooks/useToastify";
import type { UserDto, RoomDto } from "../../../../types/dtoModels";

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

export const formatDateWithoutTime = (date: string): string => {
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

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
  const  toast  = useToastify();

  const resetForm = () => {
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
  };

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
      setErrors({
        email: "",
        fullName: "",
        phoneNumber: "",
        dateOfBirth: "",
        identityNumber: "",
        password: "",
        roomIds: "",
      });
    } else {
      resetForm();
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
      } else if (formData.password.length < 8) {
        newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
        isValid = false;
      } else if (!/(?=.*[a-z])/.test(formData.password)) {
        newErrors.password = "Mật khẩu phải có ít nhất 1 chữ thường";
        isValid = false;
      } else if (!/(?=.*[A-Z])/.test(formData.password)) {
        newErrors.password = "Mật khẩu phải có ít nhất 1 chữ hoa";
        isValid = false;
      } else if (!/(?=.*\d)/.test(formData.password)) {
        newErrors.password = "Mật khẩu phải có ít nhất 1 số";
        isValid = false;
      }
    }

    if (formData.roomIds.length === 0) {
      newErrors.roomIds = "Vui lòng chọn ít nhất một phòng";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    onSubmit: (user: UserFormData, rooms: RoomDto[]) => Promise<void>,
    rooms: RoomDto[]
  ) => {
    console.log("handleSubmit called with formData:", formData);
    e.preventDefault();
    if (!editingUser && !validateForm()) {
      console.log("Validation failed, stopping submit");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData, rooms);
    
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
    setIsSubmitting,
    isSubmitting,
    handleInputChange,
    handleSubmit,
    validateForm,
    resetForm, // Thêm resetForm vào object trả về
  };
};

export const calculateUserStats = async () => {
  const  toast  = useToastify();
  try {
    const response = await userApi.getstats();
    console.log("API getstats response:", response);
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

export const useUsersLogic = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [editingRoleUser, setEditingRoleUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const  toast  = useToastify();

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
  }, [pageNumber, pageSize, searchTerm]);

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
        console.log("Setting editingUser:", response.data);
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

  const handleEditRole = async (userId: string) => {
    setEditingRoleUser(userId);
    setIsEditRoleModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingUser(null);
    
  };

  const handleCloseEditRoleModal = () => {
    setIsEditRoleModalOpen(false);
    setEditingRoleUser(null);
  };

  const handleSubmitUser = async (user: UserFormData, rooms: RoomDto[]) => {
    console.log("handleSubmitUser called with:", { user, rooms, editingUser });
    try {
      if (editingUser) {
        console.log("Editing user with ID:", editingUser.id);
        const currentRoomIds = editingUser.rooms?.map((room) => room.id) || [];
        const removedRoomIds = currentRoomIds.filter((id) => !user.roomIds.includes(id));
        console.log("Removed room IDs:", removedRoomIds);
        if (removedRoomIds.length > 0) {
          const removeResponse = await userApi.removeUserRom(editingUser.id, removedRoomIds);
          console.log("Remove user from rooms response:", removeResponse);
          if (removeResponse.code !== 0) {
            throw new Error(removeResponse.message || "Lỗi khi xóa người dùng khỏi phòng");
          }
        }
        console.log("Selected room IDs:", user.roomIds);
        if (user.roomIds.length > 0) {
          const addResponse = await userApi.addUserToRooms([editingUser.id], user.roomIds);
          console.log("Add user to rooms response:", addResponse);
          if (addResponse.error) {
            throw new Error(addResponse.error.message || "Lỗi khi cập nhật phòng");
          }
        }
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? { ...u, rooms: rooms.filter((room) => user.roomIds.includes(room.id)) }
              : u
          )
        );
      } else {
        console.log("Creating new user");
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
        if (createResponse.code !== 0) {
          throw new Error(createResponse.message || "Lỗi khi tạo người dùng");
        }
        await fetchUsers(pageNumber, pageSize, searchTerm);
      }
      handleCloseAddModal();
      toast.success(editingUser ? "Cập nhật phòng thành công!" : "Thêm người dùng thành công!");
    } catch (error: any) {
      console.error("Submit user error:", error);
      toast.error(error.message || "Lỗi khi lưu người dùng");
    }
  };

  interface RoleData {
    roles: string[];
    shipper?: { lastLocationId: string; startWorkTime: number; endWorkTime: number };
    store?: { name: string; description: string; phoneNumber: string; roomId: string };
    customer?: { roomId: string };
  }

  const handleSubmitRole = async (userId: string, data: RoleData) => {
    try {
      const response = await userApi.updateUserRoles(userId, data);
      console.log("Update user roles response:", response);
      if (response.code === 0) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, roles: data.roles, stores: data.store ? [{ ...data.store, isLocked: false }] : u.stores }
              : u
          )
        );
        handleCloseEditRoleModal();
      } else {
        throw new Error(response.message || "Lỗi khi cập nhật vai trò");
      }
    } catch (error: any) {
      console.error("Update user roles error:", error);
      throw error;
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
      const response = await userApi.getAllUser(1, 10000);
      console.log("Export users response:", response);
      if (response.code !== 0) {
        throw new Error(response.message || "Lỗi khi lấy danh sách người dùng");
      }
      
      const headers = ["ID", "Họ tên", "Email", "Số điện thoại", "Trạng thái", "Vai trò", "Phòng", "Ngày sinh", "Ngày tạo"];
      
      const csvRows = response.data.items.map((user: UserDto) => {
        const userData = [
          user.id,
          `"${user.fullName || ''}"`,
          user.email || '',
          user.phoneNumber || '',
          user.isLocked ? "Khóa" : "Không khóa",
          `"${user.roles.join(", ")}"`,
          `"${user.rooms?.map((room) => room.name).join(", ") || ''}"`,
          formatDateWithoutTime(user.dateOfBirth),
          formatDate(user.createdAt),
        ];
        return userData.join(',');
      });
      
      const csvContent = [
        headers.join(','),
        ...csvRows
      ].join('\n');
      
     const BOM = "\uFEFF"; 
const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Xuất danh sách người dùng thành công!");
    } catch (error: any) {
      console.error("Export users error:", error);
      toast.error(error.message || "Lỗi khi xuất danh sách người dùng");
    }
  };

  const handleImportExcel = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await userApi.importExcel(formData);
      
      if (response.code === 0) {
        await fetchUsers(pageNumber, pageSize, searchTerm);
        return response.data;
      } else {
        throw new Error(response.message || "Lỗi khi nhập file Excel");
      }
    } catch (error: unknown) {
      console.error("Import Excel error:", error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi nhập file Excel";
      toast.error(errorMessage);
      throw error;
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
    isEditRoleModalOpen,
    editingUser,
    editingRoleUser,
    searchTerm,
    handleViewUser,
    handleCloseDetailModal,
    handleAddUser,
    handleEditUser,
    handleEditRole,
    handleCloseAddModal,
    handleCloseEditRoleModal,
    handleSubmitUser,
    handleSubmitRole,
    handleToggleLockUser,
    handleExportUsers,
    handleImportExcel,
    handlePageChange,
    handleSearch,
    fetchUsers,
    calculateUserStats,
    formatDateWithoutTime,
  };
};