import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Close,
  Edit,
  Inventory,
} from "@mui/icons-material";
import {
  formatCurrency,
  useCategoriesLogic,
} from "./seg/utlis";
import type { Category, Product } from "../../../types/models";
import { useNavigate } from "react-router-dom";
import CustomTable from "../../../components/CustomTable";

interface CategoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onEdit?: (category: Category) => void;
}

export function CategoryDetailModal({
  isOpen,
  onClose,
  category,
  onEdit,
}: CategoryDetailModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const {
    getProductsByCategoryId,
    countProductsByCategoryId,
    calculateCategoryRevenue,
  } = useCategoriesLogic();
  const navigate = useNavigate();

  // Log props để debug
  useEffect(() => {
    console.log("CategoryDetailModal props:", { isOpen, category });
  }, [isOpen, category]);

  // Fetch sản phẩm và thống kê khi modal mở hoặc pageNumber thay đổi
  useEffect(() => {
    if (isOpen && category?.id) {
      console.log("Fetching data for category.id:", category.id, "pageNumber:", pageNumber);
      setLoadingStats(true);
      setLoadingProducts(true);
      setError(null);

      // Fetch products với phân trang
      getProductsByCategoryId(category.id, pageNumber, pageSize)
        .then((response) => {
          console.log("Products fetched:", response);
          setProducts(response.items);
          setTotalCount(response.totalCount);
          setTotalPages(response.totalPages);
        })
        .catch((err) => {
          console.error("Error fetching products:", err);
          setProducts([]);
          setTotalCount(0);
          setTotalPages(1);
          setError("Lỗi khi tải danh sách sản phẩm");
        })
        .finally(() => {
          setLoadingProducts(false);
        });

      // Fetch stats
      Promise.all([
        countProductsByCategoryId(category.id),
        calculateCategoryRevenue(category.id),
      ])
        .then(([productsCount, revenue]) => {
          console.log("Stats fetched:", { productsCount, revenue });
          setTotalProducts(Number(productsCount) || 0);
          setTotalRevenue(Number(revenue) || 0);
        })
        .catch((err) => {
          console.error("Error fetching category stats:", err);
          setError("Lỗi khi tải thống kê danh mục");
          setTotalProducts(0);
          setTotalRevenue(0);
        })
        .finally(() => {
          setLoadingStats(false);
        });
    }
  }, [isOpen, category, pageNumber, pageSize]);

  if (!isOpen || !category || !category.id) {
    console.log("CategoryDetailModal not rendered due to:", { isOpen, category });
    return null;
  }

  const columns = [
    {
      key: "id" as keyof Product,
      label: "ID Sản Phẩm",
      sortable: true,
      render: (product: Product) => (
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            fontWeight: "medium",
            color: "primary.main",
          }}
        >
          {product.id}
        </Typography>
      ),
    },
    {
      key: "name" as keyof Product,
      label: "Tên",
      sortable: true,
      render: (product: Product) => (
        <Typography
          variant="body2"
          sx={{
            color: "primary.main",
            cursor: "pointer",
            textDecoration: "none",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              backgroundImage: "linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            },
          }}
          onClick={() => navigate(`/products?id=${product.id}`)}
        >
          {product.name}
        </Typography>
      ),
    },
    {
      key: "price" as keyof Product,
      label: "Giá",
      sortable: true,
      render: (product: Product) => (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {product.productDetails[0] ? formatCurrency(product.productDetails[0].price) : "N/A"}
        </Typography>
      ),
    },
    {
      key: "isOutOfStock" as keyof Product,
      label: "Trạng Thái",
      sortable: true,
      render: (product: Product) => (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {product.productDetails[0]
            ? product.productDetails[0].isOutOfStock
              ? "Hết hàng"
              : "Còn hàng"
            : "N/A"}
        </Typography>
      ),

    },
     {
      key: "sold",
      label: "Đã bán",
      render: (row) => (
        <Typography sx={{ fontSize: "0.875rem", color: "grey.900" }}>
          {row.productDetails?.[0] ? (row.sold) : "N/A"}
        </Typography>
      ),
    },
  ];

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          maxWidth: "80rem",
          height: "90vh",
          margin: 0,
          borderRadius: 0,
          boxShadow: 24,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease-in-out",
          display: "flex",
          flexDirection: "column",
        },
      }}
      PaperProps={{ sx: { bgcolor: "background.paper" } }}
    >
      <DialogTitle
        sx={{
          p: 3,
          borderBottom: 1,
          borderColor: "grey.200",
          bgcolor: "background.paper",
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ color: "grey.900", fontWeight: "medium" }}
          >
            Chi Tiết Danh Mục
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "grey.500" }}
          >
            ID Danh Mục: {category.id}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {onEdit && (
            <Button
              onClick={() => onEdit(category)}
              startIcon={<Edit sx={{ fontSize: 16 }} />}
              sx={{
                px: 1.5,
                py: 1,
                bgcolor: "primary.main",
                color: "white",
                borderRadius: 2,
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              Sửa
            </Button>
          )}
          <IconButton
            onClick={onClose}
            sx={{
              color: "grey.400",
              bgcolor: "background.paper",
              p: 1,
              borderRadius: 2,
              "&:hover": {
                color: "grey.600",
                bgcolor: "grey.100",
              },
            }}
          >
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 3,
          bgcolor: "grey.50",
          borderBottom: 1,
          borderColor: "grey.200",
          flex: "0 0 auto",
        }}
      >
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        {loadingStats ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
            <Box sx={{ width: 80, height: 80 }}>
              {category.image?.url ? (
                <img
                  src={category.image.thumbUrl || category.image.url}
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
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "1.5rem",
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
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h5"
                sx={{ color: "grey.900", fontWeight: "bold", mb: 1 }}
              >
                {category.name}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                textAlign: "left",
              }}
            >
              <Box>
                <Typography
                  variant="h5"
                  sx={{ color: "primary.main", fontWeight: "bold" }}
                >
                  {totalProducts}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "grey.500" }}
                >
                  Tổng Sản Phẩm
                </Typography>
              </Box>
             
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogContent
        sx={{
          p: 3,
          flex: 1,
          overflowY: "auto",
          minHeight: "300px",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ color: "grey.900", mb: 2 }}>
            Sản Phẩm ({totalProducts} sản phẩm)
          </Typography>
          {loadingProducts ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : products.length > 0 ? (
            <CustomTable
              data={products}
              totalCount={totalCount}
              columns={columns}
              onPageChange={(page) => setPageNumber(page)}
              headerTitle=""
              description=""
              showExport={false}
              showBulkActions={false}
              itemsPerPage={pageSize}
              showSearch={false}
            />
          ) : (
            <Box sx={{ textAlign: "center", py: 4, color: "grey.500" }}>
              <Inventory sx={{ fontSize: 48, color: "grey.300", mb: 2 }} />
              <Typography>Không tìm thấy sản phẩm cho danh mục này</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}