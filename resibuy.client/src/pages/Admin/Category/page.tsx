import { useState, useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import {
  Edit,
  Visibility,
  Inventory,
  Category as CategoryIcon,
  Delete,
} from "@mui/icons-material";
import CustomTable from "../../../components/CustomTable";
import { AddCategoryModal } from "../../../components/admin/Category/add-category-model";
import { CategoryDetailModal } from "../../../components/admin/Category/category-detail-modal";
import {
  calculateCategoryStats,
  formatCurrency,
  useCategoriesLogic,
} from "../../../components/admin/Category/seg/utlis";
import { StatsCard } from "../../../layouts/AdminLayout/components/StatsCard";
import type { Category } from "../../../types/models";

interface ApiResponse<T> {
  code: number;
  message: string;
  data: {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  };
}

function CategoryStatsCards({ categories }: { categories: Category[] }) {
  const stats = calculateCategoryStats(categories);

  const cards = [
    {
      title: "Tổng Danh Mục",
      value: stats.totalCategories.toString(),
      icon: CategoryIcon,
      iconColor: "#1976d2",
      iconBgColor: "#e3f2fd",
      valueColor: "#1976d2",
    },
    {
      title: "Tổng Sản Phẩm",
      value: stats.totalProducts.toLocaleString(),
      icon: Inventory,
      iconColor: "#d81b60",
      iconBgColor: "#fce4ec",
      valueColor: "#d81b60",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "1fr 1fr",
          lg: "1fr 1fr 1fr 1fr",
        },
        gap: 3,
        mb: 3,
      }}
    >
      {cards.map((card, index) => (
        <StatsCard
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          iconColor={card.iconColor}
          iconBgColor={card.iconBgColor}
          valueColor={card.valueColor}
        />
      ))}
    </Box>
  );
}

export default function CategoriesPage() {
  const {
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
  } = useCategoriesLogic();

  const [pageNumber, setPageNumber] = useState(1); // 1-based, khớp với API
  const [pageSize] = useState(15); // pageSize cố định
  const [totalCount, setTotalCount] = useState(0);
  const [fetchedCategories, setFetchedCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hàm giả lập gọi API
  const fetchCategories = async (pageNum: number, size: number) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching page ${pageNum}, size ${size}, total categories: ${categories.length}`);

      // Thay bằng API thực tế, ví dụ: axios.get('/api/categories')
      const response: ApiResponse<Category> = await new Promise((resolve) => {
        setTimeout(() => {
          const start = (pageNum - 1) * size;
          const end = pageNum * size;
          const items = categories.slice(start, end);
          console.log(`Sliced items: start=${start}, end=${end}, items=`, items);

          const fakeResponse: ApiResponse<Category> = {
            code: 0,
            message: "Thành công",
            data: {
              items,
              totalCount: categories.length,
              pageNumber: pageNum,
              pageSize: size,
              totalPages: Math.ceil(categories.length / size),
            },
          };
          resolve(fakeResponse);
        }, 500);
      });

      if (response.code === 0) {
        console.log("API response:", response.data);
        setFetchedCategories(response.data.items);
        setTotalCount(response.data.totalCount);
      } else {
        setError(response.message);
        setFetchedCategories([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Lỗi khi gọi API");
      setFetchedCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi pageNumber thay đổi
  useEffect(() => {
    fetchCategories(pageNumber, pageSize);
  }, [pageNumber, pageSize, categories]);

  const columns = [
    {
      key: "id" as keyof Category,
      label: "ID Danh Mục",
      sortable: true,
      render: (category: Category) => (
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            fontWeight: "medium",
            color: "primary.main",
          }}
        >
          {category.id}
        </Typography>
      ),
    },
    {
      key: "name" as keyof Category,
      label: "Danh Mục",
      sortable: true,
      render: (category: Category) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box sx={{ width: 40, height: 40, mr: 1.5 }}>
            <Box
              sx={{
                width: "100%",
                height: "100%",
                bgcolor: "linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "0.875rem",
                fontWeight: "bold",
              }}
            >
              {category.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </Box>
          </Box>
          <Typography
            variant="body2"
            sx={{ fontWeight: "medium", color: "grey.900" }}
          >
            {category.name}
          </Typography>
        </Box>
      ),
    },
    {
      key: "products" as keyof Category,
      label: "Sản Phẩm",
      sortable: true,
      render: (category: Category) => (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {category.products.length}
        </Typography>
      ),
    },
    {
      key: "totalRevenue" as keyof Category,
      label: "Tổng Doanh Thu",
      sortable: true,
      render: (category: Category) => (
        <Typography
          variant="body2"
          sx={{ fontWeight: "medium", color: "grey.900" }}
        >
          {formatCurrency(
            category.products.reduce(
              (sum, product) => sum + product.price * (product.sold || 0),
              0
            )
          )}
        </Typography>
      ),
    },
    {
      key: "actions" as keyof Category,
      label: "Hành Động",
      render: (category: Category) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            onClick={() => {
              handleViewCategory(category);
              console.log("Category data:", category);
            }}
            sx={{
              color: "primary.main",
              p: 0.5,
              bgcolor: "background.paper",
              borderRadius: 1,
              "&:hover": {
                color: "primary.dark",
                bgcolor: "blue[50]",
              },
            }}
            title="Xem Chi Tiết"
          >
            <Visibility sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            onClick={() => handleEditCategory(category)}
            sx={{
              color: "success.main",
              p: 0.5,
              bgcolor: "background.paper",
              borderRadius: 1,
              "&:hover": {
                color: "success.dark",
                bgcolor: "green[50]",
              },
            }}
            title="Sửa Danh Mục"
          >
            <Edit sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteCategory(category.id)}
            sx={{
              color: "error.main",
              p: 0.5,
              bgcolor: "background.paper",
              borderRadius: 1,
              "&:hover": {
                color: "error.dark",
                bgcolor: "red[50]",
              },
            }}
            title="Xóa Danh Mục"
          >
            <Delete sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: (theme) => theme.palette.grey[50],
      }}
    >
      <Box
        component="header"
        sx={{
          display: "flex",
          height: 64,
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          px: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={(theme) => ({
            color: theme.palette.grey[700],
            fontWeight: theme.typography.fontWeightMedium,
          })}
        >
          Quản Lý Danh Mục
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Box>
          <Typography
            variant="body2"
            sx={(theme) => ({
              color: theme.palette.grey[600],
            })}
          >
            Quản lý danh mục và sản phẩm
          </Typography>
        </Box>

        {loading && <Typography>Đang tải...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        <CategoryStatsCards categories={fetchedCategories} />

        <CustomTable
          data={fetchedCategories}
          totalCount={totalCount}
          columns={columns}
          onAddItem={handleAddCategory}
          onExport={handleExportCategories}
          onPageChange={setPageNumber}
          headerTitle="Tất Cả Danh Mục"
          description="Quản lý danh mục và sản phẩm"
          showExport={true}
          showBulkActions={false}
          itemsPerPage={pageSize}
        />
      </Box>

      <CategoryDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        category={selectedCategory}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
      />

      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleSubmitCategory}
        editCategory={editingCategory}
      />
    </Box>
  );
}