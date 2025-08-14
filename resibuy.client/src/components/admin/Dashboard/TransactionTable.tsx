import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { FilterList, ArrowDropDown } from "@mui/icons-material";
import { formatCurrency } from "./seg/utils";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
interface Transaction {
  date: string;
  totalOrderAmount: number;
  orderCount: number;
  productQuantity: number;
  uniqueBuyers: number;
}

interface TransactionsTableProps {
  startTime: string;
  endTime: string;
  apiData: Transaction[];
}

export function TransactionsTable({ startTime, endTime, apiData }: TransactionsTableProps) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Tính toán phân trang
  const totalRows = apiData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startRow = (page - 1) * rowsPerPage;
  const endRow = Math.min(startRow + rowsPerPage, totalRows);
  const paginatedData = apiData.slice(startRow, endRow);

  // Xử lý thay đổi số hàng mỗi trang
  const handleRowsPerPageChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(1); // Reset về trang 1 khi thay đổi rowsPerPage
  };

  // Xử lý chuyển trang
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 1,
        border: "1px solid",
        borderColor: "grey.200",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          p: 3,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ color: "text.primary", fontWeight: "medium" }}
            >
              Dữ liệu từng ngày
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "grey.600", mt: 0.5 }}
            >
              Danh sách thống kê dữ liệu theo ngày
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            
            <TextField
              placeholder="Từ"
              size="small"
              value={startTime}
              onChange={(e) => {}}
              disabled
              sx={{ width: 128 }}
            />
            <TextField
              placeholder="Đến"
              size="small"
              value={endTime}
              onChange={(e) => {}}
              disabled
              sx={{ width: 128 }}
            />
          </Box>
        </Box>
      </Box>
      <Box sx={{ p: 3, color: "text.primary" }}>
        {apiData.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
            Chưa có dữ liệu
          </Typography>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 400, overflowY: "auto" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "medium", bgcolor: "grey.100" }}>
                      Ngày
                    </TableCell>
                    <TableCell sx={{ fontWeight: "medium", bgcolor: "grey.100" }}>
                      Tổng Tiền Đơn Hàng
                    </TableCell>
                    <TableCell sx={{ fontWeight: "medium", bgcolor: "grey.100" }}>
                      Số Đơn Hàng
                    </TableCell>
                    <TableCell sx={{ fontWeight: "medium", bgcolor: "grey.100" }}>
                      Số Sản Phẩm bán
                    </TableCell>
                    <TableCell sx={{ fontWeight: "medium", bgcolor: "grey.100" }}>
                      Số Khách Hàng
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((transaction: Transaction, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{formatCurrency(transaction.totalOrderAmount)}</TableCell>
                      <TableCell>{transaction.orderCount}</TableCell>
                      <TableCell>{transaction.productQuantity}</TableCell>
                      <TableCell>{transaction.uniqueBuyers}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Hiển thị {startRow + 1} - {endRow} của {totalRows}
                </Typography>
                <FormControl size="small">
                  <InputLabel>Hàng mỗi trang</InputLabel>
                  <Select
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                    label="Hàng mỗi trang"
                    sx={{ minWidth: 80 }}
                  >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </Select>
                </FormControl>
              </Box>
             <Box sx={{ display: "flex", gap: 1 }}>
  <Button
    variant="outlined"
    size="small"
    onClick={handlePreviousPage}
    disabled={page === 1}
    sx={{ borderRadius: 1 }}
  >
    <ArrowBack fontSize="small" />
  </Button>
  <Button
    variant="outlined"
    size="small"
    onClick={handleNextPage}
    disabled={page === totalPages}
    sx={{ borderRadius: 1 }}
  >
    <ArrowForward fontSize="small" />
  </Button>
</Box>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
}