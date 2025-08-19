import { useState, useEffect, useCallback } from "react";
import { useToastify } from "../../../../hooks/useToastify";
import roomApi from "../../../../api/room.api";
import type { RoomDto, RoomDetailDto, RoomFilter, CreateRoomDto } from "../../../../types/dtoModels";

// Định nghĩa interface cho dữ liệu form phòng
export interface RoomFormData {
  name: string;
  isActive?: boolean;
  buildingId?: string;
}

// Hook quản lý phòng
export function useRoomsLogic(buildingId?: string) {
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomDetailDto | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const toast = useToastify();

  // Lấy tất cả phòng (có phân trang)
  const fetchRooms = useCallback(async (newPageNumber = pageNumber) => {
    setLoading(true);
    setError(null);
    try {
      const response = await roomApi.getAll(newPageNumber, pageSize);
      setRooms(response.items || []);
      setTotalCount(response.totalCount || 0);
    } catch (err: any) {
      const errorMessage = err.message || "Lỗi khi lấy danh sách phòng";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, toast]);

  // Lấy phòng theo ID chi tiết
  const fetchRoomDetail = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await roomApi.getDetail(id);
      setSelectedRoom(response);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || "Lỗi khi lấy thông tin chi tiết phòng";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Lấy phòng theo buildingId (có phân trang)
  const fetchRoomsByBuildingId = useCallback(
    async (buildingId: string, newPageNumber = pageNumber) => {
      setLoading(true);
      setError(null);
      try {
        const response = await roomApi.getByBuildingId(buildingId, newPageNumber, pageSize);
        setRooms(response.items || []);
        setTotalCount(response.totalCount || 0);
      } catch (err: any) {
        const errorMessage = err.message || "Lỗi khi lấy danh sách phòng theo tòa nhà";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [pageNumber, pageSize, toast]
  );

  // Lấy phòng theo trạng thái (toàn hệ thống, có phân trang)
  const fetchRoomsByStatus = useCallback(
    async (isActive: boolean, newPageNumber = pageNumber) => {
      setLoading(true);
      setError(null);
      try {
        const response = await roomApi.getByStatus(isActive, newPageNumber, pageSize);
        setRooms(response.items || []);
        setTotalCount(response.totalCount || 0);
      } catch (err: any) {
        const errorMessage = err.message || "Lỗi khi lấy danh sách phòng theo trạng thái";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [pageNumber, pageSize, toast]
  );

  // Lấy phòng theo buildingId và trạng thái (có phân trang)
  const fetchRoomsByBuildingIdAndStatus = useCallback(
    async (buildingId: string, isActive: boolean, newPageNumber = pageNumber) => {
      setLoading(true);
      setError(null);
      try {
        const response = await roomApi.getByBuildingIdAndStatus(buildingId, isActive, newPageNumber, pageSize);
        setRooms(response.items || []);
        setTotalCount(response.totalCount || 0);
      } catch (err: any) {
        const errorMessage = err.message || "Lỗi khi lấy danh sách phòng theo tòa nhà và trạng thái";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [pageNumber, pageSize, toast]
  );

  // Đếm số lượng phòng
  const countRooms = useCallback(async () => {
    try {
      const response = await roomApi.count();
      return response || 0;
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi đếm số lượng phòng");
      return 0;
    }
  }, [toast]);

  // Đếm số lượng phòng theo buildingId
  const countRoomsByBuildingId = useCallback(async (buildingId: string) => {
    try {
      const response = await roomApi.countByBuildingId(buildingId);
      return response || 0;
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi đếm số lượng phòng theo tòa nhà");
      return 0;
    }
  }, [toast]);

  // Đếm số phòng đang hoạt động theo buildingId
  const countActiveRoomsByBuildingId = useCallback(async (buildingId: string) => {
    try {
      const response = await roomApi.countActiveByBuildingId(buildingId);
      return response || 0;
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi đếm số lượng phòng hoạt động");
      return 0;
    }
  }, [toast]);

  // Đếm số phòng không hoạt động theo buildingId
  const countInactiveRoomsByBuildingId = useCallback(async (buildingId: string) => {
    try {
      const response = await roomApi.countInactiveByBuildingId(buildingId);
      return response || 0;
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi đếm số lượng phòng không hoạt động");
      return 0;
    }
  }, [toast]);

  // Tìm kiếm phòng (toàn hệ thống)
  const searchRooms = useCallback(async (filter: RoomFilter) => {
    setLoading(true);
    setError(null);
    try {
      const response = await roomApi.search(filter);
      setRooms(response.items || []);
      setTotalCount(response.totalCount || 0);
    } catch (err: any) {
      const errorMessage = err.message || "Lỗi khi tìm kiếm phòng";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Tìm kiếm phòng trong tòa nhà
  const searchRoomsInBuilding = useCallback(async (filter: RoomFilter) => {
    setLoading(true);
    setError(null);
    try {
      const response = await roomApi.searchInBuilding(filter);
      setRooms(response.items || []);
      setTotalCount(response.totalCount || 0);
    } catch (err: any) {
      const errorMessage = err.message || "Lỗi khi tìm kiếm phòng trong tòa nhà";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleViewRoom = useCallback(
    (room: RoomDto) => {
      fetchRoomDetail(room.id!).then((roomDetail) => {
        if (roomDetail) {
          setIsDetailModalOpen(true);
        }
      });
    },
    [fetchRoomDetail]
  );

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedRoom(null);
  }, []);

  const handleAddRoom = useCallback(() => {
    setEditingRoom(null);
    setIsAddModalOpen(true);
  }, []);

  const handleEditRoom = useCallback((room: RoomDto) => {
    setEditingRoom(room);
    setIsAddModalOpen(true);
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setIsAddModalOpen(false);
    setEditingRoom(null);
  }, []);

  const handleSubmitRoom = useCallback(
    async (roomData: RoomDto) => {
      setLoading(true);
      try {
        if (editingRoom) {
          const response = await roomApi.update(roomData);
          await fetchRoomsByBuildingId(buildingId!, pageNumber);
          if (selectedRoom && selectedRoom.id === roomData.id) {
            setSelectedRoom({ ...response, users: selectedRoom.users });
          }
          toast.success("Cập nhật phòng thành công!");
        } else {
          const createData: CreateRoomDto = {
            name: roomData.name,
            buildingId: roomData.buildingId || buildingId || "",
          };
          const response = await roomApi.create(createData);
          await fetchRoomsByBuildingId(buildingId!, pageNumber);
          toast.success("Thêm phòng mới thành công!");
        }
        setIsAddModalOpen(false);
        setEditingRoom(null);
      } catch (err: any) {
        const errorMessage = err.message || "Lỗi khi lưu phòng";
        console.error("Submit room error:", err);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [editingRoom, selectedRoom, fetchRoomsByBuildingId, buildingId, pageNumber, toast]
  );

  const handleUpdateStatus = useCallback(
    async (roomId: string) => {
      setLoading(true);
      try {
        const response = await roomApi.updateStatus({ roomId });
        await fetchRoomsByBuildingId(buildingId!, pageNumber);
        if (selectedRoom && selectedRoom.id === roomId) {
          setSelectedRoom((prev) => (prev ? { ...prev, isActive: response } : null));
        }
        toast.success("Cập nhật trạng thái phòng thành công!");
      } catch (err: any) {
        toast.error(err.message || "Lỗi khi cập nhật trạng thái phòng");
      } finally {
        setLoading(false);
      }
    },
    [selectedRoom, fetchRoomsByBuildingId, buildingId, pageNumber, toast]
  );

  const handleExportRooms = useCallback(() => {
    const headers = ["Room ID", "Name", "Status", "Building ID"];
    const csvContent = [
      headers.join(","),
      ...rooms.map((room) =>
        [
          room.id || "",
          `"${room.name}"`,
          room.isActive ? "Active" : "Inactive",
          room.buildingId || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rooms_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Export danh sách phòng thành công!");
  }, [rooms, toast]);

  return {
    rooms,
    selectedRoom,
    isDetailModalOpen,
    isAddModalOpen,
    editingRoom,
    loading,
    error,
    pageNumber,
    pageSize,
    totalCount,
    setPageNumber,
    fetchRooms,
    fetchRoomDetail,
    fetchRoomsByBuildingId,
    fetchRoomsByStatus,
    fetchRoomsByBuildingIdAndStatus,
    countRooms,
    countRoomsByBuildingId,
    countActiveRoomsByBuildingId,
    countInactiveRoomsByBuildingId,
    searchRooms,
    searchRoomsInBuilding,
    handleViewRoom,
    handleCloseDetailModal,
    handleAddRoom,
    handleEditRoom,
    handleCloseAddModal,
    handleSubmitRoom,
    handleUpdateStatus,
    handleExportRooms,
  };
}

// Hook quản lý form phòng
export const useRoomForm = (editRoom?: RoomDto | null) => {
  const [formData, setFormData] = useState<RoomFormData>({
    name: editRoom?.name || "",
    isActive: editRoom?.isActive ?? true,
    buildingId: editRoom?.buildingId || "",
  });
  const [errors, setErrors] = useState<Partial<RoomFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({
      name: editRoom?.name || "",
      isActive: editRoom?.isActive ?? true,
      buildingId: editRoom?.buildingId || "",
    });
  }, [editRoom]);

  const handleInputChange = (field: keyof RoomFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (data: RoomFormData) => {
    const errors: Partial<RoomFormData> = {};
    if (!data.name?.trim()) {
      errors.name = "Tên phòng là bắt buộc";
    }
    if (!data.buildingId?.trim()) {
      errors.buildingId = "Tòa nhà là bắt buộc";
    }
    return errors;
  };

  const handleSubmit = async (
    e: React.FormEvent,
    onSubmit: (data: RoomDto) => void
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

    const roomData: RoomDto = {
      ...formData,
      id: editRoom?.id || undefined,
    };

    try {
      await onSubmit(roomData);
    } catch (error: any) {
      console.error("Lỗi khi submit phòng:", error.message);
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

// Hàm tính thống kê phòng
export const calculateRoomStats = async (buildingId?: string) => {
  try {
   
    const [totalRoomsRes, activeRoomsRes, inactiveRoomsRes] = await Promise.all([
      buildingId ? roomApi.countByBuildingId(buildingId) : roomApi.count(),
      buildingId ? roomApi.countActiveByBuildingId(buildingId) : roomApi.countByStatus(true),
      buildingId ? roomApi.countInactiveByBuildingId(buildingId) : roomApi.countByStatus(false),
    ]);

    const totalRooms = totalRoomsRes?.count || 0;
    const activeRooms = activeRoomsRes?.count || 0;
    const inactiveRooms = inactiveRoomsRes?.count || 0;

    return {
      totalRooms,
      activeRooms,
      inactiveRooms,
    };
  } catch (err: any) {
    console.error("Lỗi khi tính thống kê phòng:", err.message);
    return {
      totalRooms: 0,
      activeRooms: 0,
      inactiveRooms: 0,
    };
  }
};

// Hàm định dạng tiền tệ
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Hàm định dạng ngày
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Hàm định dạng ngày giờ
export const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};