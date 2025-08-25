import { useState, useEffect, useCallback } from "react";
import { useToastify } from "../../../../hooks/useToastify";
import buildingApi from "../../../../api/building.api";
import type { BuildingDto, CreateBuildingDto, UpdateStatusBuildingDto } from "../../../../types/dtoModels";

// Định nghĩa interface cho dữ liệu form tòa nhà
export interface BuildingFormData {
  name: string;
  isActive?: boolean;
  areaId?: string;
}

// Hook quản lý tòa nhà
export function useBuildingsLogic(areaId?: string) {
  const [buildings, setBuildings] = useState<BuildingDto[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingDto | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<BuildingDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toast = useToastify();

  // Lấy tất cả tòa nhà
  const fetchBuildings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await buildingApi.getAll();
      setBuildings(response || []);
    } catch (err: any) {
      const errorMessage = err.message || "Lỗi khi lấy danh sách tòa nhà";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Lấy tòa nhà theo areaId
  const fetchBuildingsByAreaId = useCallback(async (areaId: string, getActive: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await buildingApi.getByAreaId(areaId, getActive);
      setBuildings(response || []);
    } catch (err: any) {
      const errorMessage = err.message || "Lỗi khi lấy danh sách tòa nhà theo khu vực";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Lấy tòa nhà theo ID
  const fetchBuildingById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await buildingApi.getById(id);
      setSelectedBuilding(response);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || "Lỗi khi lấy thông tin tòa nhà";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Đếm số lượng tòa nhà
  const countBuildings = useCallback(async () => {
    try {
      const response = await buildingApi.count();
      return response || 0;
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi đếm số lượng tòa nhà");
      return 0;
    }
  }, [toast]);

  const handleViewBuilding = useCallback((building: BuildingDto) => {
    fetchBuildingById(building.id!).then((buildingDetail) => {
      if (buildingDetail) {
        setIsDetailModalOpen(true);
      }
    });
  }, [fetchBuildingById]);

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedBuilding(null);
  }, []);

  const handleAddBuilding = useCallback(() => {
    setEditingBuilding(null);
    setIsAddModalOpen(true);
  }, []);

  const handleEditBuilding = useCallback((building: BuildingDto) => {
    setEditingBuilding(building);
    setIsAddModalOpen(true);
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setIsAddModalOpen(false);
    setEditingBuilding(null);
  }, []);

  const handleSubmitBuilding = useCallback(
  async (buildingData: BuildingDto) => {
    setLoading(true);
    try {
      if (editingBuilding) {
        const response = await buildingApi.update(buildingData);
        if (response.code === 0) {
          await fetchBuildingsByAreaId(buildingData.areaId!);
          if (selectedBuilding && selectedBuilding.id === buildingData.id) {
            setSelectedBuilding(response.data);
          }
          toast.success("Cập nhật tòa nhà thành công!");
        } else {
          throw new Error(response.message || "Lỗi khi cập nhật tòa nhà");
        }
      } else {
        const createData: CreateBuildingDto = {
          name: buildingData.name,
          areaId: buildingData.areaId || areaId || "",
        };
        const response = await buildingApi.create(createData);
        if (response.code === 0) {
          await fetchBuildingsByAreaId(buildingData.areaId!);
          toast.success("Thêm tòa nhà mới thành công!");
        } else {
          throw new Error(response.message || "Lỗi khi thêm tòa nhà");
        }
      }
    } catch (err: any) {
      // Truy cập thông điệp lỗi từ API nếu có
      const errorMessage =
        err.response?.data?.message || err.message || "Lỗi khi lưu tòa nhà";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      handleCloseAddModal(); // Đóng modal sau khi submit
    }
  },
  [editingBuilding, selectedBuilding, fetchBuildingsByAreaId, toast, areaId]
);

  const handleUpdateStatus = useCallback(
    async (buildingId: string) => {
      setLoading(true);
      try {
        const response = await buildingApi.updateStatus({ buildingId });
        if (response.code === 0) {
          await fetchBuildingsByAreaId(areaId!);
          if (selectedBuilding && selectedBuilding.id === buildingId) {
            setSelectedBuilding((prev) => (prev ? { ...prev, isActive: response.data.isActive } : null));
          }
          toast.success("Cập nhật trạng thái tòa nhà thành công!");
        } else {
          throw new Error(response.message || "Lỗi khi cập nhật trạng thái");
        }
      } catch (err: any) {
        toast.error(err.message || "Lỗi khi cập nhật trạng thái tòa nhà");
      } finally {
        setLoading(false);
      }
    },
    [selectedBuilding, fetchBuildingsByAreaId, toast, areaId]
  );

  const handleExportBuildings = useCallback(() => {
    const headers = ["ID", "Tên", "Trạng thái"];
    const csvContent = [
      headers.join(","),
      ...buildings.map((building) =>
        [
          building.id || "",
          `"${building.name}"`,
          building.isActive ? "Hoạt động" : "Không hoạt động",
          building.areaId || "",
        ].join(",")
      ),
    ].join("\n");

       const BOM = "\uFEFF"; 
const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `buildings_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Xuất danh sách tòa nhà thành công!");
  }, [buildings, toast]);

  return {
    buildings,
    selectedBuilding,
    isDetailModalOpen,
    isAddModalOpen,
    editingBuilding,
    loading,
    error,
    fetchBuildings,
    fetchBuildingsByAreaId,
    fetchBuildingById,
    countBuildings,
    handleViewBuilding,
    handleCloseDetailModal,
    handleAddBuilding,
    handleEditBuilding,
    handleCloseAddModal,
    handleSubmitBuilding,
    handleUpdateStatus,
    handleExportBuildings,
  };
}

// Hook quản lý form tòa nhà
export const useBuildingForm = (editBuilding?: BuildingDto | null, defaultAreaId?: string) => {
  const [formData, setFormData] = useState<BuildingFormData>({
    name: editBuilding?.name || "",
    isActive: editBuilding?.isActive ?? true,
    areaId: editBuilding?.areaId || defaultAreaId || "",
  });
  const [errors, setErrors] = useState<Partial<BuildingFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({
      name: editBuilding?.name || "",
      isActive: editBuilding?.isActive ?? true,
      areaId: editBuilding?.areaId || defaultAreaId || "",
    });
  }, [editBuilding, defaultAreaId]);

  const handleInputChange = (field: keyof BuildingFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (data: BuildingFormData) => {
    const errors: Partial<BuildingFormData> = {};
    if (!data.name?.trim()) {
      errors.name = "Tên tòa nhà là bắt buộc";
    }
    if (!data.areaId?.trim()) {
      errors.areaId = "Khu vực là bắt buộc";
    }
    return errors;
  };

  const handleSubmit = async (
    e: React.FormEvent,
    onSubmit: (data: BuildingDto) => void
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

    const buildingData: BuildingDto = {
      ...formData,
      id: editBuilding?.id || undefined,
    };

    try {
      await onSubmit(buildingData);
      // Reset form sau khi submit, giữ nguyên areaId
      setFormData({
        name: "",
        isActive: true,
        areaId: formData.areaId,
      });
      setErrors({});
    } catch (error: any) {
      console.error("Lỗi khi submit tòa nhà:", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      isActive: true,
      areaId: formData.areaId, // Giữ nguyên areaId
    });
    setErrors({});
    setIsSubmitting(false);
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleInputChange,
    handleSubmit,
    handleClose,
  };
};

// Hàm tính thống kê tòa nhà
export const calculateBuildingStats = (buildings: BuildingDto[]) => {
  const totalBuildings = buildings.length;
  const activeBuildings = buildings.filter((building) => building.isActive).length;

  return {
    totalBuildings,
    activeBuildings,
  };
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