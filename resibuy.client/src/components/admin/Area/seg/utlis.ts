import { useState, useEffect, useCallback } from "react";
import { useToastify } from "../../../../hooks/useToastify";
import areaApi from "../../../../api/area.api";
import importApi from "../../../../api/import.api";
import type { AreaDto } from "../../../../types/dtoModels";
import * as XLSX from "xlsx";

export interface AreaFormData {
  name: string;
  latitude: string;
  longitude: string;
  isActive?: boolean;
}

interface ImportData {
  areaName: string;
  latitude: string;
  longitude: string;
  buildingName: string;
  roomNames: string[];
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
      const areaList = await areaApi.getAll(false);
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
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu khu vực");
    } finally {
      setLoading(false);
      handleCloseAddModal(); // Đảm bảo gọi sau khi submit hoàn tất
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

  const handleExportAreas = () => {
    const headers = ["ID", "Tên", "Vĩ độ", "Kinh độ", "Trạng thái"];
    const csvContent = [
      headers.join(","),
      ...areas.map((area) =>
        [
          area.id || "",
          `"${area.name}"`,
          area.latitude || "",
          area.longitude || "",
          area.isActive ? "Hoạt động" : "Không hoạt động",
        ].join(",")
      ),
    ].join("\n");
    const BOM = "\uFEFF"; 
const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
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
    handleExportAreas,
    handleUpdateStatus,
  };
}

export const useAreaForm = (editArea?: AreaDto | null) => {
  const [formData, setFormData] = useState<AreaFormData>({
    name: editArea?.name || "",
    latitude: editArea?.latitude || 10.7769,
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
      if (!editArea) {
        // Reset form khi thêm mới thành công
        setFormData({
          name: "",
          latitude: 10.7769,
          longitude: 106.7009,
          isActive: true,
        });
        setErrors({});
      }
    } catch (error: any) {
      console.error("Lỗi khi submit khu vực:", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      latitude: 10.7769,
      longitude: 106.7009,
      isActive: true,
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

export const handleImport = (fetchAreas: () => Promise<void>) => {
  const toast = useToastify();
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [importModal, setImportModal] = useState<{
    open: boolean;
    message: string;
    existingEntities: string[];
    newEntities: string[];
    data: ImportData[];
    errors: string[];
    onConfirm: () => void;
  }>({
    open: false,
    message: "Hệ thống sẽ kiểm tra tất cả các thực thể, nếu thực thể nào chưa có thì sẽ tạo mới, nếu khu vực đã tồn tại thì bạn chỉ cần nhập tên hệ thống sẽ tự thêm các thực thể còn lại.",
    existingEntities: [],
    newEntities: [],
    data: [],
    errors: [],
    onConfirm: () => {},
  });

  const handleOpenImportModal = () => {
    setImportModal({
      open: true,
      message: "Hệ thống sẽ kiểm tra tất cả các thực thể, nếu thực thể nào chưa có thì sẽ tạo mới, nếu khu vực đã tồn tại thì bạn chỉ cần nhập tên hệ thống sẽ tự thêm các thực thể còn lại.",
      existingEntities: [],
      newEntities: [],
      data: [],
      errors: [],
      onConfirm: () => {},
    });
  };

  const handleImportModalClose = () => {
    setImportModal({
      open: false,
      message: "Hệ thống sẽ kiểm tra tất cả các thực thể, nếu thực thể nào chưa có thì sẽ tạo mới, nếu khu vực đã tồn tại thì bạn chỉ cần nhập tên hệ thống sẽ tự thêm các thực thể còn lại.",
      existingEntities: [],
      newEntities: [],
      data: [],
      errors: [],
      onConfirm: () => {},
    });
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      toast.error("Vui lòng chọn file Excel để tải lên");
      return;
    }

    try {
      const response = await importApi.upload(file);
      const responseData = response.data as {
        code: number;
        message: string;
        data?: { existingEntities: string[]; newEntities: string[]; data: ImportData[]; errors: string[] };
      };
      if (responseData.code === 0 && responseData.data && Array.isArray(responseData.data.data)) {
        toast.info(responseData.message);
        
        const existingEntities = Array.isArray(responseData.data.existingEntities) ? responseData.data.existingEntities : [];
        const newEntities = Array.isArray(responseData.data.newEntities) ? responseData.data.newEntities : [];
        const hasNewEntities = newEntities.length > 0;
        
        setImportModal({
          open: true,
          message: hasNewEntities 
            ? responseData.message || "Thành công"
            : "Không có thực thể nào được thêm mới.",
          existingEntities,
          newEntities,
          data: Array.isArray(responseData.data.data) ? responseData.data.data : [],
          errors: Array.isArray(responseData.data.errors) ? responseData.data.errors : [],
          onConfirm: hasNewEntities 
            ? () => handleConfirmImport(responseData.data.data || [])
            : () => handleImportModalClose(), // Chỉ đóng modal nếu không có thực thể mới
        });
      } else {
        toast.error(responseData.message || "Dữ liệu trả về không hợp lệ");
        console.error("Invalid API response:", JSON.stringify(responseData, null, 2));
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Lỗi không xác định khi tải file";
      console.error("Upload error:", errorMessage, JSON.stringify(error, null, 2));
      toast.error(errorMessage);
    }
  };

  const handleConfirmImport = async (data: ImportData[]) => {
    setIsConfirmLoading(true);
    try {
      const response = await importApi.confirm(data);
      const responseData = response.data as { code: number; message: string };
      if (responseData.code === 0) {
        toast.success(responseData.message);
        await fetchAreas(); // Fetch lại dữ liệu sau khi import thành công
      } else {
        toast.error(responseData.message);
      }
      handleImportModalClose();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Lỗi khi xác nhận import";
      console.error("Confirm import error:", JSON.stringify(error, null, 2));
      toast.error(errorMessage);
      handleImportModalClose();
    } finally {
      setIsConfirmLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      { "Tên khu vực": "Khu A", "Vĩ độ": 20.99571, "Kinh độ": 105.824376, "Tên tòa nhà": "Tòa A", "Tên phòng": "0101" },
      { "Tên khu vực": "Khu A", "Vĩ độ": 20.99571, "Kinh độ": 105.824376, "Tên tòa nhà": "Tòa A", "Tên phòng": "0102" },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    
    // Set column widths
    worksheet["!cols"] = [
      { wch: 20 }, 
      { wch: 15 }, 
      { wch: 15 }, 
      { wch: 20 },
      { wch: 15 }, 
    ];

    XLSX.writeFile(workbook, `template_areas_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("Tải template thành công!");
  };

  return {
    importModal,
    isConfirmLoading,
    setImportModal,
    handleOpenImportModal,
    handleImportModalClose,
    handleFileChange,
    handleConfirmImport,
    handleDownloadTemplate,
  };
};