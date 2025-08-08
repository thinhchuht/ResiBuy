import { useState, useEffect, useCallback } from "react";
import categoryApi from "../../../../api/category.api";
import productApi from "../../../../api/product.api";
import { useToastify } from "../../../../hooks/useToastify";
import type { CategoryImage, CreateCategoryDto, UpdateCategoryDto } from "../../../../types/dtoModels";


export interface Category {
  id: string;
  name: string;
  status: string;
  image: CategoryImage & { categoryId?: string };
}


export interface CategoryFormData {
  name: string;
  status?: string; // Thêm status vào form
  image?: CategoryImage;
}


export function useCategoriesLogic() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const  toast  = useToastify();


  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryApi.getAll();
      console.log("API response in fetchCategories:", response);
      if (response?.code === 0 && Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        throw new Error(response?.message || "Dữ liệu danh mục không hợp lệ");
      }
    } catch (err: any) {
      console.error("Fetch categories error:", err);
      toast.error(err.message || "Lỗi khi lấy danh sách danh mục");
      setCategories([]);
    }
  }, [toast]);

  // Gọi API khi component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleViewCategory = async (categoryId: string) => {
    if (!categoryId) {
      console.error("handleViewCategory: Invalid categoryId", categoryId);
      toast.error("ID danh mục không hợp lệ");
      return;
    }
    try {
      const response = await categoryApi.getById(categoryId);
      console.log("View category response:", response);
      if (response?.code === 0 && response.data?.id) {
        setSelectedCategory(response.data);
        setIsDetailModalOpen(true);
        console.log("setIsDetailModalOpen(true) called, selectedCategory:", response.data);
      } else {
        throw new Error("Danh mục không hợp lệ");
      }
    } catch (err: any) {
      console.error("View category error:", err);
      toast.error(err.message || "Lỗi khi lấy chi tiết danh mục");
    }
  };

  const handleCloseDetailModal = () => {
    console.log("handleCloseDetailModal called, isDetailModalOpen:", false);
    setIsDetailModalOpen(false);
    setSelectedCategory(null);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsAddModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmitCategory = async (categoryData: CategoryFormData) => {
    try {
      if (editingCategory) {
        const updateData: UpdateCategoryDto = {
          id: editingCategory.id,
          name: categoryData.name,
          status: categoryData.status || editingCategory.status || "active",
          image: categoryData.image || editingCategory.image || { id: "", url: "", thumbUrl: "", name: "" },
        };
        console.log("Calling categoryApi.update with:", updateData);
        await categoryApi.update(updateData);
        console.log("Update successful");
        await fetchCategories();
      } else {
        const createData: CreateCategoryDto = {
          name: categoryData.name,
          status: categoryData.status || "", // Sử dụng status từ form, mặc định là "active"
          image: categoryData.image || { id: "", url: "", thumbUrl: "", name: "" },
        };
        console.log("Calling categoryApi.create with:", createData);
        await categoryApi.create(createData);
        console.log("Create successful");
        await fetchCategories();
      }
      setIsAddModalOpen(false);
      setEditingCategory(null);
    } catch (err: any) {
      console.error("Submit category error:", err);
      toast.error(err.message || "Lỗi khi lưu danh mục");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!categoryId) {
      toast.error("ID danh mục không hợp lệ");
      return;
    }
    if (
      confirm(
        "Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác."
      )
    ) {
      try {
        await categoryApi.delete(categoryId);
        console.log("Delete successful for category:", categoryId);
        await fetchCategories();
        if (selectedCategory && selectedCategory.id === categoryId) {
          handleCloseDetailModal();
        }
        toast.success("Xóa danh mục thành công!");
      } catch (err: any) {
        console.error("Delete category error:", err);
        toast.error(err.message || "Lỗi khi xóa danh mục");
      }
    }
  };

  const handleExportCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      const categories = response?.code === 0 ? response.data : [];
      console.log("Export categories:", categories);
      const headers = ["Category ID", "Name", "Total Products"];
      const csvContent = [
        headers.join(","),
        ...(await Promise.all(
          categories.map(async (category: Category) => {
            const totalProducts = await countProductsByCategoryId(category.id);
            return [category.id, `"${category.name}"`, totalProducts].join(",");
          })
        )),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `categories_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Export danh sách danh mục thành công!");
    } catch (err: any) {
      console.error("Export categories error:", err);
      toast.error(err.message || "Lỗi khi xuất danh sách danh mục");
    }
  };


  const countProductsByCategoryId = useCallback(async (categoryId: string): Promise<number> => {
    if (!categoryId) {
      console.error("countProductsByCategoryId: Invalid categoryId", categoryId);
      return 0;
    }
    try {
      const response = await categoryApi.countProductsByCategoryId(categoryId);
      console.log(`Count products for ${categoryId} - Full response:`, response);
      console.log(`Count products for ${categoryId}:`, response.data.count);
      return Number(response.data.count) || 0; // Lấy response.data.count
    } catch (err: any) {
      console.error(`Count products error for ${categoryId}:`, err);
      toast.error(err.message || "Lỗi khi đếm sản phẩm theo danh mục");
      return 0;
    }
  }, [toast]);
 const getProductsByCategoryId = useCallback(async (categoryId) => {
    try {
      const response = await productApi.getAll({ categoryId, pageNumber: 1, pageSize: 100 });
      return response.items || [];
    } catch (err) {
      toast.error(err.message || "Lỗi khi lấy danh sách sản phẩm");
      return [];
    }
  }, [toast]);

  const countSoldProductsByCategoryId = useCallback(async (categoryId: string): Promise<number> => {
    if (!categoryId) {
      console.error("countSoldProductsByCategoryId: Invalid categoryId", categoryId);
      return 0;
    }
    try {
    
      return 0;
    } catch (err: any) {
      console.error(`Count sold products error for ${categoryId}:`, err);
      toast.error(err.message || "Lỗi khi đếm sản phẩm đã bán theo danh mục");
      return 0;
    }
  }, [toast]);

  const calculateCategoryRevenue = useCallback(async (categoryId: string): Promise<number> => {
    if (!categoryId) {
      console.error("calculateCategoryRevenue: Invalid categoryId", categoryId);
      return 0;
    }
    try {

      return 0;
    } catch (err: any) {
      console.error(`Calculate revenue error for ${categoryId}:`, err);
      toast.error(err.message || "Lỗi khi tính doanh thu theo danh mục");
      return 0;
    }
  }, [toast]);

  return {
    categories,
    selectedCategory,
    isDetailModalOpen,
    isAddModalOpen,
    editingCategory,
    handleViewCategory,
    handleCloseDetailModal,
    handleAddCategory,
    handleEditCategory,
    handleCloseAddModal,
    handleSubmitCategory,
    handleDeleteCategory,
    handleExportCategories,
    countProductsByCategoryId,
    getProductsByCategoryId,
    countSoldProductsByCategoryId,
    calculateCategoryRevenue,
    fetchCategories,
  };
};


export const useCategoryForm = (editCategory?: Category | null) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: editCategory?.name || "",
    status: editCategory?.status || "active",
    image: editCategory?.image || undefined,
  });

  const [errors, setErrors] = useState<Partial<CategoryFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const  toast  = useToastify();

  useEffect(() => {
    if (editCategory) {
      setFormData({
        name: editCategory.name || "",
        status: editCategory.status || "active",
        image: editCategory.image || undefined,
      });
    } else {
      setFormData({
        name: "",
        status: "active",
        image: undefined,
      });
    }
  }, [editCategory]);

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (data: CategoryFormData) => {
    const errors: Partial<CategoryFormData> = {};

    if (!data.name?.trim()) {
      errors.name = "Tên danh mục là bắt buộc";
    }
    if (!data.status?.trim()) {
      errors.status = "Trạng thái là bắt buộc";
    }

    return errors;
  };

  const handleSubmit = async (
    e: React.FormEvent,
    onSubmit: (data: CategoryFormData) => void
  ) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    console.log("useCategoryForm handleSubmit called with:", formData);
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      console.log("Validation errors:", validationErrors);
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(formData);
      toast.success(editCategory ? "Cập nhật danh mục thành công!" : "Thêm danh mục mới thành công!");
    } catch (error: any) {
      console.error("Submit form error:", error);
      toast.error("Lỗi khi submit danh mục");
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

// Hàm tính thống kê danh mục
export const calculateCategoryStats = async () => {
  try {
    const response = await categoryApi.countAll();
    const count = response?.data?.count ?? 0;
    return {
      totalCategories: count,
      totalProducts: 0,
      totalRevenue: 0,
    };
  } catch (err: any) {
    console.error("Error in calculateCategoryStats:", err);
    return {
      totalCategories: 0,
      totalProducts: 0,
      totalRevenue: 0,
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