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
    Chip,
    Tooltip,
    Badge,
    Collapse,
    Divider,
    Alert,
} from "@mui/material";
import {
    Search as SearchIcon,
    Edit as EditIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Add as AddIcon,
    FilterList as FilterListIcon,
    Tune,
    Inventory as InventoryIcon,
    AttachMoney as MoneyIcon,
    Category as CategoryIcon,
    ExpandMore,
    ExpandLess,
    Warning as WarningIcon,
} from "@mui/icons-material";
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
    const [showFilters, setShowFilters] = useState<boolean>(false);

    const [searchInput, setSearchInput] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [minPriceInput, setMinPriceInput] = useState<string>("");
    const [maxPriceInput, setMaxPriceInput] = useState<string>("");

    // Validation states
    const [minPriceError, setMinPriceError] = useState<string>("");
    const [maxPriceError, setMaxPriceError] = useState<string>("");

    const { storeId } = useParams<{ storeId: string }>();
    const navigate = useNavigate();

    // Giới hạn giá tối đa
    const MAX_PRICE_LIMIT = 10000000000;

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

    const validatePriceInput = (value: string, type: 'min' | 'max'): string => {
        if (!value) return "";

        const numValue = Number(value);

        if (numValue < 0) {
            return `Giá ${type === 'min' ? 'tối thiểu' : 'tối đa'} không được âm`;
        }

        if (numValue > MAX_PRICE_LIMIT) {
            return `Giá ${type === 'min' ? 'tối thiểu' : 'tối đa'} không được vượt quá ${formatPrice(MAX_PRICE_LIMIT)}`;
        }

        return "";
    };

    const validatePriceRange = (): string => {
        if (!minPriceInput || !maxPriceInput) return "";

        const minPrice = Number(minPriceInput);
        const maxPrice = Number(maxPriceInput);

        if (minPrice > maxPrice) {
            return "Giá tối thiểu không thể lớn hơn giá tối đa";
        }

        return "";
    };

    const handlePriceInputChange = (value: string, type: 'min' | 'max') => {
        // Chỉ cho phép nhập số
        const numericValue = value.replace(/[^0-9]/g, '');

        if (type === 'min') {
            setMinPriceInput(numericValue);
            setMinPriceError(validatePriceInput(numericValue, 'min'));
        } else {
            setMaxPriceInput(numericValue);
            setMaxPriceError(validatePriceInput(numericValue, 'max'));
        }
    };

    const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate giá trước khi submit
        const minError = validatePriceInput(minPriceInput, 'min');
        const maxError = validatePriceInput(maxPriceInput, 'max');
        const rangeError = validatePriceRange();

        setMinPriceError(minError);
        setMaxPriceError(maxError);

        // Kiểm tra lỗi validation
        if (minError || maxError || rangeError) {
            if (rangeError) {
                alert(rangeError);
            }
            return;
        }

        const minPrice = minPriceInput ? Number(minPriceInput) : undefined;
        const maxPrice = maxPriceInput ? Number(maxPriceInput) : undefined;

        fetchProducts(searchInput, minPrice, maxPrice, selectedCategory);
    };

    const clearFilters = () => {
        setSearchInput("");
        setSelectedCategory("");
        setMinPriceInput("");
        setMaxPriceInput("");
        setMinPriceError("");
        setMaxPriceError("");
        fetchProducts();
    };

    const handleEdit = (id: number) => {
        navigate(`/store/${storeId}/product-update/${id}`);
    };

    const handleDetail = (id: number) => {
        navigate(`/store/${storeId}/product-detail/${id}`);
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

    const getActiveFiltersCount = () => {
        let count = 0;
        if (searchInput) count++;
        if (selectedCategory) count++;
        if (minPriceInput || maxPriceInput) count++;
        return count;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const formatPriceShort = (price: number) => {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)}M`;
        } else if (price >= 1000) {
            return `${(price / 1000).toFixed(0)}K`;
        }
        return price.toString();
    };

    const hasValidationErrors = () => {
        return !!(minPriceError || maxPriceError || validatePriceRange());
    };

    return (
        <Box sx={{ p: 3, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
            {/* Header Section */}
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    mb: 3,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    borderRadius: 3,
                }}
            >
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    gap={2}
                >
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            📦 Quản lý sản phẩm
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            Quản lý toàn bộ sản phẩm trong cửa hàng của bạn
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreate}
                        sx={{
                            backgroundColor: "rgba(255,255,255,0.2)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255,255,255,0.3)",
                            color: "white",
                            fontWeight: 600,
                            px: 3,
                            py: 1.5,
                            borderRadius: 2,
                            "&:hover": {
                                backgroundColor: "rgba(255,255,255,0.3)",
                            },
                        }}
                    >
                        Thêm sản phẩm
                    </Button>
                </Box>
            </Paper>

            {/* Stats Overview */}
            <Box
                sx={{
                    display: "flex",
                    gap: 3,
                    mb: 3,
                    flexWrap: "wrap",
                    "& > *": {
                        flex: {
                            xs: "1 1 100%",
                            sm: "1 1 calc(50% - 12px)",
                            md: "1 1 calc(33.333% - 16px)",
                        },
                        minWidth: { xs: "100%", sm: "300px" },
                    },
                }}
            >
                <Card sx={{ p: 2, borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box
                            sx={{
                                p: 2,
                                backgroundColor: "#e3f2fd",
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <InventoryIcon sx={{ color: "#1976d2", fontSize: 28 }} />
                        </Box>
                        <Box>
                            <Typography
                                variant="h5"
                                sx={{ fontWeight: 700, color: "#1976d2" }}
                            >
                                {products.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Tổng sản phẩm
                            </Typography>
                        </Box>
                    </Box>
                </Card>

                <Card sx={{ p: 2, borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box
                            sx={{
                                p: 2,
                                backgroundColor: "#e8f5e8",
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 28 }} />
                        </Box>
                        <Box>
                            <Typography
                                variant="h5"
                                sx={{ fontWeight: 700, color: "#4caf50" }}
                            >
                                {products.filter((p) => !p.isOutOfStock).length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Đang bán
                            </Typography>
                        </Box>
                    </Box>
                </Card>

                <Card sx={{ p: 2, borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box
                            sx={{
                                p: 2,
                                backgroundColor: "#ffebee",
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <CancelIcon sx={{ color: "#f44336", fontSize: 28 }} />
                        </Box>
                        <Box>
                            <Typography
                                variant="h5"
                                sx={{ fontWeight: 700, color: "#f44336" }}
                            >
                                {products.filter((p) => p.isOutOfStock).length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Tạm hết
                            </Typography>
                        </Box>
                    </Box>
                </Card>
            </Box>

            {/* Filter Section */}
            <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid #e2e8f0" }}>
                <CardHeader
                    title={
                        <Box display="flex" alignItems="center" gap={1}>
                            <Tune />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Bộ lọc tìm kiếm
                            </Typography>
                            {getActiveFiltersCount() > 0 && (
                                <Badge badgeContent={getActiveFiltersCount()} color="primary">
                                    <FilterListIcon />
                                </Badge>
                            )}
                        </Box>
                    }
                    action={
                        <Box display="flex" gap={1}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={clearFilters}
                                disabled={getActiveFiltersCount() === 0}
                            >
                                Xóa bộ lọc
                            </Button>
                            <IconButton onClick={() => setShowFilters(!showFilters)}>
                                {showFilters ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                        </Box>
                    }
                />

                <Collapse in={showFilters}>
                    <Divider />
                    <CardContent>
                        <Box
                            component="form"
                            onSubmit={handleFilterSubmit}
                            display="flex"
                            flexDirection="column"
                            gap={3}
                        >
                            {/* Search and Category Row */}
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 2,
                                    flexWrap: "wrap",
                                    alignItems: "end",
                                    "& > *:nth-of-type(1)": {
                                        flex: { xs: "1 1 100%", md: "1 1 50%" },
                                        minWidth: { xs: "100%", sm: "300px" },
                                    },
                                    "& > *:nth-of-type(2)": {
                                        flex: { xs: "1 1 100%", md: "1 1 33%" },
                                        minWidth: { xs: "100%", sm: "200px" },
                                    },
                                    "& > *:nth-of-type(3)": {
                                        flex: { xs: "1 1 100%", md: "1 1 auto" },
                                        minWidth: { xs: "100%", sm: "120px" },
                                    },
                                }}
                            >
                                <TextField
                                    fullWidth
                                    placeholder="Tìm kiếm sản phẩm..."
                                    label="Tìm kiếm"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                        },
                                    }}
                                />

                                <FormControl fullWidth>
                                    <InputLabel>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <CategoryIcon fontSize="small" />
                                            Danh mục
                                        </Box>
                                    </InputLabel>
                                    <Select
                                        value={selectedCategory}
                                        label="Danh mục"
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        <MenuItem value="">Tất cả danh mục</MenuItem>
                                        {categories.map((cat) => (
                                            <MenuItem key={cat.id} value={cat.id}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Avatar
                                                        src={cat.image?.thumbUrl}
                                                        sx={{ width: 24, height: 24 }}
                                                    />
                                                    {cat.name}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SearchIcon />}
                                    disabled={hasValidationErrors()}
                                    sx={{
                                        height: "56px",
                                        borderRadius: 2,
                                        fontWeight: 600,
                                        whiteSpace: "nowrap",
                                        px: 3,
                                    }}
                                >
                                    Tìm kiếm
                                </Button>
                            </Box>

                            {/* Price Range */}
                            <Box>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <MoneyIcon color="action" />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        Khoảng giá (tối đa {formatPriceShort(MAX_PRICE_LIMIT)})
                                    </Typography>
                                </Box>

                                {/* Alert for price limit */}
                                <Alert
                                    severity="info"
                                    sx={{ mb: 2, fontSize: "0.875rem" }}
                                    icon={<WarningIcon fontSize="small" />}
                                >
                                    <Typography variant="body2">
                                        • Chỉ nhập số, không âm và không vượt quá {formatPrice(MAX_PRICE_LIMIT)}
                                        <br />
                                        • Giá tối thiểu phải nhỏ hơn hoặc bằng giá tối đa
                                    </Typography>
                                </Alert>

                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 2,
                                        flexWrap: "wrap",
                                        "& > *": {
                                            flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)" },
                                            minWidth: { xs: "100%", sm: "200px" },
                                        },
                                    }}
                                >
                                    <TextField
                                        fullWidth
                                        label="Giá tối thiểu"
                                        placeholder="0"
                                        value={minPriceInput}
                                        onChange={(e) => handlePriceInputChange(e.target.value, 'min')}
                                        error={!!minPriceError}
                                        helperText={minPriceError || (minPriceInput ? `${formatPrice(Number(minPriceInput))}` : "")}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">₫</InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: 2,
                                            },
                                        }}
                                    />

                                    <TextField
                                        fullWidth
                                        label="Giá tối đa"
                                        placeholder="Không giới hạn"
                                        value={maxPriceInput}
                                        onChange={(e) => handlePriceInputChange(e.target.value, 'max')}
                                        error={!!maxPriceError}
                                        helperText={maxPriceError || (maxPriceInput ? `${formatPrice(Number(maxPriceInput))}` : "")}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">₫</InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: 2,
                                            },
                                        }}
                                    />
                                </Box>

                                {/* Price range preview */}
                                {(minPriceInput || maxPriceInput) && !hasValidationErrors() && (
                                    <Box mt={2}>
                                        <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                                            📊 Khoảng giá: {minPriceInput ? formatPrice(Number(minPriceInput)) : "Không giới hạn"}
                                            {" → "}
                                            {maxPriceInput ? formatPrice(Number(maxPriceInput)) : "Không giới hạn"}
                                        </Typography>
                                    </Box>
                                )}

                                {/* Validation error for price range */}
                                {validatePriceRange() && (
                                    <Alert severity="error" sx={{ mt: 2 }}>
                                        {validatePriceRange()}
                                    </Alert>
                                )}
                            </Box>
                        </Box>
                    </CardContent>
                </Collapse>
            </Card>

            {/* Products Table */}
            {loading ? (
                <Card sx={{ p: 6, textAlign: "center", borderRadius: 2 }}>
                    <CircularProgress size={48} />
                    <Typography variant="h6" sx={{ mt: 2, color: "text.secondary" }}>
                        Đang tải sản phẩm...
                    </Typography>
                </Card>
            ) : products.length === 0 ? (
                <Card sx={{ p: 6, textAlign: "center", borderRadius: 2 }}>
                    <Box sx={{ fontSize: "4rem", mb: 2, opacity: 0.3 }}>📦</Box>
                    <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                        Không có sản phẩm nào
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại
                    </Typography>
                    <Button variant="outlined" onClick={clearFilters}>
                        Xóa bộ lọc
                    </Button>
                </Card>
            ) : (
                <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                                    <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                                        Sản phẩm
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                                        Danh mục
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                                        Giá bán
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                                        Kho
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                                        Trạng thái
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{ fontWeight: 600, fontSize: "0.875rem" }}
                                    >
                                        Hành động
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.map((product) => {
                                    const detail = product.productDetails?.[0];
                                    const category = categories.find(
                                        (c) => c.id === product.categoryId
                                    );

                                    return (
                                        <TableRow
                                            key={product.id}
                                            sx={{
                                                "&:hover": {
                                                    backgroundColor: "#f8fafc",
                                                },
                                                borderBottom: "1px solid #e2e8f0",
                                            }}
                                        >
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Avatar
                                                        src={detail?.image?.thumbUrl || ""}
                                                        variant="rounded"
                                                        sx={{
                                                            width: 64,
                                                            height: 64,
                                                            border: "2px solid #e2e8f0",
                                                        }}
                                                    />
                                                    <Box>
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{
                                                                fontWeight: 600,
                                                                mb: 0.5,
                                                                maxWidth: 200,
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap",
                                                                cursor: "pointer",
                                                                "&:hover": {
                                                                    color: "primary.main",
                                                                    textDecoration: "underline",
                                                                },
                                                            }}
                                                            onClick={() => handleDetail(product.id)}
                                                        >
                                                            {product.name}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                                maxWidth: 200,
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >
                                                            {product.describe}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>

                                            <TableCell>
                                                {category ? (
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Avatar
                                                            src={category.image?.thumbUrl}
                                                            sx={{ width: 24, height: 24 }}
                                                        />
                                                        <Typography variant="body2">
                                                            {category.name}
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        Chưa phân loại
                                                    </Typography>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{ fontWeight: 600 }}
                                                >
                                                    {detail?.price ? formatPrice(detail.price) : "N/A"}
                                                </Typography>
                                                {product.discount > 0 && (
                                                    <Chip
                                                        label={`-${product.discount}%`}
                                                        size="small"
                                                        color="error"
                                                        sx={{ fontSize: "0.75rem", height: 20, mt: 0.5 }}
                                                    />
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color:
                                                            (detail?.quantity || 0) > 0
                                                                ? "success.main"
                                                                : "error.main",
                                                    }}
                                                >
                                                    {detail?.quantity || 0} sản phẩm
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    label={!product.isOutOfStock ? "Đang bán" : "Tạm hết"}
                                                    size="small"
                                                    color={!product.isOutOfStock ? "success" : "default"}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            </TableCell>

                                            <TableCell align="center">
                                                <Box display="flex" gap={1} justifyContent="center">
                                                    <Tooltip title="Chỉnh sửa">
                                                        <IconButton
                                                            onClick={() => handleEdit(product.id)}
                                                            sx={{
                                                                color: "primary.main",
                                                                "&:hover": { backgroundColor: "primary.50" },
                                                            }}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip
                                                        title={product.isOutOfStock ? "Mở bán" : "Dừng bán"}
                                                    >
                                                        <IconButton
                                                            onClick={() => handleToggleStatus(product)}
                                                            sx={{
                                                                color: product.isOutOfStock
                                                                    ? "success.main"
                                                                    : "error.main",
                                                                "&:hover": {
                                                                    backgroundColor: product.isOutOfStock
                                                                        ? "success.50"
                                                                        : "error.50",
                                                                },
                                                            }}
                                                        >
                                                            {product.isOutOfStock ? (
                                                                <VisibilityIcon />
                                                            ) : (
                                                                <VisibilityOffIcon />
                                                            )}
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            )}
        </Box>
    );
};

export default ProductPage;