import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Card,
  CardHeader,
  CardContent,
  Slider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "../../api/base.api";
import { useNavigate, useParams } from "react-router-dom";

interface ProductDetail {
  id: number;
  price: number;
  weight: number;
  quantity: number;
  isOutOfStock: boolean;
  sold: number;
  image?: {
    url: string;
    thumbUrl: string;
  };
  additionalData: {
    id: number;
    key: string;
    value: string;
  }[];
}

interface Product {
  id: number;
  name: string;
  describe: string;
  storeId: string;
  categoryId: string;
  isOutOfStock: boolean;
  discount: number;
  sold: number;
  productDetails: ProductDetail[];
}

interface Category {
  id: string;
  name: string;
  status: string;
  image: {
    id: string;
    url: string;
    thumbUrl: string;
    name: string;
    categoryId: string;
  };
}

const ProductPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchInput, setSearchInput] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000000]);

  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

  const fetchProducts = async (
    searchText = "",
    minPrice?: number,
    maxPrice?: number,
    categoryId?: string
  ) => {
    setLoading(true);
    try {
      const response = await axios.get("/api/Product/products", {
        params: {
          StoreId: storeId,
          Search: searchText || undefined,
          MinPrice: minPrice || undefined,
          MaxPrice: maxPrice || undefined,
          CategoryId: categoryId || undefined,
          PageNumber: 1,
          PageSize: 20,
        },
      });
      setProducts(response.data.items || []);
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/Category/categories");
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Không thể tải danh mục:", err);
    }
  };

  useEffect(() => {
    if (storeId) {
      fetchProducts();
      fetchCategories();
    }
  }, [storeId]);

  const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchProducts(searchInput, priceRange[0], priceRange[1], selectedCategory);
  };

  const handleEdit = (id: number) => {
    navigate(`/store/${storeId}/update/${id}`);
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus = !product.isOutOfStock;
    const confirmMsg = newStatus
      ? "Bạn có chắc muốn dừng bán sản phẩm này?"
      : "Bạn có chắc muốn mở bán lại sản phẩm này?";
    if (!window.confirm(confirmMsg)) return;

    try {
      await axios.patch(`/api/Product/${product.id}/status`, newStatus, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, isOutOfStock: newStatus } : p
        )
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái sản phẩm:", error);
    }
  };

  const handleCreate = () => {
    navigate(`/store/${storeId}/product-create`);
  };

  return (
    <Box p={3}>
      <Card>
        <CardHeader
          title={<Typography variant="h5">Quản lý sản phẩm</Typography>}
          action={
            <Button variant="contained" color="primary" onClick={handleCreate}>
              Thêm sản phẩm
            </Button>
          }
        />
        <CardContent>
          <Box
            component="form"
            onSubmit={handleFilterSubmit}
            mb={3}
            display="flex"
            flexDirection="column"
            gap={3}
          >
            <Box display="grid" gridTemplateColumns="1fr 1fr 1fr auto" gap={2}>
              <TextField
                placeholder="Tìm kiếm sản phẩm..."
                label="Tìm kiếm"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Danh mục"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box display="flex" gap={2}>
                <TextField
                  label="Giá từ"
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10) || 0;
                    setPriceRange([value, Math.max(value, priceRange[1])]);
                  }}
                />
                <TextField
                  label="Đến"
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10) || 0;
                    setPriceRange([Math.min(value, priceRange[0]), value]);
                  }}
                />
              </Box>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ height: "56px", whiteSpace: "nowrap" }}
              >
                Lọc sản phẩm
              </Button>
            </Box>

            <Box>
              <Typography gutterBottom>Khoảng giá (₫)</Typography>
              <Slider
                value={priceRange}
                min={0}
                max={10000000}
                step={10000}
                onChange={(e, newValue) => setPriceRange(newValue as number[])}
                valueLabelDisplay="auto"
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ảnh</TableCell>
                <TableCell>Tên sản phẩm</TableCell>
                <TableCell>Phân loại</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Không có sản phẩm nào
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const detail = product.productDetails?.[0];
                  return (
                    <TableRow
                      key={product.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#f9f9f9",
                        },
                      }}
                    >
                      <TableCell>
                        <Avatar
                          src={detail?.image?.thumbUrl || ""}
                          variant="rounded"
                          sx={{ width: 56, height: 56 }}
                        />
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        {
                          categories.find((c) => c.id === product.categoryId)
                            ?.name
                        }
                      </TableCell>
                      <TableCell>
                        {detail?.price
                          ? detail.price.toLocaleString() + " ₫"
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 500,
                            color: !product.isOutOfStock
                              ? "success.main"
                              : "text.secondary",
                          }}
                        >
                          {!product.isOutOfStock ? "Đang bán" : "Tạm hết"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleEdit(product.id)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleToggleStatus(product)}
                          color={product.isOutOfStock ? "success" : "error"}
                        >
                          {product.isOutOfStock ? (
                            <CheckCircleIcon />
                          ) : (
                            <DeleteIcon />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ProductPage;
