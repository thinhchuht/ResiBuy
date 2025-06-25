import { Box, Paper, Typography, TextField, Button } from "@mui/material";
import { FilterList, ArrowDropDown } from "@mui/icons-material";
import {
  formatCurrency,
  getStatusBadgeConfig,
  getPaymentMethodIcon,
  getRecentTransactions,
} from "../../../components/admin/Dashboard/seg/utils";

import CustomTable from "../../CustomTable"; // Giả định CustomTable.tsx cùng thư mục

interface Transaction {
  id: string;
  customer: string;
  isRefund: boolean;
  date: string;
  amount: number;
  reference: string;
  paymentMethod: string;
  status: string;
}

export function TransactionsTable() {
  const transactions = getRecentTransactions();

  // Định nghĩa cột cho CustomTable
  const columns: ColumnDef<Transaction>[] = [
    {
      key: "id",
      label: "Giao Dịch",
      sortable: true,
      render: (order) => (
        <Typography variant="body2" sx={{ fontWeight: "medium" }}>
          {order.isRefund ? `Hoàn tiền đến ${order.id}` : `Thanh toán từ ${order.customer}`}
        </Typography>
      ),
    },
    {
      key: "date",
      label: "Ngày & Giờ",
      sortable: true,
      render: (order) => (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {order.date}
        </Typography>
      ),
    },
    {
      key: "amount",
      label: "Số Tiền",
      sortable: true,
      render: (order) => (
        <Typography
          variant="body2"
          sx={{ color: order.amount < 0 ? "error.main" : "text.primary" }}
        >
          {order.amount < 0 ? "-" : ""}
          {formatCurrency(Math.abs(order.amount))}
        </Typography>
      ),
    },
    {
      key: "reference",
      label: "Số Tham Chiếu",
      sortable: true,
      render: (order) => (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {order.reference}
        </Typography>
      ),
    },
    {
      key: "paymentMethod",
      label: "Phương Thức Thanh Toán",
      sortable: true,
      render: (order) => {
        const paymentIcon = getPaymentMethodIcon(order.paymentMethod);
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ color: paymentIcon.className?.includes("text-blue-500") ? "primary.main" : "text.primary" }}>
              {paymentIcon.text}
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              ••• {order.paymentMethod === "mastercard" ? "475" : "924"}
            </Typography>
          </Box>
        );
      },
    },
    {
      key: "status",
      label: "Trạng Thái",
      sortable: true,
      filterable: true,
      render: (order) => {
        const statusConfig = getStatusBadgeConfig(order.status);
        return (
          <Box
            sx={{
              display: "inline-flex",
              px: 1,
              py: 0.5,
              fontSize: "0.75rem",
              fontWeight: "medium",
              borderRadius: 1,
              bgcolor: statusConfig.className?.includes("bg-green-100")
                ? "success.light"
                : statusConfig.className?.includes("bg-red-100")
                ? "error.light"
                : "grey.100",
              color: statusConfig.className?.includes("text-green-800")
                ? "success.dark"
                : statusConfig.className?.includes("text-red-800")
                ? "error.dark"
                : "grey.800",
            }}
          >
            {statusConfig.label}
          </Box>
        );
      },
    },
  ];

  // Định nghĩa bộ lọc trạng thái
  const filters = {
    status: [
      { label: "Thành Công", value: "success" },
      { label: "Thất Bại", value: "failed" },
      { label: "Đang Xử Lý", value: "pending" },
    ],
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
          p: 3, // Thay p-6
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
              sx={{ color: "text.primary", fontWeight: "medium" }} // Thay text-lg font-semibold
            >
              Giao Dịch
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "grey.600", mt: 0.5 }} // Thay text-sm text-gray-600
            >
              Danh sách các giao dịch mới nhất
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              endIcon={<ArrowDropDown />}
              sx={{
                px: 2, // Thay px-4
                py: 1, // Thay py-2
                border: 1,
                borderColor: "grey.300",
                borderRadius: 1,
                fontSize: "0.875rem",
                color: "text.primary",
                "&:hover": { bgcolor: "grey.50" }, // Thay hover:bg-gray-50
              }}
            >
              <FilterList sx={{ mr: 1, fontSize: 16 }} /> {/* Thay h-4 w-4 mr-2 */}
              Lọc theo trạng thái
            </Button>
            <TextField
              placeholder="Từ"
              size="small"
              sx={{ width: 128 }} // Thay w-32
            />
            <TextField
              placeholder="Đến"
              size="small"
              sx={{ width: 128 }} // Thay w-32
            />
          </Box>
        </Box>
      </Box>
      <Box sx={{ p: 3, color: "text.primary" }}>
        <CustomTable
          data={transactions}
          columns={columns}
          headerTitle="Giao Dịch"
          description="Danh sách các giao dịch mới nhất"
          showSearch={false}
          
          onFilterChange={(newFilters) => console.log("Filters changed:", newFilters)}
        />
      </Box>
    </Paper>
  );
}