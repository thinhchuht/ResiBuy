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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "../../api/base.api";
import { useNavigate, useParams } from "react-router-dom";
import { Slider } from "@mui/material";

interface ProductDetail {
  id: number;
  price: number;
  weight: number;
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
  status: string; // "true" hoặc "false" dạng chuỗi
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
    const min = priceRange[0];
    const max = priceRange[1];
    fetchProducts(
      searchInput,
      isNaN(min) ? undefined : min,
      isNaN(max) ? undefined : max,
      selectedCategory
    );
  };

  const handleEdit = (id: number) => {
    navigate(`/store/${storeId}/update/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      await axios.put(`/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
    }
  };

  const handleCreate = () => {
    navigate(`/store/${storeId}/create`);
  };

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5">Quản lý sản phẩm</Typography>
        <Button variant="contained" color="primary" onClick={handleCreate}>
          Thêm sản phẩm
        </Button>
      </Box>

      {/* Bộ lọc */}
      <Box component="form" onSubmit={handleFilterSubmit} mb={3}>
        <Box
          display="flex"
          flexWrap="wrap"
          gap={2}
          justifyContent="space-between"
        >
          <TextField
            sx={{ flex: 1, minWidth: "220px" }}
            placeholder="Tìm kiếm sản phẩm..."
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

          <Box sx={{ minWidth: "300px", flex: 1 }}>
            <Typography gutterBottom>Khoảng giá (₫)</Typography>
            <Slider
              value={priceRange}
              min={0}
              max={10000000}
              step={10000}
              onChange={(e, newValue) => setPriceRange(newValue as number[])}
              valueLabelDisplay="auto"
            />
            <Box display="flex" gap={2} mt={1}>
              <TextField
                label="Giá từ"
                type="number"
                value={priceRange[0]}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10) || 0;
                  setPriceRange([value, Math.max(value, priceRange[1])]);
                }}
                sx={{ width: "140px" }}
              />
              <TextField
                label="Đến"
                type="number"
                value={priceRange[1]}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10) || 0;
                  setPriceRange([Math.min(value, priceRange[0]), value]);
                }}
                sx={{ width: "140px" }}
              />
            </Box>
          </Box>

          <FormControl sx={{ minWidth: "160px" }}>
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

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ height: "56px", whiteSpace: "nowrap" }}
          >
            Lọc
          </Button>
        </Box>
      </Box>

      {/* Bảng sản phẩm */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ảnh</TableCell>
                <TableCell>Tên sản phẩm</TableCell>
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
                    <TableRow key={product.id}>
                      <TableCell>
                        <Avatar
                          src={detail?.image?.thumbUrl || ""}
                          variant="rounded"
                        />
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        {detail?.price
                          ? detail.price.toLocaleString() + " ₫"
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Typography
                          color={!product.isOutOfStock ? "green" : "gray"}
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
                          onClick={() => handleDelete(product.id)}
                          color="error"
                        >
                          <DeleteIcon />
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
