import { useState, useEffect, useCallback } from "react";
import categoryApi from "../../../../api/category.api";
import productApi from "../../../../api/product.api";
import { useToastify } from "../../../../hooks/useToastify";
import type { CategoryImage, CreateCategoryDto, UpdateCategoryDto } from "../../../../types/dtoModels";

export interface Category {
  id: string;
  name: string;
  status: boolean;
  image?: CategoryImage & { categoryId?: string };
}

export interface CategoryFormData {
  name: string;
  status?: boolean;
  image?: CategoryImage;
}

export function useCategoriesLogic() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const toast = useToastify();

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryApi.getAll();
      console.log("API response in fetchCategories:", response);
      if (response?.code === 0 && Array.isArray(response.data)) {
        const updatedCategories = response.data.map((category: Category) => ({
          ...category,
          image: category && category.image
            ? {
                ...category.image,
                thumbUrl: category.image.thumbUrl
                  ? `${category.image.thumbUrl}?t=${Date.now()}`
                  : category.image.thumbUrl,
                url: category.image.url
                  ? `${category.image.url}?t=${Date.now()}`
                  : category.image.url,
              }
            : { id: "", url: "", thumbUrl: "", name: "" },
        }));
        setCategories(updatedCategories);
      } else {
        throw new Error(response?.message || "Dữ liệu danh mục không hợp lệ");
      }
    } catch (err: any) {
      console.error("Fetch categories error:", err);
      toast.error(err.message || "Lỗi khi lấy danh sách danh mục");
      setCategories([]);
    }
  }, [toast]);

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
        const updatedCategory = {
          ...response.data,
          image: response.data && response.data.image
            ? {
                ...response.data.image,
                thumbUrl: response.data.image.thumbUrl
                  ? `${response.data.image.thumbUrl}?t=${Date.now()}`
                  : response.data.image.thumbUrl,
                url: response.data.image.url
                  ? `${response.data.image.url}?t=${Date.now()}`
                  : response.data.image.url,
              }
            : { id: "", url: "", thumbUrl: "", name: "" },
        };
        setSelectedCategory(updatedCategory);
        setIsDetailModalOpen(true);
        console.log("setIsDetailModalOpen(true) called, selectedCategory:", updatedCategory);
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
    setEditingCategory({
      ...category,
      image: category && category.image
        ? {
            ...category.image,
            thumbUrl: category.image.thumbUrl
              ? `${category.image.thumbUrl}?t=${Date.now()}`
              : category.image.thumbUrl,
            url: category.image.url
              ? `${category.image.url}?t=${Date.now()}`
              : category.image.url,
          }
        : { id: "", url: "", thumbUrl: "", name: "" },
    });
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
          status: categoryData.status !== undefined ? categoryData.status : true,
          image: categoryData.image || editingCategory.image || { id: "", url: "", thumbUrl: "", name: "" },
        };
        console.log("Calling categoryApi.update with:", updateData);
        const response = await categoryApi.update(updateData);
        console.log("Update response:", response);
        if (response?.code !== 0) {
          throw new Error(response?.message || "Lỗi khi cập nhật danh mục");
        }
        // Cập nhật trực tiếp categories để phản ánh thay đổi ngay lập tức
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === editingCategory.id
              ? {
                  ...cat,
                  name: updateData.name,
                  status: updateData.status,
                  image: updateData.image
                    ? {
                        ...updateData.image,
                        thumbUrl: updateData.image.thumbUrl
                          ? `${updateData.image.thumbUrl}?t=${Date.now()}`
                          : updateData.image.thumbUrl,
                        url: updateData.image.url
                          ? `${updateData.image.url}?t=${Date.now()}`
                          : updateData.image.url,
                      }
                    : updateData.image,
                }
              : cat
          )
        );
        // Update selectedCategory if it's the one being edited
        if (selectedCategory && selectedCategory.id === editingCategory.id) {
          setSelectedCategory({
            ...selectedCategory,
            name: updateData.name,
            status: updateData.status,
            image: updateData.image
              ? {
                  ...updateData.image,
                  thumbUrl: updateData.image.thumbUrl
                    ? `${updateData.image.thumbUrl}?t=${Date.now()}`
                    : updateData.image.thumbUrl,
                  url: updateData.image.url
                    ? `${updateData.image.url}?t=${Date.now()}`
                    : updateData.image.url,
                }
              : updateData.image,
          });
        }
        toast.success("Cập nhật danh mục thành công!");
      } else {
        const createData: CreateCategoryDto = {
          name: categoryData.name,
          status: categoryData.status !== undefined ? categoryData.status : true,
          image: categoryData.image || { id: "", url: "", thumbUrl: "", name: "" },
        };
        console.log("Calling categoryApi.create with:", createData);
        const response = await categoryApi.create(createData);
        console.log("Create response:", response);
        if (response?.code !== 0) {
          throw new Error(response?.message || "Lỗi khi tạo danh mục");
        }
        // Thêm danh mục mới vào categories
        setCategories((prev) => [
          ...prev,
          {
            ...response.data,
            image: response.data && response.data.image
              ? {
                  ...response.data.image,
                  thumbUrl: response.data.image.thumbUrl
                    ? `${response.data.image.thumbUrl}?t=${Date.now()}`
                    : response.data.image.thumbUrl,
                  url: response.data.image.url
                    ? `${response.data.image.url}?t=${Date.now()}`
                    : response.data.image.url,
                }
              : { id: "", url: "", thumbUrl: "", name: "" },
          },
        ]);
        toast.success("Thêm danh mục mới thành công!");
      }
      await fetchCategories();
      setIsAddModalOpen(false);
      setEditingCategory(null);
    } catch (err: any) {
      console.error("Submit category error:", err);
      toast.error(err.message || "Lỗi khi lưu danh mục");
    }
  };

  const handleExportCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      const categories = response?.code === 0 ? response.data : [];
      console.log("Export categories:", categories);
      const headers = ["ID", "Tên", "Tổng sản phẩm"];
      const csvContent = [
        headers.join(","),
        ...(await Promise.all(
          categories.map(async (category: Category) => {
            const totalProducts = await countProductsByCategoryId(category.id);
            return [category.id, `"${category.name}"`, totalProducts].join(",");
          })
        )),
      ].join("\n");

      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
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
      return Number(response.data.count) || 0;
    } catch (err: any) {
      console.error(`Count products error for ${categoryId}:`, err);
      toast.error(err.message || "Lỗi khi đếm sản phẩm theo danh mục");
      return 0;
    }
  }, [toast]);

  const getProductsByCategoryId = useCallback(async (categoryId: string, pageNumber: number, pageSize: number) => {
    if (!categoryId) {
      console.error("getProductsByCategoryId: Invalid categoryId", categoryId);
      return { items: [], totalCount: 0, totalPages: 0 };
    }
    try {
      const response = await productApi.getAll({ categoryId, pageNumber, pageSize });
      console.log(`Products for ${categoryId}:`, response);
      return {
        items: response.items || [],
        totalCount: response.totalCount || 0,
        totalPages: response.totalPages || 1,
      };
    } catch (err: any) {
      console.error(`Get products error for ${categoryId}:`, err);
      toast.error(err.message || "Lỗi khi lấy danh sách sản phẩm");
      return { items: [], totalCount: 0, totalPages: 0 };
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
    handleExportCategories,
    countProductsByCategoryId,
    getProductsByCategoryId,
    countSoldProductsByCategoryId,
    calculateCategoryRevenue,
    fetchCategories,
  };
}

export const useCategoryForm = (editCategory?: Category | null) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: editCategory?.name || "",
    status: editCategory?.status ?? true,
    image: editCategory?.image || undefined,
  });

  const [errors, setErrors] = useState<Partial<CategoryFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToastify();

  useEffect(() => {
    if (editCategory) {
      setFormData({
        name: editCategory.name || "",
        status: editCategory.status ?? true,
        image: editCategory.image || undefined,
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
    const errors: Record<string, string> = {};

    if (!data.name?.trim()) {
      errors.name = "Tên danh mục là bắt buộc";
    }
    
    if (data.status === undefined || data.status === null) {
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
      setFormData({
        name: "",
        status: true,
        image: undefined,
      });
      setErrors({});
    } catch (error: any) {
      console.error("Submit form error:", error);
      toast.error(error.message || "Lỗi khi submit danh mục");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      status: true,
      image: undefined,
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

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};