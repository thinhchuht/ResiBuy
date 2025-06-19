import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import {
  Close,
  Category as CategoryIcon,
  Inventory,
  Edit,
  Delete,
} from "@mui/icons-material";
import {
  formatCurrency,
  useCategoriesLogic,
} from "./seg/utlis";
import type { Category } from "../../../types/models";

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
  const [activeTab, setActiveTab] = useState<"overview" | "products">("overview");
  const {
    countProductsByCategoryId,
    countSoldProductsByCategoryId,
    calculateCategoryRevenue,
  } = useCategoriesLogic();

  if (!isOpen || !category) return null;

  const totalProducts = countProductsByCategoryId(category.id);
  const totalSoldProducts = countSoldProductsByCategoryId(category.id);
  const totalRevenue = calculateCategoryRevenue(category.id);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          maxWidth: "80rem",
          height: "90vh", // Giới hạn chiều cao modal
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
          {onDelete && (
            <Button
              onClick={() => onDelete(category.id)}
              startIcon={<Delete sx={{ fontSize: 16 }} />}
              sx={{
                px: 1.5,
                py: 1,
                bgcolor: "error.main",
                color: "white",
                borderRadius: 2,
                "&:hover": { bgcolor: "error.dark" },
              }}
            >
              Xóa
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
          flex: "0 0 auto", // Không cho phép phần tóm tắt mở rộng
        }}
      >
        {/* Category Summary */}
        <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
          <Box sx={{ width: 80, height: 80 }}>
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
      </DialogContent>

      {/* Tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "grey.200",
          position: "sticky",
          top: 0,
          zIndex: 9,
          bgcolor: "background.paper",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ "& .MuiTabs-indicator": { bgcolor: "primary.main" } }}
        >
          {[
            { id: "overview", label: "Tổng Quan", icon: <CategoryIcon sx={{ fontSize: 16 }} /> },
            { id: "products", label: "Sản Phẩm", icon: <Inventory sx={{ fontSize: 16 }} /> },
          ].map((tab) => (
            <Tab
              key={tab.id}
              value={tab.id}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {tab.icon}
                  {tab.label}
                </Box>
              }
              sx={{
                px: 3,
                py: 2,
                fontSize: "0.875rem",
                fontWeight: "medium",
                color: activeTab === tab.id ? "primary.main" : "grey.500",
                "&:hover": { color: "grey.700" },
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <DialogContent
        sx={{
          p: 3,
          flex: 1,
          overflowY: "auto",
          minHeight: "300px", // Đảm bảo chiều cao tối thiểu
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {activeTab === "overview" && (
          <Box>
            <Typography
              variant="h6"
              sx={{ color: "grey.900", mb: 2 }}
            >
              Thông Tin Danh Mục
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 3,
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: "grey.500", fontWeight: "medium" }}
                >
                  Tổng Sản Phẩm Đã Bán
                </Typography>
                <Typography sx={{ color: "grey.900" }}>
                  {totalSoldProducts}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: "grey.500", fontWeight: "medium" }}
                >
                  Giá Trị Sản Phẩm Trung Bình
                </Typography>
                <Typography sx={{ color: "grey.900" }}>
                  {totalProducts > 0 ? formatCurrency(totalRevenue / totalProducts) : "0 VNĐ"}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {activeTab === "products" && (
          <Box>
            <Typography
              variant="h6"
              sx={{ color: "grey.900", mb: 2 }}
            >
              Sản Phẩm ({totalProducts} sản phẩm)
            </Typography>
            {category.products.length > 0 ? (
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
                        Số Lượng
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                        Đã Bán
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody sx={{ "& tr:hover": { bgcolor: "grey.50" } }}>
                    {category.products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell sx={{ px: 2, py: 1.5, fontFamily: "monospace", fontSize: "0.875rem", color: "primary.main" }}>
                          {product.id}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                          {product.name}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                          {formatCurrency(product.price)}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                          {product.quantity}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                          {product.sold}
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
        )}
      </DialogContent>
    </Dialog>
  );
}