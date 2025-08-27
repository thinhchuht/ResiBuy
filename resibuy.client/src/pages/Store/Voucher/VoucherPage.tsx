import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "../../../api/base.api";
import {
  Box,
  TextField,
  Typography,
  MenuItem,
  Button,
  Card,
  CardContent,
  Stack,
  CardHeader,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  TablePagination,
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { Edit as EditIcon, Refresh as RefreshIcon, FilterAlt as FilterIcon, Clear as ClearIcon } from "@mui/icons-material";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";

type VoucherType = "Amount" | "Percentage";
type VoucherStatus = "active" | "inactive" | "expired" | "upcoming";

interface Voucher {
  id: string;
  code?: string;
  name?: string;
  discountAmount: number;
  type: VoucherType;
  quantity: number;
  usedQuantity?: number;
  minOrderPrice: number;
  maxDiscountPrice: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface VoucherQueryParams {
  storeId: string;
  pageNumber: number;
  pageSize: number;
  Type?: "Amount" | "Percentage";
  MinOrderPrice?: number | string;
  StartDate?: string;
  EndDate?: string;
}

const VoucherPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [voucherType, setVoucherType] = useState("");
  const [minOrderPrice, setMinOrderPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    voucher: Voucher | null;
  }>({ open: false, voucher: null });

  // Hàm lấy trạng thái voucher
  const getVoucherStatus = (voucher: Voucher): VoucherStatus => {
    const now = new Date();
    const start = new Date(voucher.startDate);
    const end = new Date(voucher.endDate);

    if (!voucher.isActive) return "inactive";
    if (now < start) return "upcoming";
    if (now > end) return "expired";
    return "active";
  };

  // Màu sắc cho trạng thái
  const getStatusColor = (status: VoucherStatus) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "default";
      case "expired":
        return "error";
      case "upcoming":
        return "info";
      default:
        return "default";
    }
  };

  // Nhãn cho trạng thái
  const getStatusLabel = (status: VoucherStatus) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "inactive":
        return "Tạm dừng";
      case "expired":
        return "Đã hết hạn";
      case "upcoming":
        return "Sắp diễn ra";
      default:
        return "Không xác định";
    }
  };

  const fetchVouchers = useCallback(async () => {
    try {
      if (!storeId) {
        setError("Không tìm thấy ID cửa hàng");
        return;
      }

      const params: VoucherQueryParams = {
        storeId,
        pageNumber: page + 1,
        pageSize: rowsPerPage,
      };

      if (voucherType) {
        params.Type = voucherType as "Amount" | "Percentage";
      }
      if (minOrderPrice) {
        params.MinOrderPrice = minOrderPrice;
      }
      if (startDate) {
        params.StartDate = new Date(startDate).toISOString();
      }
      if (endDate) {
        params.EndDate = new Date(endDate).toISOString();
      }

      setLoading(true);
      setError(null);

      const response = await axios.get("/api/Voucher", { params });
      setVouchers(response.data.data.items || []);
      setTotalCount(response.data.data.totalCount || 0);
    } catch (error: any) {
      console.error("Failed to fetch vouchers", error);
      setError("Không thể tải danh sách voucher. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [storeId, page, rowsPerPage, voucherType, minOrderPrice, startDate, endDate]);

  const handleToggleStatus = async (voucher: Voucher) => {
    try {
      setError(null);
      await axios.put("/api/Voucher/deactive", {
        id: voucher.id,
        storeId: storeId,
      });
      setSuccess(`Đã ${voucher.isActive ? "tạm dừng" : "kích hoạt"} voucher thành công`);
      await fetchVouchers();
    } catch (error: any) {
      console.error("Failed to toggle voucher status", error);
      setError("Không thể thay đổi trạng thái voucher. Vui lòng thử lại.");
    }
  };

  const handleDelete = async (voucher: Voucher) => {
    try {
      setError(null);
      await axios.delete(`/api/Voucher/${voucher.id}`, {
        params: { storeId },
      });
      setSuccess("Đã xóa voucher thành công");
      await fetchVouchers();
      setDeleteDialog({ open: false, voucher: null });
    } catch (error: any) {
      console.error("Failed to delete voucher", error);
      setError("Không thể xóa voucher. Vui lòng thử lại.");
    }
  };

  const handleCreate = () => {
    navigate(`/store/${storeId}/voucher-create`);
  };

  const handleUpdate = (id: string) => {
    navigate(`/store/${storeId}/voucher-update/${id}`);
  };

  const handleClearFilters = () => {
    setVoucherType("");
    setMinOrderPrice("");
    setStartDate("");
    setEndDate("");
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Kiểm tra xem có filter nào được áp dụng không
  const hasActiveFilters = useMemo(() => {
    return !!(voucherType || minOrderPrice || startDate || endDate);
  }, [voucherType, minOrderPrice, startDate, endDate]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box p={4}>
      <Card elevation={3}>
        <CardHeader
          title={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h5" color="primary">
                Quản lý voucher
              </Typography>
              <Chip label={`${totalCount} voucher`} size="small" color="primary" variant="outlined" />
            </Stack>
          }
          action={
            <Stack direction="row" spacing={1}>
              <Tooltip title="Làm mới">
                <IconButton onClick={fetchVouchers} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button variant="contained" color="primary" onClick={handleCreate} size="large">
                Thêm voucher
              </Button>
            </Stack>
          }
        />
        <CardContent>
          {/* Bộ lọc */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <FilterIcon color="action" />
                <Typography variant="h6" color="text.secondary">
                  Bộ lọc
                </Typography>
                {hasActiveFilters && <Chip label="Đã áp dụng" size="small" color="primary" variant="filled" />}
              </Stack>

              <Stack spacing={2} direction="row" flexWrap="wrap">
                <TextField label="Loại voucher" select value={voucherType} onChange={(e) => setVoucherType(e.target.value)} sx={{ minWidth: 180 }} size="small">
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="Amount">Giảm số tiền</MenuItem>
                  <MenuItem value="Percentage">Giảm phần trăm</MenuItem>
                </TextField>

                <TextField
                  label="Giá trị đơn tối thiểu"
                  type="number"
                  value={minOrderPrice}
                  onChange={(e) => setMinOrderPrice(e.target.value)}
                  size="small"
                  InputProps={{
                    endAdornment: "₫",
                  }}
                />

                <TextField label="Từ ngày" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />

                <TextField label="Đến ngày" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
              </Stack>

              <Stack direction="row" spacing={1} mt={2}>
                <Button variant="contained" onClick={fetchVouchers} disabled={loading} startIcon={<FilterIcon />}>
                  Áp dụng bộ lọc
                </Button>
                {hasActiveFilters && (
                  <Button variant="outlined" onClick={handleClearFilters} startIcon={<ClearIcon />}>
                    Xóa bộ lọc
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Hiển thị lỗi */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Bảng voucher */}
          <TableContainer component={Paper} elevation={2}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Mã voucher</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Tên</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Loại</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Giảm giá</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Đơn tối thiểu</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Giảm tối đa</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Số lượng</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Thời gian</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Trạng thái</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Thao tác</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [...Array(rowsPerPage)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={10}>
                        <Skeleton height={60} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : vouchers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      <Typography color="text.secondary" sx={{ py: 4 }}>
                        {hasActiveFilters ? "Không tìm thấy voucher nào phù hợp với bộ lọc" : "Chưa có voucher nào. Hãy tạo voucher đầu tiên!"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  vouchers.map((voucher) => {
                    const status = getVoucherStatus(voucher);
                    return (
                      <TableRow key={voucher.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {voucher.code || voucher.id.slice(0, 8)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{voucher.name || "Voucher giảm giá"}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={voucher.type === "Amount" ? "Số tiền" : "Phần trăm"}
                            size="small"
                            color={voucher.type === "Amount" ? "primary" : "secondary"}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {voucher.type === "Amount" ? formatCurrency(voucher.discountAmount) : `${voucher.discountAmount}%`}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatCurrency(voucher.minOrderPrice)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{voucher.type === "Amount" ? "N/A" : formatCurrency(voucher.maxDiscountPrice)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="column" spacing={0.5}>
                            <Typography variant="body2">
                              {voucher.usedQuantity || 0}/{voucher.quantity}
                            </Typography>
                            <Box
                              sx={{
                                width: 50,
                                height: 4,
                                bgcolor: "grey.200",
                                borderRadius: 1,
                              }}>
                              <Box
                                sx={{
                                  width: `${((voucher.usedQuantity || 0) / voucher.quantity) * 100}%`,
                                  height: "100%",
                                  bgcolor: "primary.main",
                                  borderRadius: 1,
                                }}
                              />
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(voucher.startDate)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(voucher.endDate)}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={1} alignItems="flex-start">
                            <Chip label={getStatusLabel(status)} size="small" color={getStatusColor(status)} variant="filled" />
                            <Switch checked={voucher.isActive} onChange={() => handleToggleStatus(voucher)} color="primary" size="small" />
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="Chỉnh sửa">
                              <IconButton size="small" onClick={() => handleUpdate(voucher.id)} color="primary">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton size="small" onClick={() => setDeleteDialog({ open: true, voucher })} color="error" disabled={status === "active"}></IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 20, 50]}
              labelRowsPerPage="Số hàng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} của ${count !== -1 ? count : `hơn ${to}`}`}
            />
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog xác nhận xóa */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, voucher: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Xác nhận xóa voucher</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa voucher <strong>{deleteDialog.voucher?.code || deleteDialog.voucher?.id.slice(0, 8)}</strong>? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, voucher: null })} color="inherit">
            Hủy
          </Button>
          <Button onClick={() => deleteDialog.voucher && handleDelete(deleteDialog.voucher)} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo thành công */}
      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)}>
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VoucherPage;
