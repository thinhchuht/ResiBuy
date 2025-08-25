import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { Visibility, CheckCircle, Warning, Store, Person, LocalShipping, CheckCircleOutline, Clear, Close } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import CustomTable from "../../../components/CustomTable";
import reportApi from "../../../api/report.api";
import orderApi from "../../../api/order.api";
import type { OrderApiResult } from "../../Order/OrderCard";
import { OrderStatus, PaymentStatus } from "../../../types/models";
import { HubEventType, useEventHub, type HubEventHandler } from "../../../hooks/useEventHub";
import type { ReportCreatedDto } from "../../../types/hubEventDto";
import { StatsCard } from "../../../layouts/AdminLayout/components/StatsCard";
import { useToastify } from "../../../hooks/useToastify";
export interface Report {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  createdById: string;
  targetId: string;
  reportTarget: string;
  orderId: string;
  isResolved: boolean;
}

interface ReportStats {
  total: number;
  resolved: number;
  unResolved: number;
  customerTarget: number;
  storeTarget: number;
  shipperTarget: number;
}

enum ReportTarget {
  None = "None",
  Customer = "Customer",
  Store = "Store",
  Shipper = "Shipper",
}

const ReportTargetLabels: Record<ReportTarget, string> = {
  [ReportTarget.None]: "Không xác định",
  [ReportTarget.Customer]: "Khách hàng",
  [ReportTarget.Store]: "Cửa hàng",
  [ReportTarget.Shipper]: "Người giao hàng",
};

const ReportTargetIcons: Record<ReportTarget, React.ReactElement> = {
  [ReportTarget.None]: <Person />,
  [ReportTarget.Customer]: <Person />,
  [ReportTarget.Store]: <Store />,
  [ReportTarget.Shipper]: <LocalShipping />,
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);

  const [stats, setStats] = useState<ReportStats>({
    total: 0,
    resolved: 0,
    unResolved: 0,
    customerTarget: 0,
    storeTarget: 0,
    shipperTarget: 0,
  });

  const [filters, setFilters] = useState({
    keyword: "",
    startDate: null,
    endDate: new Date(),
    reportTarget: ReportTarget.None,
  } as {
    keyword: string;
    startDate: Date | null;
    endDate: Date | null;
    reportTarget: ReportTarget;
  });

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderApiResult | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const toast = useToastify();
  const handleOrderReported = useCallback(
    (data: ReportCreatedDto) => {
      const newReport: Report = {
        id: data.id,
        title: data.title,
        description: data.description,
        createdAt: data.createdAt,
        isResolved: false,
        orderId: data.orderId,
        reportTarget: data.reportTarget,
        createdById: data.createdById,
        targetId: data.targetId,
      };

      const matchesFilters =
        (!filters.keyword ||
          newReport.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
          newReport.description.toLowerCase().includes(filters.keyword.toLowerCase())) &&
        (filters.reportTarget === ReportTarget.None || newReport.reportTarget === filters.reportTarget) &&
        (!filters.startDate || new Date(newReport.createdAt) >= filters.startDate) &&
        (!filters.endDate || new Date(newReport.createdAt) <= filters.endDate);

      if (matchesFilters) {
        setReports((prevReports) => [newReport, ...prevReports]);
        setTotalCount((prevCount) => prevCount + 1);
      }

      setStats((prevStats) => ({
        ...prevStats,
        total: prevStats.total + 1,
        unResolved: prevStats.unResolved + 1,
        ...(data.reportTarget === "Customer" && {
          customerTarget: prevStats.customerTarget + 1,
        }),
        ...(data.reportTarget === "Store" && {
          storeTarget: prevStats.storeTarget + 1,
        }),
        ...(data.reportTarget === "Shipper" && {
          shipperTarget: prevStats.shipperTarget + 1,
        }),
      }));
    },
    [filters]
  );

  const eventHandlers = useMemo(
    () => ({
      [HubEventType.OrderReported]: handleOrderReported,
    }),
    [handleOrderReported]
  );
  useEventHub(eventHandlers as Partial<Record<HubEventType, HubEventHandler>>);

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

  const getPaymentStatusText = (status: PaymentStatus, paymentMethod: number) => {
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

  const loadReports = async () => {
    try {
      const params = {
        keyword: filters.keyword || undefined,
        startDate: filters.startDate ? format(filters.startDate, "yyyy-MM-dd") : undefined,
        endDate: filters.endDate ? format(filters.endDate, "yyyy-MM-dd") : undefined,
        reportTarget: filters.reportTarget !== ReportTarget.None ? filters.reportTarget.toString() : undefined,
        pageNumber,
        pageSize,
      };
      const response = await reportApi.getAll(params);
      setReports(response.data.items || []);
      setTotalCount(response.data.totalCount || 0);
    } catch (error) {
      console.error("Error loading reports:", error);
    }
  };

  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await reportApi.getCount({
        startDate: filters.startDate ? format(filters.startDate, "yyyy-MM-dd") : undefined,
        endDate: filters.endDate ? format(filters.endDate, "yyyy-MM-dd") : undefined,
      });
      const statsData = response.data;
      setStats({
        total: statsData.total,
        resolved: statsData.resolved,
        unResolved: statsData.unResolved,
        customerTarget: statsData.customerTarget,
        storeTarget: statsData.storeTarget,
        shipperTarget: statsData.shipperTarget,
      });
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
        setFilters((prev) => ({ ...prev, keyword: searchKeyword }));
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
      reportTarget: ReportTarget.None,
    });
    setPageNumber(1);
  };

  const handleViewReport = async (report: Report) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);

    if (report.orderId) {
      setIsLoadingOrder(true);
      try {
        const orderData = await orderApi.getById(report.orderId);
        setOrderDetails(orderData);
      } catch (error) {
        console.error("Error fetching order details:", error);
        setOrderDetails(null);
      } finally {
        setIsLoadingOrder(false);
      }
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedReport(null);
    setOrderDetails(null);
    setIsLoadingOrder(false);
  };

  const handleOpenConfirmModal = () => {
    setIsConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
  };

  const handleResolveReport = async (reportId: string, isAddReportTarget: boolean = false) => {
    try {
      await reportApi.resolve(reportId, isAddReportTarget);
      loadReports();
      loadStats();
      setIsConfirmModalOpen(false);
      if (isDetailModalOpen) {
        handleCloseDetailModal();
      }
      toast.success("Xử lý báo cáo thành công!");
    } catch (error) {
      console.error("Error resolving report:", error);
    }
  };

  const columns = [
    {
      key: "index" as keyof Report,
      label: "STT",
      render: (report: Report) => {
        const index = reports.indexOf(report);
        return (
          <Typography variant="body2" color="text.secondary">
            {(pageNumber - 1) * pageSize + index + 1}
          </Typography>
        );
      },
    },
    {
      key: "title" as keyof Report,
      label: "Tiêu đề",
      render: (report: Report) => (
        <Typography variant="body2" fontWeight={500}>
          {report.title}
        </Typography>
      ),
    },
    {
      key: "reportTarget" as keyof Report,
      label: "Đối tượng",
      render: (report: Report) => (
        <Chip
          icon={ReportTargetIcons[report.reportTarget as ReportTarget]}
          label={ReportTargetLabels[report.reportTarget as ReportTarget]}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      key: "orderId" as keyof Report,
      label: "Đơn hàng",
      render: (report: Report) => (
        <Typography variant="body2" fontFamily="monospace" sx={{ fontSize: "0.875rem" }}>
          {report.orderId}
        </Typography>
      ),
    },
    {
      key: "createdAt" as keyof Report,
      label: "Ngày tạo",
      render: (report: Report) => <Typography variant="body2">{format(new Date(report.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}</Typography>,
    },
    {
      key: "isResolved" as keyof Report,
      label: "Trạng thái",
      render: (report: Report) => (
        <Chip
          icon={report.isResolved ? <CheckCircle /> : <Warning />}
          label={report.isResolved ? "Đã xử lý" : "Chờ xử lý"}
          size="small"
          color={report.isResolved ? "success" : "warning"}
        />
      ),
    },
    {
      key: "actions" as keyof Report,
      label: "Thao tác",
      render: (report: Report) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Xem chi tiết">
            <IconButton size="small" onClick={() => handleViewReport(report)} color="primary">
              <Visibility />
            </IconButton>
          </Tooltip>
          {!report.isResolved && (
            <Tooltip title="Xử lý báo cáo">
              <IconButton
                size="small"
                onClick={() => {
                  setSelectedReport(report);
                  handleOpenConfirmModal();
                }}
                color="success">
                <CheckCircleOutline />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  useEffect(() => {
    loadReports();
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
        }}>
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
          }}>
          <Typography
            variant="h6"
            sx={(theme) => ({
              color: theme.palette.grey[700],
              fontWeight: theme.typography.fontWeightMedium,
            })}>
            Quản Lý Báo Cáo
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
          }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Thống kê và quản lý các đơn hàng bị tố cáo
            </Typography>
          </Box>

          {/* Statistics Cards */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 3 }}>
            {isLoadingStats
              ? Array.from({ length: 4 }).map((_, index) => (
                  <StatsCard
                    key={index}
                    title="Đang tải..."
                    value=""
                    icon={() => <CircularProgress size={24} />}
                    iconColor="text.secondary"
                    iconBgColor="grey.100"
                    sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 22%" }, minWidth: 200 }}
                  />
                ))
              : [
                  {
                    title: "Tổng số báo cáo",
                    value: stats.total,
                    icon: Warning,
                    iconColor: "error.main",
                    iconBgColor: "#fee2e2",
                    valueColor: "text.primary",
                  },
                  {
                    title: "Đã xử lý",
                    value: stats.resolved,
                    icon: CheckCircle,
                    iconColor: "success.main",
                    iconBgColor: "#e8f5e9",
                    valueColor: "success.main",
                  },
                  {
                    title: "Chờ xử lý",
                    value: stats.unResolved,
                    icon: Warning,
                    iconColor: "warning.main",
                    iconBgColor: "#eeefdeff",
                    valueColor: "warning.main",
                  },
                  {
                    title: "Tỷ lệ xử lý",
                    value: `${stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%`,
                    icon: CheckCircleOutline,
                    iconColor: "info.main",
                    iconBgColor: "#f2e5f5ff",
                    valueColor: "info.main",
                  },
                ].map((stat, index) => (
                  <StatsCard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    iconColor={stat.iconColor}
                    iconBgColor={stat.iconBgColor}
                    valueColor={stat.valueColor}
                    sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 22%" }, minWidth: 200 }}
                  />
                ))}
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
            {isLoadingStats
              ? Array.from({ length: 3 }).map((_, index) => (
                  <StatsCard
                    key={index}
                    title="Đang tải..."
                    value=""
                    icon={() => <CircularProgress size={24} />}
                    iconColor="text.secondary"
                    iconBgColor="grey.100"
                    sx={{ flex: { xs: "1 1 100%", sm: "1 1 30%" }, minWidth: 200 }}
                  />
                ))
              : [
                  {
                    title: "Báo cáo khách hàng",
                    value: stats.customerTarget,
                    icon: Person,
                    iconColor: "primary.main",
                    iconBgColor: "#e8f5e9",
                    valueColor: "primary.main",
                  },
                  {
                    title: "Báo cáo cửa hàng",
                    value: stats.storeTarget,
                    icon: Store,
                    iconColor: "secondary.main",
                    iconBgColor: "#f4e6efff",
                    valueColor: "secondary.main",
                  },
                  {
                    title: "Báo cáo người giao hàng",
                    value: stats.shipperTarget,
                    icon: LocalShipping,
                    iconColor: "warning.main",
                    iconBgColor: "#fdecdcff",
                    valueColor: "warning.main",
                  },
                ].map((stat, index) => (
                  <StatsCard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    iconColor={stat.iconColor}
                    iconBgColor={stat.iconBgColor}
                    valueColor={stat.valueColor}
                    sx={{ flex: { xs: "1 1 100%", sm: "1 1 30%" }, minWidth: 200 }}
                  />
                ))}
          </Box>

          {/* Filters */}
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6">Bộ lọc</Typography>
              <Button variant="outlined" size="small" startIcon={<Clear />} onClick={handleClearFilters} sx={{ minWidth: "auto" }}>
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
                    setFilters((prev) => ({ ...prev, startDate: date }));
                  }}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                />
              </Box>
              <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }, minWidth: 200 }}>
                <DatePicker
                  label="Đến ngày"
                  value={filters.endDate}
                  onChange={(date) => {
                    setFilters((prev) => ({ ...prev, endDate: date }));
                  }}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                />
              </Box>
              <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }, minWidth: 200 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Đối tượng</InputLabel>
                  <Select
                    value={filters.reportTarget}
                    onChange={(e) => {
                      setFilters((prev) => ({ ...prev, reportTarget: e.target.value as ReportTarget }));
                    }}
                    label="Đối tượng">
                    <MenuItem value={ReportTarget.None}>Tất cả</MenuItem>
                    <MenuItem value={ReportTarget.Customer}>Khách hàng</MenuItem>
                    <MenuItem value={ReportTarget.Store}>Cửa hàng</MenuItem>
                    <MenuItem value={ReportTarget.Shipper}>Người giao hàng</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Paper>

          {/* Reports Table */}
          <CustomTable
            data={reports}
            totalCount={totalCount}
            columns={columns}
            onPageChange={handlePageChange}
            headerTitle="Danh sách báo cáo"
            description="Quản lý các báo cáo về đơn hàng"
            showSearch={false}
            showBulkActions={false}
            showExport={false}
            itemsPerPage={pageSize}
          />

          {/* Report Detail Modal */}
          <Dialog
            open={isDetailModalOpen}
            onClose={handleCloseDetailModal}
            maxWidth="lg"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 2,
                maxHeight: "90vh",
                bgcolor: "background.paper",
              },
            }}>
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                pr: 1,
                bgcolor: "background.paper",
                borderBottom: 1,
                borderColor: "divider",
              }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Warning sx={{ fontSize: 24 }} />
                <Typography variant="h6" fontWeight={600}>
                  Chi tiết báo cáo
                </Typography>
              </Box>
              <IconButton onClick={handleCloseDetailModal} size="small" sx={{ color: "text.secondary" }}>
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              {orderDetails && (
                <Box>
                  {/* Report Section */}
                  {orderDetails.report && (
                    <Box sx={{ p: 3, bgcolor: "background.paper" }}>
                      <Typography variant="h6" gutterBottom sx={{ color: "grey.900", fontWeight: 600 }}>
                        Thông tin báo cáo
                      </Typography>
                      <Card sx={{ mb: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{ color: "error.main", fontWeight: 600 }}>
                            {orderDetails.report.title}
                          </Typography>
                          <Typography variant="body1" paragraph sx={{ color: "grey.800", lineHeight: 1.6 }}>
                            {orderDetails.report.description}
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Đối tượng:
                              </Typography>
                              <Chip
                                icon={ReportTargetIcons[orderDetails.report.reportTarget as ReportTarget]}
                                label={ReportTargetLabels[orderDetails.report.reportTarget as ReportTarget]}
                                size="small"
                                color="primary"
                                variant="filled"
                              />
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Trạng thái:
                              </Typography>
                              <Chip
                                icon={orderDetails.report.isResolved ? <CheckCircle /> : <Warning />}
                                label={orderDetails.report.isResolved ? "Đã xử lý" : "Chờ xử lý"}
                                size="small"
                                color={orderDetails.report.isResolved ? "success" : "warning"}
                                variant="filled"
                              />
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Ngày tạo:
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {format(new Date(orderDetails.report.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  )}

                  {/* Order Details Section */}
                  <Box sx={{ p: 3, bgcolor: "background.paper" }}>
                    <Typography variant="h6" gutterBottom sx={{ color: "grey.900", fontWeight: 600, mb: 2 }}>
                      Thông tin đơn hàng
                    </Typography>
                    {isLoadingOrder ? (
                      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                        <CircularProgress size={32} />
                      </Box>
                    ) : orderDetails ? (
                      <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                        <CardContent>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
                            <Box sx={{ flex: 1, minWidth: 200 }}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Mã đơn hàng
                              </Typography>
                              <Typography
                                variant="body1"
                                fontFamily="monospace"
                                sx={{
                                  bgcolor: "grey.100",
                                  p: 1,
                                  borderRadius: 1,
                                  border: "1px solid",
                                  borderColor: "grey.200",
                                }}>
                                {orderDetails.id}
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 200 }}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Tổng tiền
                              </Typography>
                              <Typography variant="h6" color="primary.main" fontWeight={600}>
                                {orderDetails.totalPrice?.toLocaleString("vi-VN")} VNĐ
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 200 }}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Phí giao hàng
                              </Typography>
                              <Typography variant="body1" color="text.secondary">
                                {orderDetails.shippingFee?.toLocaleString("vi-VN")} VNĐ
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                            <Chip label={`Trạng thái: ${getStatusText(orderDetails.status)}`} color="info" variant="outlined" sx={{ fontWeight: 500 }} />
                            <Chip
                              label={`Thanh toán: ${getPaymentStatusText(orderDetails.paymentStatus, orderDetails.paymentMethod)}`}
                              color="secondary"
                              variant="outlined"
                              sx={{ fontWeight: 500 }}
                            />
                            <Chip
                              label={`Ngày tạo: ${orderDetails.createAt ? format(new Date(orderDetails.createAt), "dd/MM/yyyy", { locale: vi }) : "Không rõ"}`}
                              color="default"
                              variant="outlined"
                              sx={{ fontWeight: 500 }}
                            />
                          </Box>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                            <Box sx={{ flex: 1, minWidth: 250, p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                <Person sx={{ color: "primary.main", fontSize: 20 }} />
                                <Typography variant="subtitle1" fontWeight={600} color="primary.main">
                                  Khách hàng
                                </Typography>
                              </Box>
                              <Typography variant="body1" fontWeight={500}>
                                {orderDetails.user?.fullName || "Không có thông tin"}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {orderDetails.user?.phoneNumber || "Không có số điện thoại"}
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 250, p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                <Store sx={{ color: "secondary.main", fontSize: 20 }} />
                                <Typography variant="subtitle1" fontWeight={600} color="secondary.main">
                                  Cửa hàng
                                </Typography>
                              </Box>
                              <Typography variant="body1" fontWeight={500}>
                                {orderDetails.store?.name || "Không có thông tin"}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {orderDetails.store?.phoneNumber || "Không có số điện thoại"}
                              </Typography>
                            </Box>
                            {orderDetails.shipper?.id && (
                              <Box sx={{ flex: 1, minWidth: 250, p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                  <LocalShipping sx={{ color: "warning.main", fontSize: 20 }} />
                                  <Typography variant="subtitle1" fontWeight={600} color="warning.main">
                                    Người giao hàng
                                  </Typography>
                                </Box>
                                <Typography variant="body1" fontWeight={500}>
                                  {orderDetails.shipper.fullName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {orderDetails.shipper.phoneNumber || "Không có số điện thoại"}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          {orderDetails.orderItems && orderDetails.orderItems.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: "grey.900", mb: 2 }}>
                                Sản phẩm trong đơn hàng ({orderDetails.orderItems.length})
                              </Typography>
                              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                {orderDetails.orderItems.map((item, index) => (
                                  <Card
                                    key={index}
                                    sx={{
                                      border: "1px solid",
                                      borderColor: "grey.200",
                                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                      "&:hover": {
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                      },
                                    }}>
                                    <CardContent sx={{ p: 2 }}>
                                      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                                        {item.image && (
                                          <Box
                                            sx={{
                                              width: 80,
                                              height: 80,
                                              borderRadius: 1,
                                              overflow: "hidden",
                                              border: "1px solid",
                                              borderColor: "grey.200",
                                              flexShrink: 0,
                                            }}>
                                            <img
                                              src={item.image.thumbUrl || item.image.url}
                                              alt={item.productName}
                                              style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                              }}
                                              onError={(e) => {
                                                e.currentTarget.src = "/placeholder-image.png";
                                              }}
                                            />
                                          </Box>
                                        )}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                          <Typography
                                            variant="subtitle2"
                                            fontWeight={600}
                                            gutterBottom
                                            sx={{
                                              color: "grey.900",
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              display: "-webkit-box",
                                              WebkitLineClamp: 2,
                                              WebkitBoxOrient: "vertical",
                                            }}>
                                            {item.productName}
                                          </Typography>
                                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1 }}>
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
                                                {item.price?.toLocaleString("vi-VN")} VNĐ
                                              </Typography>
                                            </Box>
                                            <Box>
                                              <Typography variant="caption" color="text.secondary" display="block">
                                                Thành tiền
                                              </Typography>
                                              <Typography variant="body2" fontWeight={600} color="error.main">
                                                {(item.price * item.quantity)?.toLocaleString("vi-VN")} VNĐ
                                              </Typography>
                                            </Box>
                                          </Box>
                                          {item.addtionalData && item.addtionalData.length > 0 && (
                                            <Box sx={{ mt: 1 }}>
                                              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                                Thông tin thêm:
                                              </Typography>
                                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                                {item.addtionalData.map((data, dataIndex) => (
                                                  <Chip
                                                    key={dataIndex}
                                                    label={`${data.key}: ${data.value}`}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontSize: "0.75rem", height: 24 }}
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
                      <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                        <CardContent sx={{ textAlign: "center", py: 4 }}>
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
            {orderDetails && orderDetails.report && !orderDetails.report.isResolved && (
              <DialogActions>
                <Button onClick={handleOpenConfirmModal} color="primary" variant="contained" startIcon={<CheckCircleOutline />}>
                  Xử lý
                </Button>
              </DialogActions>
            )}
          </Dialog>

          <Dialog open={isConfirmModalOpen} onClose={handleCloseConfirmModal} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: "background.paper" } }}>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pr: 1, bgcolor: "background.paper" }}>
              Xác nhận xử lý
              <IconButton onClick={handleCloseConfirmModal} size="small" sx={{ color: "text.secondary" }}>
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ bgcolor: "background.paper" }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Bạn muốn xử lý báo cáo này như thế nào?
              </Typography>
            </DialogContent>
            <DialogActions sx={{ gap: 1, p: 2, bgcolor: "background.paper" }}>
              <Button onClick={handleCloseConfirmModal} color="inherit" variant="outlined">
                Hủy
              </Button>
              <Button onClick={() => selectedReport && handleResolveReport(selectedReport.id, false)} color="success" variant="contained">
                Xử lý (Không thêm cảnh cáo)
              </Button>
              <Button onClick={() => selectedReport && handleResolveReport(selectedReport.id, true)} color="warning" variant="contained">
                Xử lý & Thêm cảnh cáo
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
        a
      </Box>
    </LocalizationProvider>
  );
}
