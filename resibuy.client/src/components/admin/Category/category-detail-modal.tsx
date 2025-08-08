import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
} from "@mui/material";
import {
  Close,
  Edit,
  Delete,
  Inventory,
} from "@mui/icons-material";
import {
  formatCurrency,
  useCategoriesLogic,
} from "./seg/utlis";
import type { Category, Product } from "../../../types/models";
import { useNavigate } from "react-router-dom";

interface CategoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onEdit?: (category: Category) => void;
  onDelete?: (categoryId: string) => void;
}

export function CategoryDetailModal({
  isOpen,
  onClose,
  category,
  onEdit,
  onDelete,
}: CategoryDetailModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // Fetch sản phẩm và thống kê khi modal mở
  useEffect(() => {
    if (isOpen && category?.id) {
      console.log("Fetching data for category.id:", category.id);
      setLoadingStats(true);
      setLoadingProducts(true);
      setError(null);

      // Fetch products
      getProductsByCategoryId(category.id)
        .then((productsData) => {
          console.log("Products fetched:", productsData);
          setProducts(productsData);
        })
        .catch((err) => {
          console.error("Error fetching products:", err);
          setProducts([]);
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
  }, [isOpen, ]);

  if (!isOpen || !category || !category.id) {
    console.log("CategoryDetailModal not rendered due to:", { isOpen, category });
    return null;
  }

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
              <Box>
                <Typography
                  variant="h5"
                  sx={{ color: "success.main", fontWeight: "bold" }}
                >
                  {formatCurrency(totalRevenue)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "grey.500" }}
                >
                  Tổng Doanh Thu
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
            <Box sx={{ border: 1, borderColor: "grey.200", borderRadius: 2, overflow: "hidden" }}>
              <Table>
                <TableHead sx={{ bgcolor: "grey.50" }}>
                  <TableRow>
                    <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                      ID Sản Phẩm
                    </TableCell>
                    <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                      Tên
                    </TableCell>
                    <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                      Giá
                    </TableCell>
                    <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                      Trạng Thái
                    </TableCell>
                    <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                      Đã Bán
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ "& tr:hover": { bgcolor: "grey.50" } }}>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell sx={{ px: 2, py: 1.5, fontFamily: "monospace", fontSize: "0.875rem", color: "primary.main" }}>
                        {product.id}
                      </TableCell>
                      <TableCell
                        sx={{
                          px: 2,
                          py: 1.5,
                          fontSize: "0.875rem",
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
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                        {product.productDetails[0] ? formatCurrency(product.productDetails[0].price) : "N/A"}
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                        {product.productDetails[0]
                          ? product.productDetails[0].isOutOfStock
                            ? "Hết hàng"
                            : "Còn hàng"
                          : "N/A"}
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                        {product.productDetails[0] ? product.productDetails[0].sold : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
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