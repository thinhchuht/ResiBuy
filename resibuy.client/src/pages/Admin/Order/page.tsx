import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  Store,
  Person,
  LocalShipping,
  Clear,
  Close,
  ShoppingCart,
  Payment,
  LocalOffer,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import CustomTable from "../../../components/CustomTable";
import orderApi from "../../../api/order.api";
import { OrderStatus, PaymentStatus } from "../../../types/models";

export interface Order {
  id: string;
  totalPrice: number;
  shippingFee: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: number;
  createAt: string;
  user?: {
    id: string;
    fullName: string;
    phoneNumber: string;
    email: string;
  };
  store?: {
    id: string;
    name: string;
    phoneNumber: string;
    description: string;
  };
  shipper?: {
    id: string;
    fullName: string;
    phoneNumber: string;
  };
  orderItems?: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: number;
    image?: {
      url: string;
      thumbUrl: string;
    };
    addtionalData?: Array<{
      key: string;
      value: string;
    }>;
  }>;
}

interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  reported: number;
}

enum OrderStatusFilter {
  None = "None",
  Pending = "Pending",
  Processing = "Processing",
  Shipped = "Shipped",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
  Reported = "Reported",
  Assigned = "Assigned",
  CustomerNotAvailable = "CustomerNotAvailable",
}

enum PaymentStatusFilter {
  None = "None",
  Paid = "Paid",
  Pending = "Pending",
  Failed = "Failed",
  Refunded = "Refunded",
}

enum PaymentMethodFilter {
  None = "None",
  Cash = 1,
  Online = 2,
}

const OrderStatusLabels: Record<OrderStatusFilter, string> = {
  [OrderStatusFilter.None]: "Tất cả trạng thái",
  [OrderStatusFilter.Pending]: "Chờ xác nhận",
  [OrderStatusFilter.Processing]: "Đang xử lý",
  [OrderStatusFilter.Shipped]: "Đang giao",
  [OrderStatusFilter.Delivered]: "Đã giao",
  [OrderStatusFilter.Cancelled]: "Đã hủy",
  [OrderStatusFilter.Reported]: "Bị báo cáo",
  [OrderStatusFilter.Assigned]: "Đang lấy hàng",
  [OrderStatusFilter.CustomerNotAvailable]: "Chờ nhận",
};

const PaymentStatusLabels: Record<PaymentStatusFilter, string> = {
  [PaymentStatusFilter.None]: "Tất cả thanh toán",
  [PaymentStatusFilter.Paid]: "Đã thanh toán",
  [PaymentStatusFilter.Pending]: "Chưa thanh toán",
  [PaymentStatusFilter.Failed]: "Thanh toán thất bại",
  [PaymentStatusFilter.Refunded]: "Đã hoàn tiền",
};

const PaymentMethodLabels: Record<PaymentMethodFilter, string> = {
  [PaymentMethodFilter.None]: "Tất cả phương thức",
  [PaymentMethodFilter.Cash]: "Tiền mặt",
  [PaymentMethodFilter.Online]: "Trực tuyến",
};

export default function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);

  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    reported: 0,
  });

  const [filters, setFilters] = useState({
    keyword: "",
    startDate: null,
    endDate: new Date(),
    orderStatus: OrderStatusFilter.None,
    paymentStatus: PaymentStatusFilter.None,
    paymentMethod: PaymentMethodFilter.None,
  } as {
    keyword: string;
    startDate: Date | null;
    endDate: Date | null;
    orderStatus: OrderStatusFilter;
    paymentStatus: PaymentStatusFilter;
    paymentMethod: PaymentMethodFilter;
  });

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return "Chờ xác nhận";
      case OrderStatus.Processing:
        return "Đang xử lý";
      case OrderStatus.Shipped:
        return "Đang giao";
      case OrderStatus.Delivered:
        return "Đã giao";
      case OrderStatus.Cancelled:
        return "Đã hủy";
      case OrderStatus.Reported:
        return "Bị báo cáo";
      case OrderStatus.Assigned:
        return "Đang lấy hàng";
      case OrderStatus.CustomerNotAvailable:
        return "Chờ nhận";
      default:
        return "Không xác định";
    }
  };

  const getPaymentStatusText = (
    status: PaymentStatus,
    paymentMethod: number
  ) => {
    switch (status) {
      case PaymentStatus.Paid:
        return "Đã thanh toán";
      case PaymentStatus.Pending:
        return "Chưa thanh toán";
      case PaymentStatus.Failed:
        if (paymentMethod === 1) {
          return "Thanh toán thất bại";
        } else if (paymentMethod === 2) {
          return "Chờ hoàn tiền";
        }
        return "Thanh toán thất bại";
      case PaymentStatus.Refunded:
        return "Đã hoàn tiền";
      default:
        return "Không xác định";
    }
  };

  const getStatusColor = (status: OrderStatus): "warning" | "info" | "primary" | "success" | "error" | "secondary" | "default" => {
    switch (status) {
      case OrderStatus.Pending:
        return "warning";
      case OrderStatus.Processing:
        return "info";
      case OrderStatus.Shipped:
        return "primary";
      case OrderStatus.Delivered:
        return "success";
      case OrderStatus.Cancelled:
        return "error";
      case OrderStatus.Reported:
        return "error";
      case OrderStatus.Assigned:
        return "secondary";
      case OrderStatus.CustomerNotAvailable:
        return "warning";
      default:
        return "default";
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus): "success" | "warning" | "error" | "info" | "default" => {
    switch (status) {
      case PaymentStatus.Paid:
        return "success";
      case PaymentStatus.Pending:
        return "warning";
      case PaymentStatus.Failed:
        return "error";
      case PaymentStatus.Refunded:
        return "info";
      default:
        return "default";
    }
  };

  const loadOrders = async () => {
    try {
      const params = {
        orderStatus: filters.orderStatus !== OrderStatusFilter.None ? filters.orderStatus.toString() : "None",
        paymentMethod: filters.paymentMethod !== PaymentMethodFilter.None ? filters.paymentMethod.toString() : "None",
        paymentStatus: filters.paymentStatus !== PaymentStatusFilter.None ? filters.paymentStatus.toString() : "None",
        pageNumber,
        pageSize,
        startDate: filters.startDate ? format(filters.startDate, "yyyy-MM-dd") : undefined,
        endDate: filters.endDate ? format(filters.endDate, "yyyy-MM-dd") : undefined,
      };
      const response = await orderApi.getAll(
        params.orderStatus,
        params.paymentMethod,
        params.paymentStatus,
        undefined,
        undefined,
        undefined,
        params.pageNumber,
        params.pageSize,
        params.startDate,
        params.endDate
      );
      setOrders(response.items || []);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const statsData = await orderApi.getOverviewStats({
        startDate: filters.startDate ? format(filters.startDate, "yyyy-MM-dd") : undefined,
        endDate: filters.endDate ? format(filters.endDate, "yyyy-MM-dd") : undefined,
      });
      
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
  };

  const handleSearchChange = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchKeyword !== filters.keyword) {
        setFilters(prev => ({ ...prev, keyword: searchKeyword }));
        setPageNumber(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchKeyword, filters.keyword]);

  const handleClearFilters = () => {
    setSearchKeyword("");
    setFilters({
      keyword: "",
      startDate: (() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
      })(),
      endDate: (() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 0);
      })(),
      orderStatus: OrderStatusFilter.None,
      paymentStatus: PaymentStatusFilter.None,
      paymentMethod: PaymentMethodFilter.None,
    });
    setPageNumber(1);
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);

    setIsLoadingOrder(true);
    try {
      const orderData = await orderApi.getById(order.id);
      setSelectedOrder(orderData);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setSelectedOrder(null);
    } finally {
      setIsLoadingOrder(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
    setIsLoadingOrder(false);
  };

  const columns = [
    {
      key: "index" as keyof Order,
      label: "STT",
      render: (order: Order) => {
        const index = orders.indexOf(order);
        return (
          <Typography variant="body2" color="text.secondary">
            {(pageNumber - 1) * pageSize + index + 1}
          </Typography>
        );
      },
    },
    {
      key: "id" as keyof Order,
      label: "Mã đơn hàng",
      render: (order: Order) => (
        <Typography variant="body2" fontFamily="monospace" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
          {order.id}
        </Typography>
      ),
    },
    {
      key: "user" as keyof Order,
      label: "Khách hàng",
      render: (order: Order) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Person sx={{ fontSize: 20, color: "primary.main" }} />
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {order.user?.fullName || "Không có thông tin"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {order.user?.phoneNumber || "Không có số điện thoại"}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "store" as keyof Order,
      label: "Cửa hàng",
      render: (order: Order) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Store sx={{ fontSize: 20, color: "secondary.main" }} />
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {order.store?.name || "Không có thông tin"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {order.store?.phoneNumber || "Không có số điện thoại"}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "shipper" as keyof Order,
      label: "Người giao hàng",
      render: (order: Order) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LocalShipping sx={{ fontSize: 20, color: "warning.main" }} />
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {order.shipper?.fullName || "Chưa phân công"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {order.shipper?.phoneNumber || "Không có số điện thoại"}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "totalPrice" as keyof Order,
      label: "Tổng tiền",
      render: (order: Order) => (
        <Typography variant="body2" fontWeight={600} color="primary.main">
          {order.totalPrice?.toLocaleString('vi-VN')} VNĐ
        </Typography>
      ),
    },
    {
      key: "status" as keyof Order,
      label: "Trạng thái",
      render: (order: Order) => (
        <Chip
          label={getStatusText(order.status)}
          size="small"
          color={getStatusColor(order.status)}
          variant="outlined"
        />
      ),
    },
    {
      key: "paymentStatus" as keyof Order,
      label: "Thanh toán",
      render: (order: Order) => (
        <Chip
          label={getPaymentStatusText(order.paymentStatus, order.paymentMethod)}
          size="small"
          color={getPaymentStatusColor(order.paymentStatus)}
          variant="outlined"
        />
      ),
    },
    {
      key: "createAt" as keyof Order,
      label: "Ngày tạo",
      render: (order: Order) => (
        <Typography variant="body2">
          {order.createAt ? format(new Date(order.createAt), "dd/MM/yyyy HH:mm", { locale: vi }) : "Không rõ"}
        </Typography>
      ),
    },
    {
      key: "actions" as keyof Order,
      label: "Thao tác",
      render: (order: Order) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Xem chi tiết">
            <IconButton
              size="small"
              onClick={() => handleViewOrder(order)}
              color="primary"
            >
              <Visibility />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  useEffect(() => {
    loadOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, filters]);

  useEffect(() => {
    loadStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          bgcolor: (theme) => theme.palette.grey[50],
          overflow: "hidden",
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
            <Typography variant="h4" color="text.secondary">
              Quản lý đơn hàng
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Theo dõi và quản lý tất cả đơn hàng trong hệ thống
            </Typography>
          </Box>

          {/* Statistics Cards */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {isLoadingStats ? (
              // Loading skeleton for statistics cards
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 22%" }, minWidth: 200 }}>
                  <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 3 }}>
                    <CircularProgress size={24} sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Đang tải...
                    </Typography>
                  </CardContent>
                </Card>
              ))
            ) : (
              [
                { label: "Tổng đơn hàng", value: stats.total, color: "text.primary", icon: ShoppingCart },
                { label: "Chờ xác nhận", value: stats.pending, color: "warning.main", icon: Payment },
                { label: "Đang xử lý", value: stats.processing, color: "info.main", icon: LocalOffer },
                { label: "Đã giao", value: stats.delivered, color: "success.main", icon: Store },
              ].map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <Card key={index} sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 22%" }, minWidth: 200 }}>
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                        <IconComponent sx={{ color: stat.color, fontSize: 24 }} />
                        <Typography color="text.secondary" variant="body2">
                          {stat.label}
                        </Typography>
                      </Box>
                      <Typography variant="h4" fontWeight={600} color={stat.color}>
                        {stat.value}
                      </Typography>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </Box>

          {/* Additional Statistics */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {isLoadingStats ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} sx={{ flex: { xs: "1 1 100%", sm: "1 1 30%" }, minWidth: 200 }}>
                  <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <CircularProgress size={32} sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Đang tải...
                    </Typography>
                  </CardContent>
                </Card>
              ))
            ) : (
              [
                { label: "Đang giao", value: stats.shipped, color: "primary.main" },
                { label: "Đã hủy", value: stats.cancelled, color: "error.main" },
                { label: "Bị báo cáo", value: stats.reported, color: "warning.main" }
              ].map((item, index) => (
                <Card key={index} sx={{ flex: { xs: "1 1 100%", sm: "1 1 30%" }, minWidth: 200 }}>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h6" fontWeight={600} color={item.color}>
                      {item.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.label}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>

          {/* Filters */}
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6">
                Bộ lọc
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Clear />}
                onClick={handleClearFilters}
                sx={{ minWidth: "auto" }}
              >
                Xóa tất cả
              </Button>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
              <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }, minWidth: 200 }}>
                <TextField
                  fullWidth
                  label="Từ khóa tìm kiếm"
                  value={searchKeyword}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  size="small"
                  placeholder="Nhập từ khóa tìm kiếm..."
                />
              </Box>
              <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }, minWidth: 200 }}>
                <DatePicker
                  label="Từ ngày"
                  value={filters.startDate}
                  onChange={(date) => {
                    setFilters(prev => ({ ...prev, startDate: date }));
                  }}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                />
              </Box>
              <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }, minWidth: 200 }}>
                <DatePicker
                  label="Đến ngày"
                  value={filters.endDate}
                  onChange={(date) => {
                    setFilters(prev => ({ ...prev, endDate: date }));
                  }}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                />
              </Box>
              <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }, minWidth: 200 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Trạng thái đơn hàng</InputLabel>
                  <Select
                    value={filters.orderStatus}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, orderStatus: e.target.value as OrderStatusFilter }));
                    }}
                    label="Trạng thái đơn hàng"
                  >
                    {Object.entries(OrderStatusLabels).map(([key, label]) => (
                      <MenuItem key={key} value={key}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }, minWidth: 200 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Trạng thái thanh toán</InputLabel>
                  <Select
                    value={filters.paymentStatus}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, paymentStatus: e.target.value as PaymentStatusFilter }));
                    }}
                    label="Trạng thái thanh toán"
                  >
                    {Object.entries(PaymentStatusLabels).map(([key, label]) => (
                      <MenuItem key={key} value={key}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }, minWidth: 200 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Phương thức thanh toán</InputLabel>
                  <Select
                    value={filters.paymentMethod}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethodFilter }));
                    }}
                    label="Phương thức thanh toán"
                  >
                    {Object.entries(PaymentMethodLabels).map(([key, label]) => (
                      <MenuItem key={key} value={key}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Paper>

          {/* Orders Table */}
          <CustomTable
            data={orders}
            totalCount={totalCount}
            columns={columns}
            onPageChange={handlePageChange}
            headerTitle="Danh sách đơn hàng"
            description="Quản lý tất cả đơn hàng trong hệ thống"
            showSearch={false}
            showBulkActions={false}
            showExport={false}
            itemsPerPage={pageSize}
          />

          {/* Order Detail Modal */}
          <Dialog
            open={isDetailModalOpen}
            onClose={handleCloseDetailModal}
            maxWidth="lg"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 2,
                maxHeight: '90vh',
                bgcolor: "background.paper",
              }
            }}
          >
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                pr: 1,
                bgcolor: "background.paper",
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingCart sx={{ fontSize: 24 }} />
                <Typography variant="h6" fontWeight={600}>
                  Chi tiết đơn hàng
                </Typography>
              </Box>
              <IconButton
                onClick={handleCloseDetailModal}
                size="small"
                sx={{ color: "text.secondary" }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              {selectedOrder && (
                <Box>
                  {/* Order Details Section */}
                  <Box sx={{ p: 3, bgcolor: "background.paper" }}>
                    <Typography variant="h6" gutterBottom sx={{ color: 'grey.900', fontWeight: 600, mb: 2 }}>
                      Thông tin đơn hàng
                    </Typography>
                    {isLoadingOrder ? (
                      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                        <CircularProgress size={32} />
                      </Box>
                    ) : selectedOrder ? (
                      <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                            <Box sx={{ flex: 1, minWidth: 200 }}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Mã đơn hàng
                              </Typography>
                              <Typography variant="body1" fontFamily="monospace" sx={{
                                bgcolor: 'grey.100',
                                p: 1,
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'grey.200'
                              }}>
                                {selectedOrder.id}
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 200 }}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Tổng tiền
                              </Typography>
                              <Typography variant="h6" color="primary.main" fontWeight={600}>
                                {selectedOrder.totalPrice?.toLocaleString('vi-VN')} VNĐ
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 200 }}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Phí giao hàng
                              </Typography>
                              <Typography variant="body1" color="text.secondary">
                                {selectedOrder.shippingFee?.toLocaleString('vi-VN')} VNĐ
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                            <Chip
                              label={`Trạng thái: ${getStatusText(selectedOrder.status)}`}
                              color={getStatusColor(selectedOrder.status)}
                              variant="outlined"
                              sx={{ fontWeight: 500 }}
                            />
                            <Chip
                              label={`Thanh toán: ${getPaymentStatusText(selectedOrder.paymentStatus, selectedOrder.paymentMethod)}`}
                              color={getPaymentStatusColor(selectedOrder.paymentStatus)}
                              variant="outlined"
                              sx={{ fontWeight: 500 }}
                            />
                            <Chip
                              label={`Ngày tạo: ${selectedOrder.createAt ? format(new Date(selectedOrder.createAt), "dd/MM/yyyy", { locale: vi }) : 'Không rõ'}`}
                              color="default"
                              variant="outlined"
                              sx={{ fontWeight: 500 }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            <Box sx={{ flex: 1, minWidth: 250, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Person sx={{ color: 'primary.main', fontSize: 20 }} />
                                <Typography variant="subtitle1" fontWeight={600} color="primary.main">
                                  Khách hàng
                                </Typography>
                              </Box>
                              <Typography variant="body1" fontWeight={500}>
                                {selectedOrder.user?.fullName || 'Không có thông tin'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {selectedOrder.user?.phoneNumber || 'Không có số điện thoại'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {selectedOrder.user?.email || 'Không có email'}
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 250, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Store sx={{ color: 'secondary.main', fontSize: 20 }} />
                                <Typography variant="subtitle1" fontWeight={600} color="secondary.main">
                                  Cửa hàng
                                </Typography>
                              </Box>
                              <Typography variant="body1" fontWeight={500}>
                                {selectedOrder.store?.name || 'Không có thông tin'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {selectedOrder.store?.phoneNumber || 'Không có số điện thoại'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {selectedOrder.store?.description || 'Không có mô tả'}
                              </Typography>
                            </Box>
                            {selectedOrder.shipper?.id && (
                              <Box sx={{ flex: 1, minWidth: 250, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <LocalShipping sx={{ color: 'warning.main', fontSize: 20 }} />
                                  <Typography variant="subtitle1" fontWeight={600} color="warning.main">
                                    Người giao hàng
                                  </Typography>
                                </Box>
                                <Typography variant="body1" fontWeight={500}>
                                  {selectedOrder.shipper.fullName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {selectedOrder.shipper.phoneNumber || 'Không có số điện thoại'}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: 'grey.900', mb: 2 }}>
                                Sản phẩm trong đơn hàng ({selectedOrder.orderItems.length})
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {selectedOrder.orderItems.map((item, index) => (
                                  <Card key={index} sx={{
                                    border: '1px solid',
                                    borderColor: 'grey.200',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    '&:hover': {
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                    }
                                  }}>
                                    <CardContent sx={{ p: 2 }}>
                                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                        {item.image && (
                                          <Box sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: 1,
                                            overflow: 'hidden',
                                            border: '1px solid',
                                            borderColor: 'grey.200',
                                            flexShrink: 0
                                          }}>
                                            <img
                                              src={item.image.thumbUrl || item.image.url}
                                              alt={item.productName}
                                              style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                              }}
                                              onError={(e) => {
                                                e.currentTarget.src = '/placeholder-image.png';
                                              }}
                                            />
                                          </Box>
                                        )}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                          <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{
                                            color: 'grey.900',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical'
                                          }}>
                                            {item.productName}
                                          </Typography>
                                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                                            <Box>
                                              <Typography variant="caption" color="text.secondary" display="block">
                                                Số lượng
                                              </Typography>
                                              <Typography variant="body2" fontWeight={500}>
                                                {item.quantity}
                                              </Typography>
                                            </Box>
                                            <Box>
                                              <Typography variant="caption" color="text.secondary" display="block">
                                                Đơn giá
                                              </Typography>
                                              <Typography variant="body2" fontWeight={500} color="primary.main">
                                                {item.price?.toLocaleString('vi-VN')} VNĐ
                                              </Typography>
                                            </Box>
                                            <Box>
                                              <Typography variant="caption" color="text.secondary" display="block">
                                                Thành tiền
                                              </Typography>
                                              <Typography variant="body2" fontWeight={600} color="error.main">
                                                {(item.price * item.quantity)?.toLocaleString('vi-VN')} VNĐ
                                              </Typography>
                                            </Box>
                                          </Box>
                                          {item.addtionalData && item.addtionalData.length > 0 && (
                                            <Box sx={{ mt: 1 }}>
                                              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                                Thông tin thêm:
                                              </Typography>
                                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {item.addtionalData.map((data, dataIndex) => (
                                                  <Chip
                                                    key={dataIndex}
                                                    label={`${data.key}: ${data.value}`}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontSize: '0.75rem', height: 24 }}
                                                  />
                                                ))}
                                              </Box>
                                            </Box>
                                          )}
                                        </Box>
                                      </Box>
                                    </CardContent>
                                  </Card>
                                ))}
                              </Box>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    ) : (
                      <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            Không thể tải thông tin đơn hàng
                          </Typography>
                        </CardContent>
                      </Card>
                    )}
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCloseDetailModal}
                color="inherit"
                variant="outlined"
              >
                Đóng
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
