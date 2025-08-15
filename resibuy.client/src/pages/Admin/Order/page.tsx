import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Visibility, LocalShipping as OrderIcon, Search as SearchIcon } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CustomTable from "../../../components/CustomTable";
import { OrderDetailModal } from "../../../components/admin/Order/order-detail-modal";
import { calculateOrderStats, useOrdersLogic } from "../../../components/admin/Order/seg/utils";
import { StatsCard } from "../../../layouts/AdminLayout/components/StatsCard";
import type { Order } from "../../../types/models";
import { useEffect } from "react";
function OrderStatsCards() {
  const [stats, setStats] = useState<{
    totalOrders: number;
    totalDelivered: number;
    totalCancelled: number;
    totalReported: number;
  }>({ totalOrders: 0, totalDelivered: 0, totalCancelled: 0, totalReported: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    calculateOrderStats()
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        console.error("Error in calculateOrderStats:", err);
        setError(err.message || "Lỗi khi tải thống kê");
        setStats({ totalOrders: 0, totalDelivered: 0, totalCancelled: 0, totalReported: 0 });
        setLoading(false);
      });
  }, []);

  const cards = [
    {
      title: "Tổng Đơn Hàng",
      value: stats.totalOrders.toString(),
      icon: OrderIcon,
      iconColor: "#1976d2",
      iconBgColor: "#e3f2fd",
      valueColor: "#1976d2",
    },
    {
      title: "Đơn Hàng Đã Giao",
      value: stats.totalDelivered.toString(),
      icon: OrderIcon,
      iconColor: "#2e7d32",
      iconBgColor: "#e8f5e9",
      valueColor: "#2e7d32",
    },
    {
      title: "Đơn Hàng Đã Hủy",
      value: stats.totalCancelled.toString(),
      icon: OrderIcon,
      iconColor: "#ef4444",
      iconBgColor: "#fee2e2",
      valueColor: "#ef4444",
    },
    {
      title: "Đơn Hàng Bị Tố Cáo",
      value: stats.totalReported.toString(),
      icon: OrderIcon,
      iconColor: "#d81b60",
      iconBgColor: "#fce4ec",
      valueColor: "#d81b60",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "1fr 1fr",
          lg: "1fr 1fr 1fr 1fr",
        },
        gap: 3,
        mb: 3,
      }}
    >
      {loading && <Typography>Đang tải thống kê...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      {!loading && !error && (
        cards.map((card, index) => (
          <StatsCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            iconColor={card.iconColor}
            iconBgColor={card.iconBgColor}
            valueColor={card.valueColor}
          />
        ))
      )}
    </Box>
  );
}

export default function OrderPage() {
  const {
    orders,
    totalCount,
    pageNumber,
    setPageNumber,
    pageSize,
    totalPages,
    selectedOrder,
    isDetailModalOpen,
    searchParams,
    setSearchParams,
    handleViewOrder,
    handleCloseDetailModal,
    handleExportOrders,
    formatCurrency,
    formatDate,
    formatOrderStatus,
    getOrderStatusColor,
  } = useOrdersLogic();

  const [searchInput, setSearchInput] = useState("");
  const [localFilters, setLocalFilters] = useState<{
    orderStatus?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  const handlePageChange = (newPage: number) => {
    console.log("Page changed to:", newPage);
    setPageNumber(newPage);
  };

  const handleSearch = () => {
    setSearchParams({
      orderStatus: localFilters.orderStatus || undefined,
      paymentMethod: localFilters.paymentMethod || undefined,
      paymentStatus: localFilters.paymentStatus || undefined,
      startDate: localFilters.startDate,
      endDate: localFilters.endDate,
    });
    setPageNumber(1);
  };

  const handleFilterChange = (key: string, value: string | Date | null) => {
    if (key === "startDate" || key === "endDate") {
      setLocalFilters((prev) => ({
        ...prev,
        [key]: value ? new Date(value).toISOString().split("T")[0] : undefined,
      }));
    } else {
      setLocalFilters((prev) => ({
        ...prev,
        [key]: value || undefined,
      }));
    }
  };

  const columns = [
    {
      key: "id" as keyof Order,
      label: "ID Đơn Hàng",
      sortable: true,
      render: (order: Order) => (
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            fontWeight: "medium",
            color: "primary.main",
          }}
        >
          {order.id}
        </Typography>
      ),
    },
    {
      key: "user" as keyof Order,
      label: "Khách Hàng",
      sortable: true,
      render: (order: Order) => (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {order.user.fullName || "N/A"}
        </Typography>
      ),
    },
    {
      key: "store" as keyof Order,
      label: "Cửa Hàng",
      sortable: true,
      render: (order: Order) => (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {order.store.name || "N/A"}
        </Typography>
      ),
    },
    {
      key: "status" as keyof Order,
      label: "Trạng Thái",
      sortable: true,
      render: (order: Order) => (
        <Typography
          variant="body2"
          sx={{
            color: getOrderStatusColor(order.status).color,
            bgcolor: getOrderStatusColor(order.status).bgcolor,
            borderRadius: 1,
            px: 1,
            py: 0.5,
            display: "inline-block",
          }}
        >
          {formatOrderStatus(order.status)}
        </Typography>
      ),
    },
    {
      key: "paymentStatus" as keyof Order,
      label: "Trạng Thái Thanh Toán",
      sortable: true,
      render: (order: Order) => (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {order.paymentStatus || "N/A"}
        </Typography>
      ),
    },
    {
      key: "paymentMethod" as keyof Order,
      label: "Phương Thức Thanh Toán",
      sortable: true,
      render: (order: Order) => (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {order.paymentMethod || "N/A"}
        </Typography>
      ),
    },
    {
      key: "totalPrice" as keyof Order,
      label: "Tổng Tiền",
      sortable: true,
      render: (order: Order) => (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {formatCurrency(order.totalPrice)}
        </Typography>
      ),
    },
    {
      key: "createAt" as keyof Order,
      label: "Ngày Tạo",
      sortable: true,
      render: (order: Order) => (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {formatDate(order.createAt)}
        </Typography>
      ),
    },
    {
      key: "actions" as keyof Order,
      label: "Hành Động",
      render: (order: Order) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            onClick={() => {
              handleViewOrder(order.id);
              console.log("Order data:", order);
            }}
            sx={{
              color: "primary.main",
              p: 0.5,
              bgcolor: "background.paper",
              borderRadius: 1,
              "&:hover": {
                color: "primary.dark",
                bgcolor: "blue[50]",
              },
            }}
            title="Xem Chi Tiết"
          >
            <Visibility sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      ),
    },
  ];

  const filters = {
    orderStatus: [
      { label: "Chờ Xử Lý", value: "Pending" },
      { label: "Đang Xử Lý", value: "Processing" },
      { label: "Đang Giao", value: "Shipped" },
      { label: "Đã Giao", value: "Delivered" },
      { label: "Đã Hủy", value: "Cancelled" },
      { label: "Khách Không Có Mặt", value: "CustomerNotAvailable" },
      { label: "Bị Tố Cáo", value: "Reported" },
    ],
    paymentMethod: [
      { label: "COD", value: "COD" },
      { label: "CHuyển khỏn", value: "BankTransfer" },
    ],
    paymentStatus: [
      { label: "Chưa thanh toán", value: "Pending" },
      { label: "Đã thanh toán", value: "Paid" },
      { label: "Thanh toán thất bại", value: "Failed" },
        { label: "Đã hoàn tiền", value: "Refunded" },
    ],
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          bgcolor: (theme) => theme.palette.grey[50],
        }}
      >
        <Box
          component="header"
          sx={{
            display: "flex",
            height: 64,
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            px: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={(theme) => ({
              color: theme.palette.grey[700],
              fontWeight: theme.typography.fontWeightMedium,
            })}
          >
            Quản Lý Đơn Hàng
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Box>
            <Typography
              variant="body2"
              sx={(theme) => ({
                color: theme.palette.grey[600],
              })}
            >
              Quản lý đơn hàng và trạng thái
            </Typography>
          </Box>

          <OrderStatsCards />

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              mb: 2,
            }}
          >
            
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Trạng Thái Đơn Hàng</InputLabel>
                <Select
                  value={localFilters.orderStatus ?? ""}
                  onChange={(e) => handleFilterChange("orderStatus", e.target.value)}
                  label="Trạng Thái Đơn Hàng"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {filters.orderStatus.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Phương Thức Thanh Toán</InputLabel>
                <Select
                  value={localFilters.paymentMethod ?? ""}
                  onChange={(e) => handleFilterChange("paymentMethod", e.target.value)}
                  label="Phương Thức Thanh Toán"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {filters.paymentMethod.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Trạng Thái Thanh Toán</InputLabel>
                <Select
                  value={localFilters.paymentStatus ?? ""}
                  onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}
                  label="Trạng Thái Thanh Toán"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {filters.paymentStatus.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <DatePicker
                label="Từ Ngày"
                value={localFilters.startDate ? new Date(localFilters.startDate) : null}
                onChange={(value) => handleFilterChange("startDate", value)}
                slotProps={{ textField: { size: "small", sx: { minWidth: 120 },  inputProps: { placeholder: "dd/mm/yy" },
                    format: "dd/MM/yy", } }}
              />
              <DatePicker
                label="Đến Ngày"
                value={localFilters.endDate ? new Date(localFilters.endDate) : null}
                onChange={(value) => handleFilterChange("endDate", value)}
                slotProps={{ textField: { size: "small", sx: { minWidth: 120 },  inputProps: { placeholder: "dd/mm/yy" },
                    format: "dd/MM/yy", } }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Tìm kiếm
              </Button>
            </Box>
          </Box>

          <CustomTable
            data={orders}
            totalCount={totalCount}
            columns={columns}
            onExport={handleExportOrders}
            onPageChange={handlePageChange}
            headerTitle="Tất Cả Đơn Hàng"
            description="Quản lý đơn hàng"
            showExport={true}
            showBulkActions={false}
            itemsPerPage={pageSize}
            
          />
        </Box>

        <OrderDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          order={selectedOrder}
        />
      </Box>
    </LocalizationProvider>
  );
}