import { useState } from "react";
import type { Category, Product } from "../../../../types/models";
import { fakeCategories } from "../../../../fakeData/fakeCategoryData";
import { fakeProducts } from "../../../../fakeData/fakeProductData";
import { useToastify } from "../../../../hooks/useToastify";

// Định nghĩa interface cho dữ liệu form danh mục
export interface CategoryFormData {
  name: string;
}

// Hook quản lý danh mục
export function useCategoriesLogic() {
  const [categories, setCategories] = useState<Category[]>(fakeCategories);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const toast = useToastify();

  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
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

  const handleSubmitCategory = (categoryData: Category) => {
    if (editingCategory) {
      // Cập nhật danh mục hiện tại
      setCategories((prev) =>
        prev.map((category) =>
          category.id === categoryData.id ? categoryData : category
        )
      );
      // Cập nhật selectedCategory nếu đang xem chi tiết
      if (selectedCategory && selectedCategory.id === categoryData.id) {
        setSelectedCategory(categoryData);
        toast.success("Cập nhật danh mục thành công!");
      }
    } else {
      // Thêm danh mục mới
      setCategories((prev) => [...prev, categoryData]);
      toast.success("Thêm danh mục mới thành công!");
    }
    setIsAddModalOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (
      confirm(
        "Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác."
      )
    ) {
      setCategories((prev) => prev.filter((category) => category.id !== categoryId));
      if (selectedCategory && selectedCategory.id === categoryId) {
        handleCloseDetailModal();
      }
      toast.success("Xóa danh mục thành công!");
    }
  };

  const handleExportCategories = () => {
    const headers = [
      "Category ID",
      "Name",
      "Total Products",
    ];
    const csvContent = [
      headers.join(","),
      ...categories.map((category) =>
        [
          category.id,
          `"${category.name}"`,
          category.products.length,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `categories_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Export danh sách danh mục thành công!");
  };

  // Hàm đếm số sản phẩm của một danh mục theo categoryId
  const countProductsByCategoryId = (categoryId: string): number => {
    const category = categories.find((category) => category.id === categoryId);
    return category ? category.products.length : 0;
  };

  // Hàm đếm tổng số sản phẩm đã bán của một danh mục
  const countSoldProductsByCategoryId = (categoryId: string): number => {
    const category = categories.find((category) => category.id === categoryId);
    if (!category) return 0;
    return category.products.reduce((sum, product) => sum + (product.sold || 0), 0);
  };

  // Hàm tính tổng doanh thu của một danh mục
  const calculateCategoryRevenue = (categoryId: string): number => {
    const category = categories.find((category) => category.id === categoryId);
    if (!category) return 0;
    return category.products.reduce(
      (sum, product) => sum + product.price * (product.sold || 0),
      0
    );
  };

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
    countSoldProductsByCategoryId,
    calculateCategoryRevenue,
  };
};

// Hook quản lý form danh mục
export const useCategoryForm = (editCategory?: Category | null) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: editCategory?.name || "",
  });

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (data: CategoryFormData) => {
    const errors: any = {};

    if (!data.name?.trim()) {
      errors.name = "Tên danh mục là bắt buộc";
    }

    return errors;
  };

  const handleSubmit = async (
    e: React.FormEvent,
    onSubmit: (data: Category) => void
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

    const categoryData: Category = {
      ...formData,
      id:
        editCategory?.id ||
        `CATEGORY-${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(3, "0")}`,
      products: editCategory?.products || [],
    };

    try {
      await onSubmit(categoryData);
    } catch (error) {
      console.error("Lỗi khi submit danh mục:", error);
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
export const calculateCategoryStats = (categories: Category[]) => {
  const totalCategories = categories.length;
  const totalProducts = categories.reduce(
    (sum, category) => sum + category.products.length,
    0
  );
  const totalRevenue = categories.reduce(
    (sum, category) =>
      sum +
      category.products.reduce(
        (productSum, product) => productSum + product.price * (product.sold || 0),
        0
      ),
    0
  );

 

  return {
    totalCategories,
    totalProducts,
    totalRevenue,

    
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