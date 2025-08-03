import { useEffect, useState } from "react";
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
} from "@mui/material";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";

type VoucherType = "Amount" | "Percentage";

interface Voucher {
  id: string;
  discountAmount: number;
  type: VoucherType;
  quantity: number;
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

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  const fetchVouchers = async () => {
    try {
      if (!storeId) {
        console.error("storeId is undefined");
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
      const response = await axios.get("/api/Voucher", { params });
      setVouchers(response.data.data.items || []);
      setTotalCount(response.data.data.totalCount || 0);
    } catch (error) {
      console.error("Failed to fetch vouchers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (voucher: Voucher) => {
    try {
      await axios.put("/api/Voucher/deactive", {
        id: voucher.id,
        storeId: storeId,
      });
      fetchVouchers();
    } catch (error) {
      console.error("Failed to deactive voucher", error);
    }
  };

  const handleCreate = () => {
    navigate(`/store/${storeId}/voucher-create`);
  };

  const handleUpdate = (id: string) => {
    navigate(`/store/${storeId}/voucher-update/${id}`);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  useEffect(() => {
    fetchVouchers();
  }, [page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box p={4}>
      <Card>
        <CardHeader
          title={<Typography variant="h5">Quản lý voucher</Typography>}
          action={
            <Button variant="contained" color="primary" onClick={handleCreate}>
              Thêm voucher
            </Button>
          }
        />
        <CardContent>
          {/* Bộ lọc */}
          <Stack spacing={2} direction="row" flexWrap="wrap" mb={3}>
            <TextField
              label="Loại voucher"
              select
              value={voucherType}
              onChange={(e) => setVoucherType(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="Amount">Giảm số tiền</MenuItem>
              <MenuItem value="Percentage">Giảm phần trăm</MenuItem>
            </TextField>

            <TextField
              label="Giá trị đơn tối thiểu"
              type="number"
              value={minOrderPrice}
              onChange={(e) => setMinOrderPrice(e.target.value)}
            />

            <TextField
              label="Từ ngày"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Đến ngày"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <Button variant="contained" onClick={fetchVouchers}>
              Lọc
            </Button>
          </Stack>

          {/* Bảng voucher */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Giảm</TableCell>
                  <TableCell>Tối thiểu</TableCell>
                  <TableCell>Giảm tối đa</TableCell>
                  <TableCell>Hiệu lực</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading
                  ? [...Array(rowsPerPage)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={8}>
                          <Skeleton height={32} />
                        </TableCell>
                      </TableRow>
                    ))
                  : vouchers.map((voucher) => (
                      <TableRow key={voucher.id}>
                        <TableCell>{voucher.id}</TableCell>
                        <TableCell>{voucher.type}</TableCell>
                        <TableCell>
                          {voucher.type === "Amount"
                            ? `${voucher.discountAmount}₫`
                            : `${voucher.discountAmount}%`}
                        </TableCell>
                        <TableCell>{voucher.minOrderPrice}₫</TableCell>
                        <TableCell>{voucher.maxDiscountPrice}₫</TableCell>
                        <TableCell>
                          {formatDate(voucher.startDate)} -{" "}
                          {formatDate(voucher.endDate)}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={voucher.isActive}
                            onChange={() => handleToggleStatus(voucher)}
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleUpdate(voucher.id)}
                          >
                            Cập nhật
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 20]}
            />
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VoucherPage;
