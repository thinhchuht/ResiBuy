import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Stack,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Switch,
    Chip,
    Pagination,
    CircularProgress,
    Tooltip,
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
} from "@mui/icons-material";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../../api/base.api";
import { useToastify } from "../../../hooks/useToastify.ts";

interface Promotion {
    id: number;
    name: string;
    discount: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

interface GetPromotionDto {
    keyword?: string;
    isActive?: boolean | null;
    startDate?: string;
    endDate?: string;
    pageNumber: number;
    pageSize: number;
}

const PromotionListPage: React.FC = () => {
    const { storeId } = useParams<{ storeId: string }>();
    const navigate = useNavigate();
    const { error: showError, success: showSuccess } = useToastify();

    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    // Filter states
    const [filters, setFilters] = useState<GetPromotionDto>({
        keyword: "",
        isActive: null,
        startDate: "",
        endDate: "",
        pageNumber: 1,
        pageSize: 10,
    });

    // Temporary filter states for form inputs
    const [tempFilters, setTempFilters] = useState({
        keyword: "",
        isActive: null as boolean | null,
        startDate: "",
        endDate: "",
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    };

    const formatDateForAPI = (dateString: string) => {
        if (!dateString) return undefined;
        const date = new Date(dateString);
        return date.toISOString();
    };

    const loadPromotions = useCallback(async (searchFilters: GetPromotionDto) => {
        try {
            setLoading(true);
            const params: any = {
                pageNumber: searchFilters.pageNumber,
                pageSize: searchFilters.pageSize,
            };

            if (searchFilters.keyword?.trim()) {
                params.keyword = searchFilters.keyword.trim();
            }
            if (searchFilters.isActive !== null && searchFilters.isActive !== undefined) {
                params.isActive = searchFilters.isActive;
            }
            if (searchFilters.startDate) {
                params.startDate = formatDateForAPI(searchFilters.startDate);
            }
            if (searchFilters.endDate) {
                params.endDate = formatDateForAPI(searchFilters.endDate);
            }

            const response = await axios.get("/api/Promotion", { params });
            const data = response.data.data;

            setPromotions(data || []);
            // If API returns pagination info, use it. Otherwise calculate from current data
            setTotalCount(data?.length || 0);
        } catch (error: any) {
            console.error("Lỗi khi tải danh sách khuyến mãi:", error);
            showError(
                `Tải danh sách khuyến mãi thất bại: ${
                    error.response?.data?.message || "Đã có lỗi xảy ra"
                }`
            );
            setPromotions([]);
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        loadPromotions(filters);
    }, [ ]);

    const handleSearch = () => {
        const newFilters = {
            ...filters,
            keyword: tempFilters.keyword,
            isActive: tempFilters.isActive,
            startDate: tempFilters.startDate,
            endDate: tempFilters.endDate,
            pageNumber: 1, // Reset to first page when searching
        };
        setFilters(newFilters);
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            keyword: "",
            isActive: null,
            startDate: "",
            endDate: "",
        };
        setTempFilters(clearedFilters);
        setFilters({
            ...clearedFilters,
            pageNumber: 1,
            pageSize: filters.pageSize,
        });
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setFilters(prev => ({ ...prev, pageNumber: value }));
    };

    const handleStatusToggle = async (promotionId: number, currentStatus: boolean) => {
        try {
            const newStatus = !currentStatus;
            await axios.put("/api/Promotion/updatestatus", {
                id: promotionId,
                isActive: newStatus,
            });

            // Update local state
            setPromotions(prev =>
                prev.map(promotion =>
                    promotion.id === promotionId
                        ? { ...promotion, isActive: newStatus }
                        : promotion
                )
            );

            showSuccess(
                `${newStatus ? "Kích hoạt" : "Vô hiệu hóa"} khuyến mãi thành công`
            );
        } catch (error: any) {
            console.error("Lỗi khi cập nhật trạng thái khuyến mãi:", error);
            showError(
                `Cập nhật trạng thái thất bại: ${
                    error.response?.data?.message || "Đã có lỗi xảy ra"
                }`
            );
        }
    };

    const handleCreatePromotion = () => {
        navigate(`/admin/promotion-create`);
    };

    const handleEditPromotion = (promotionId: number) => {
        navigate(`/admin/promotion-update/${promotionId}`);
    };

    const isPromotionActive = (promotion: Promotion) => {
        const now = new Date();
        const startDate = new Date(promotion.startDate);
        const endDate = new Date(promotion.endDate);
        return promotion.isActive && now >= startDate && now <= endDate;
    };

    const getPromotionStatus = (promotion: Promotion) => {
        if (!promotion.isActive) {
            return { label: "Đã tắt", color: "default" as const };
        }

        const now = new Date();
        const startDate = new Date(promotion.startDate);
        const endDate = new Date(promotion.endDate);

        if (now < startDate) {
            return { label: "Chưa bắt đầu", color: "warning" as const };
        } else if (now > endDate) {
            return { label: "Đã kết thúc", color: "error" as const };
        } else {
            return { label: "Đang hoạt động", color: "success" as const };
        }
    };

    return (
        <Box p={4} sx={{ bgcolor: "white", minHeight: "100vh" }}>
            <Stack spacing={3}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4">Danh sách Khuyến mãi</Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreatePromotion}
                    >
                        Tạo khuyến mãi mới
                    </Button>
                </Box>

                {/* Filters */}
                <Card>
                    <CardContent>
                        <Stack spacing={2}>
                            <Typography variant="h6">Bộ lọc</Typography>
                            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                <TextField
                                    label="Tìm kiếm theo tên"
                                    value={tempFilters.keyword}
                                    onChange={(e) =>
                                        setTempFilters(prev => ({ ...prev, keyword: e.target.value }))
                                    }
                                    size="small"
                                    sx={{ minWidth: 200 }}
                                />

                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel>Trạng thái</InputLabel>
                                    <Select
                                        value={tempFilters.isActive ?? ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setTempFilters(prev => ({
                                                ...prev,
                                                isActive: value === "" ? null : value === "true",
                                            }));
                                        }}
                                        label="Trạng thái"
                                    >
                                        <MenuItem value="">Tất cả</MenuItem>
                                        <MenuItem value="true">Đang hoạt động</MenuItem>
                                        <MenuItem value="false">Đã tắt</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Từ ngày"
                                    type="date"
                                    value={tempFilters.startDate}
                                    onChange={(e) =>
                                        setTempFilters(prev => ({ ...prev, startDate: e.target.value }))
                                    }
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    sx={{ minWidth: 160 }}
                                />

                                <TextField
                                    label="Đến ngày"
                                    type="date"
                                    value={tempFilters.endDate}
                                    onChange={(e) =>
                                        setTempFilters(prev => ({ ...prev, endDate: e.target.value }))
                                    }
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    sx={{ minWidth: 160 }}
                                />
                            </Stack>

                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="contained"
                                    startIcon={<SearchIcon />}
                                    onClick={handleSearch}
                                >
                                    Tìm kiếm
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<ClearIcon />}
                                    onClick={handleClearFilters}
                                >
                                    Xóa bộ lọc
                                </Button>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent>
                        {loading ? (
                            <Box display="flex" justifyContent="center" p={4}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Tên khuyến mãi</TableCell>
                                                <TableCell align="center">Giảm giá (%)</TableCell>
                                                <TableCell align="center">Ngày bắt đầu</TableCell>
                                                <TableCell align="center">Ngày kết thúc</TableCell>
                                                <TableCell align="center">Trạng thái</TableCell>
                                                <TableCell align="center">Kích hoạt</TableCell>
                                                <TableCell align="center">Thao tác</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {promotions.length > 0 ? (
                                                promotions.map((promotion) => {
                                                    const status = getPromotionStatus(promotion);
                                                    return (
                                                        <TableRow key={promotion.id}>
                                                            <TableCell>
                                                                <Typography variant="body2" fontWeight="medium">
                                                                    {promotion.name}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <Typography variant="body2">
                                                                    {promotion.discount}%
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <Typography variant="body2">
                                                                    {formatDate(promotion.startDate)}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <Typography variant="body2">
                                                                    {formatDate(promotion.endDate)}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <Chip
                                                                    label={status.label}
                                                                    color={status.color}
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {promotion.id !== 1 ? (
                                                                    <Switch
                                                                        checked={promotion.isActive}
                                                                        onChange={() =>
                                                                            handleStatusToggle(promotion.id, promotion.isActive)
                                                                        }
                                                                        size="small"
                                                                    />
                                                                ) : (
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Không khả dụng
                                                                    </Typography>
                                                                )}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {promotion.id !== 1 ? (
                                                                    <Tooltip title="Chỉnh sửa">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleEditPromotion(promotion.id)}
                                                                        >
                                                                            <EditIcon />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                ) : (
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Không khả dụng
                                                                    </Typography>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={7} align="center">
                                                        <Typography variant="body2" color="text.secondary">
                                                            Không có khuyến mãi nào
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                {/* Pagination */}
                                {totalCount > filters.pageSize && (
                                    <Box display="flex" justifyContent="center" mt={3}>
                                        <Pagination
                                            count={Math.ceil(totalCount / filters.pageSize)}
                                            page={filters.pageNumber}
                                            onChange={handlePageChange}
                                            color="primary"
                                        />
                                    </Box>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </Stack>
        </Box>
    );
};

export default PromotionListPage;