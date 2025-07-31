import { useState, useEffect, useCallback } from "react";
import { useToastify } from "../../../../hooks/useToastify";
import areaApi from "../../../../api/area.api";
import type { AreaDto, CreateAreaDto } from "../../../../types/dtoModels";

export interface AreaFormData {
  name: string;
  latitude: number;
  longitude: number;
  isActive?: boolean;
}

export function useAreasLogic() {
  const [areas, setAreas] = useState<AreaDto[]>([]);
  const [selectedArea, setSelectedArea] = useState<AreaDto | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toast = useToastify();

  const fetchAreas = async () => {
    setLoading(true);
    setError(null);
    try {
      const areaList = await areaApi.getAll();
      setAreas(areaList || []);
    } catch (err: any) {
      const errorMessage = err.message || "Lỗi khi lấy danh sách khu vực";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchAreaDetail = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await areaApi.getById(id);
      setSelectedArea(response);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || "Lỗi khi lấy thông tin khu vực";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleViewArea = (area: AreaDto) => {
    fetchAreaDetail(area.id!).then((areaDetail) => {
      if (areaDetail) {
        setIsDetailModalOpen(true);
      }
    });
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedArea(null);
  };

  const handleAddArea = () => {
    setEditingArea(null);
    setIsAddModalOpen(true);
  };

  const handleEditArea = (area: AreaDto) => {
    setEditingArea(area);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingArea(null);
  };

  const handleSubmitArea = async (areaData: AreaDto) => {
    setLoading(true);
    try {
      if (editingArea) {
        const response = await areaApi.update(areaData);
        if (response.code === 0) {
          await fetchAreas();
          if (selectedArea && selectedArea.id === areaData.id) {
            setSelectedArea(response.data);
          }
          toast.success("Cập nhật khu vực thành công!");
        } else {
          toast.error(response.message || "Lỗi khi cập nhật khu vực");
        }
      } else {
        const response = await areaApi.create({
          name: areaData.name,
          latitude: areaData.latitude,
          longitude: areaData.longitude,
        });
        if (response.code === 0) {
          await fetchAreas();
          toast.success("Thêm khu vực mới thành công!");
        } else {
          toast.error(response.message || "Lỗi khi thêm khu vực");
        }
      }
      setIsAddModalOpen(false);
      setEditingArea(null);
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu khu vực");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await areaApi.updateStatus({ id });
        if (response.code === 0) {
          await fetchAreas();
          if (selectedArea && selectedArea.id === id) {
            setSelectedArea((prev) =>
              prev ? { ...prev, isActive: response.data } : null
            );
          }
          toast.success("Cập nhật trạng thái khu vực thành công!");
        } else {
          throw new Error(
            response.message || "Lỗi khi cập nhật trạng thái khu vực"
          );
        }
      } catch (err: any) {
        const errorMessage =
          err.message || "Lỗi khi cập nhật trạng thái khu vực";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [fetchAreas, selectedArea, toast]
  );

  const handleDeleteArea = async (areaId: string) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa khu vực này? Hành động này không thể hoàn tác."
      )
    ) {
      setLoading(true);
      try {
        const response = await areaApi.delete(areaId);
        if (response.code === 0) {
          await fetchAreas();
          if (selectedArea && selectedArea.id === areaId) {
            handleCloseDetailModal();
          }
          toast.success("Xóa khu vực thành công!");
        } else {
          toast.error(response.message || "Lỗi khi xóa khu vực");
        }
      } catch (err: any) {
        toast.error(err.message || "Lỗi khi xóa khu vực");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExportAreas = () => {
    const headers = ["Area ID", "Name", "Latitude", "Longitude", "Status"];
    const csvContent = [
      headers.join(","),
      ...areas.map((area) =>
        [
          area.id || "",
          `"${area.name}"`,
          area.latitude || "",
          area.longitude || "",
          area.isActive ? "Active" : "Inactive",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `areas_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Xuất danh sách khu vực thành công!");
  };

  return {
    areas,
    selectedArea,
    isDetailModalOpen,
    isAddModalOpen,
    editingArea,
    loading,
    error,
    fetchAreas,
    fetchAreaDetail,
    handleViewArea,
    handleCloseDetailModal,
    handleAddArea,
    handleEditArea,
    handleCloseAddModal,
    handleSubmitArea,
    handleDeleteArea,
    handleExportAreas,
    handleUpdateStatus,
  };
}

export const useAreaForm = (editArea?: AreaDto | null) => {
  const [formData, setFormData] = useState<AreaFormData>({
    name: editArea?.name || "",
    latitude: editArea?.latitude || 10.7769, // Mặc định trung tâm TP.HCM
    longitude: editArea?.longitude || 106.7009,
    isActive: editArea?.isActive ?? true,
  });
  const [errors, setErrors] = useState<Partial<AreaFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({
      name: editArea?.name || "",
      latitude: editArea?.latitude || 10.7769,
      longitude: editArea?.longitude || 106.7009,
      isActive: editArea?.isActive ?? true,
    });
  }, [editArea]);

  const handleInputChange = (field: keyof AreaFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (data: AreaFormData) => {
    const errors: Partial<AreaFormData> = {};
    if (!data.name?.trim()) {
      errors.name = "Tên khu vực là bắt buộc";
    }
    if (data.latitude === undefined || isNaN(data.latitude)) {
      errors.latitude = "Vĩ độ không hợp lệ";
    }
    if (data.longitude === undefined || isNaN(data.longitude)) {
      errors.longitude = "Kinh độ không hợp lệ";
    }
    return errors;
  };

  const handleSubmit = async (
    e: React.FormEvent,
    onSubmit: (data: AreaDto) => void
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

    const areaData: AreaDto = {
      ...formData,
      id: editArea?.id || undefined,
    };

    try {
      await onSubmit(areaData);
    } catch (error: any) {
      console.error("Lỗi khi submit khu vực:", error.message);
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

export const calculateAreaStats = (areas: AreaDto[]) => {
  const totalAreas = areas.length;
  const activeAreas = areas.filter((area) => area.isActive).length;

  return {
    totalAreas,
    activeAreas,
  };
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};