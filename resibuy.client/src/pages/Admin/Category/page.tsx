import { useState, useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import {
  Edit,
  Visibility,
  Category as CategoryIcon,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import { Chip } from "@mui/material";
import CustomTable from "../../../components/CustomTable";
import { AddCategoryModal } from "../../../components/admin/Category/add-category-model";
import { CategoryDetailModal } from "../../../components/admin/Category/category-detail-modal";
import {
  calculateCategoryStats,
  useCategoriesLogic,
} from "../../../components/admin/Category/seg/utlis";
import { StatsCard } from "../../../layouts/AdminLayout/components/StatsCard";

// Định nghĩa interface inline dựa trên dữ liệu API
interface Category {
  id: string;
  name: string;
  status: boolean;
  image?: {
    id: string;
    url: string;
    thumbUrl: string;
    name: string;
    categoryId: string;
  };
}

function CategoryStatsCards() {
  const [stats, setStats] = useState<{
    totalCategories: number;
    totalProducts: number;
    totalRevenue: number;
  }>({ totalCategories: 0, totalProducts: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    calculateCategoryStats()
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        console.error("Error in calculateCategoryStats:", err);
        setError(err.message || "Lỗi khi tải thống kê");
        setStats({ totalCategories: 0, totalProducts: 0, totalRevenue: 0 });
        setLoading(false);
      });
  }, []);

  const cards = [
    {
      title: "Tổng Danh Mục",
      value: stats.totalCategories.toString(),
      icon: CategoryIcon,
      iconColor: "#1976d2",
      iconBgColor: "#e3f2fd",
      valueColor: "#1976d2",
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
      {loading && <Typography>Đang tải thống kê...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      {!loading && !error && (
        cards.map((card, index) => (
          <StatsCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            iconColor={card.iconColor}
            iconBgColor={card.iconBgColor}
            valueColor={card.valueColor}
          />
        ))
      )}
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

  // Lấy danh sách danh mục
  useEffect(() => {
    console.log("Categories in useEffect:", categories);
    setLoading(true);
    setError(null);
    try {
      if (!categories || categories.length === 0) {
        setError("Không tìm thấy danh mục nào");
        setFetchedCategories([]);
        setTotalCount(0);
      } else {
        const start = (pageNumber - 1) * pageSize;
        const end = pageNumber * pageSize;
        const slicedCategories = categories.slice(start, end);
        console.log("Fetched categories:", slicedCategories);
        setFetchedCategories(slicedCategories);
        setTotalCount(categories.length);
      }
      setLoading(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      console.error("Error in CategoriesPage useEffect:", err);
      setError(`Lỗi khi xử lý danh sách danh mục: ${errorMessage}`);
      setFetchedCategories([]);
      setTotalCount(0);
      setLoading(false);
    }
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
            {category.image?.thumbUrl && category.image.thumbUrl !== "string" ? (
              <img
                src={category.image.thumbUrl}
                alt={category.image.name || "Category Image"}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)",
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
            )}
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
      key: "status" as keyof Category,
      label: "Trạng thái",
      sortable: true,
      render: (category: Category) => (
        <Chip
          icon={
            category.status ? (
              <CheckCircle fontSize="small" />
            ) : (
              <Cancel fontSize="small" />
            )
          }
          label={category.status ? "Hoạt động" : "Không hoạt động"}
          color={category.status ? "success" : "error"}
          variant="outlined"
          size="small"
          sx={{
            fontWeight: 'medium',
            '& .MuiChip-icon': {
              color: category.status ? 'success.main' : 'error.main',
            },
            borderColor: category.status ? 'success.main' : 'error.main',
            color: category.status ? 'success.dark' : 'error.dark',
          }}
        />
      ),
    },
    
    {
      key: "actions" as keyof Category,
      label: "Hành Động",
      render: (category: Category) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            onClick={() => handleViewCategory(category.id)}
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

        {loading && <Typography>Đang tải danh sách danh mục...</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        {!loading && !error && fetchedCategories.length === 0 && (
          <Typography>Không tìm thấy danh mục nào</Typography>
        )}

        <CategoryStatsCards />

        <CustomTable
          data={fetchedCategories}
          totalCount={totalCount}
          columns={columns}
          onAddItem={handleAddCategory}
          onExport={handleExportCategories}
          onPageChange={setPageNumber}
          headerTitle="Tất Cả Danh Mục"
          description="Quản lý danh mục"
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