import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Pagination,
  TextField,
  Stack,
  InputAdornment,
  Button,
} from "@mui/material";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { styled } from "@mui/material/styles";
import OrderCard, { type OrderApiResult } from "./OrderCard";
import { OrderStatus, PaymentMethod, PaymentStatus } from "../../types/models";
import orderApi from "../../api/order.api";
import { useAuth } from "../../contexts/AuthContext";
import {
  HubEventType,
  useEventHub,
  type HubEventHandler,
} from "../../hooks/useEventHub";
import { Link } from "react-router-dom";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import type { OrderStatusChangedData } from "../../types/hubData";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import type { ReportCreatedDto, ReportResolvedDto } from "../../types/hubEventDto";

const StyledTabs = styled(Tabs)({
  borderBottom: "1px solid #e8e8e8",
  "& .MuiTabs-indicator": {
    backgroundColor: "#FF385C",
  },
});

const StyledTab = styled(Tab)({
  textTransform: "none",
  fontWeight: 600,
  fontSize: "1rem",
  minWidth: 0,
  padding: "12px 24px",
  color: "#666",
  "&.Mui-selected": {
    color: "#FF385C",
  },
});

const orderStatusTabs = [
  OrderStatus.None,
  OrderStatus.Pending,
  OrderStatus.Processing,
  OrderStatus.Assigned,
  OrderStatus.Shipped,
  OrderStatus.CustomerNotAvailable,
  OrderStatus.Delivered,
  OrderStatus.Cancelled,
  OrderStatus.Reported, // Thêm trạng thái bị tố cáo
];

const Orders = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<OrderApiResult[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 5;
  const { user } = useAuth();

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const currentTabRef = useRef(currentTab);
  useEffect(() => {
    currentTabRef.current = currentTab;
  }, [currentTab]);

  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await orderApi.getAll(
        orderStatusTabs[currentTab],
        PaymentMethod.None,
        PaymentStatus.None,
        undefined, // storeId
        user.id,
        undefined, // shipperId
        page,
        ordersPerPage,
        startDate || undefined,
        endDate || undefined
      );
      setOrders(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      setOrders([]);
      setTotalPages(1);
    }
  }, [user?.id, page, currentTab, startDate, endDate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setPage(1);
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleOrderAddressChange = (
    orderId: string,
    area: string,
    building: string,
    room: string,
    roomId: string
  ) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              roomQueryResult: {
                ...order.roomQueryResult,
                areaName: area,
                buildingName: building,
                name: room,
                id: roomId,
              },
            }
          : order
      )
    );
  };

  const handleOrderReported = useCallback(
    (data: ReportCreatedDto) => {
      console.log("data", data);
      if (currentTabRef.current === 0) {
        setOrders((prevOrders) => {
          const updatedOrders = prevOrders.map((order) =>
            order.id === data.orderId
              ? {
                  ...order,
                  status: OrderStatus.Reported,
                  paymentStatus: PaymentStatus.Failed,
                  report: {
                    id: data.id,
                    title: data.title,
                    description: data.description,
                    isResolved: false,
                    createdAt: data.createdAt,
                    orderId: data.orderId,
                    createdById: data.createdById,
                    targetId: data.targetId,
                    reportTarget: data.reportTarget
                  }
                }
              : order
          );
          
          const reportedIndex = updatedOrders.findIndex(order => order.id === data.orderId);
          if (reportedIndex > 0) {
            const [reportedOrder] = updatedOrders.splice(reportedIndex, 1);
            return [reportedOrder, ...updatedOrders];
          }
          return updatedOrders;
        });
      } else if (
        orderStatusTabs[currentTabRef.current] !== OrderStatus.Reported
      ) {
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order.id !== data.orderId)
        );
      } else if (orderStatusTabs[currentTabRef.current] === OrderStatus.Reported) {
        fetchOrders();
      }
    },
    [fetchOrders]
  );
  const handleReportResolved = useCallback(
    (data: ReportResolvedDto) => {
      console.log("Report resolved data:", data);
      
      setOrders((prevOrders) => {
        // Find if the reported order exists in current state
        const orderIndex = prevOrders.findIndex(order => 
          order.id === data.orderId && order.report?.id === data.id
        );
        
        if (orderIndex >= 0) {
          // If order with report is found, update its isResolved status
          const updatedOrders = [...prevOrders];
          updatedOrders[orderIndex] = {
            ...updatedOrders[orderIndex],
            report: {
              ...updatedOrders[orderIndex].report!,
              isResolved: true
            }
          };
          return updatedOrders;
        }
        
        return prevOrders;
      });
    },
    []
  );

  const handleOrderStatusChanged = useCallback(
    (data: OrderStatusChangedData) => {
      console.log("data", data);
      if (currentTabRef.current === 0) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === data.id
              ? {
                  ...order,
                  status: data.orderStatus as OrderStatus,
                  paymentStatus: data.paymentStatus as PaymentStatus,
                  updatedAt: data.updatedAt,
                }
              : order
          )
        );
      } else if (
        orderStatusTabs[currentTabRef.current] === data.oldOrderStatus
      ) {
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order.id !== data.id)
        );
      } else if (orderStatusTabs[currentTabRef.current] === data.orderStatus) {
        fetchOrders();
      }
    },
    [fetchOrders]
  );

  const handleReceiveOrderNotification = useCallback((data: unknown) => {
    const currentTabStatus = orderStatusTabs[currentTabRef.current];
    
    if (currentTabStatus === OrderStatus.Assigned) {
      // In Assigned tab, just refresh the list
      fetchOrders();
    } else if (currentTabStatus === OrderStatus.None) {
      const notificationData = data as Record<string, unknown>;
      const orderId = notificationData.orderId as string | undefined;
      
      if (orderId) {
        setOrders((prevOrders) => {
          const existingOrderIndex = prevOrders.findIndex(o => o.id === orderId);
          
          if (existingOrderIndex >= 0) {
            const updatedOrder = {
              ...prevOrders[existingOrderIndex],
              status: OrderStatus.Assigned
            };
            return [
              updatedOrder,
              ...prevOrders.slice(0, existingOrderIndex),
              ...prevOrders.slice(existingOrderIndex + 1)
            ];
          } else {
            fetchOrders();
            return prevOrders;
          }
        });
      } else {
        fetchOrders();
      }
    }
  }, [fetchOrders]);

  const eventHandlers = useMemo(
    () => ({
      [HubEventType.OrderStatusChanged]: handleOrderStatusChanged,
      [HubEventType.OrderReported]: handleOrderReported,
      [HubEventType.ReportResolved]: handleReportResolved,
      [HubEventType.ReceiveOrderNotification]: handleReceiveOrderNotification,
    }),
    [handleOrderStatusChanged, handleOrderReported, handleReportResolved, handleReceiveOrderNotification]
  );
  useEventHub(eventHandlers as Partial<Record<HubEventType, HubEventHandler>>);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{
          mb: 3,
          fontSize: 20,
          color: "#2c3e50",
          fontWeight: 500,
          "& .MuiBreadcrumbs-separator": { color: "#bdbdbd" },
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            color: "#1976d2",
            fontWeight: 600,
          }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Trang chủ
        </Link>
        <Typography color="#2c3e50" fontWeight={700}>
          Đơn hàng của bạn
        </Typography>
      </Breadcrumbs>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid #e8e8e8",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            px: { xs: 1, sm: 3 },
            pt: 3,
            pb: 0,
            background: "#fafbfc",
            borderBottom: "1px solid #f0f0f0",
            mb: 1,
            gap: 2,
            overflowX: "auto",
          }}
        >
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <StyledTabs
              value={currentTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ minHeight: 48, minWidth: 0 }}
            >
              <StyledTab label="Tất cả" />
              <StyledTab label="Chờ xác nhận" />
              <StyledTab label="Đã xác nhận" />
              <StyledTab label="Đang lấy hàng" />
              <StyledTab label="Đang giao" />
              <StyledTab label="Chờ nhận" />
              <StyledTab label="Đã giao" />
              <StyledTab label="Đã hủy" />
              <StyledTab label="Bị tố cáo" /> {/* Thêm label cho tab mới */}
            </StyledTabs>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            px: { xs: 1, sm: 3 },
            py: 2,
            borderRadius: 3,
            boxShadow: "0 2px 12px 0 rgba(33,150,243,0.07)",
            mb: 2,
            gap: 2,
            overflowX: "auto",
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="flex-end"
            sx={{ minWidth: 0, flexShrink: 0 }}
          >
            <TextField
              label="Từ ngày"
              type="date"
              size="small"
              InputLabelProps={{
                shrink: true,
                sx: { fontWeight: 500, color: "#1976d2" },
              }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              sx={{
                minWidth: 140,
                borderRadius: 3,
                background: "#fff",
                boxShadow: "0 1px 6px 0 #e3f2fd",
                "& .MuiOutlinedInput-root": { borderRadius: 3 },
              }}
              inputProps={{ style: { borderRadius: 12 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarTodayIcon
                      fontSize="small"
                      sx={{ color: "#1976d2" }}
                    />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Đến ngày"
              type="date"
              size="small"
              InputLabelProps={{
                shrink: true,
                sx: { fontWeight: 500, color: "#1976d2" },
              }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              sx={{
                minWidth: 140,
                borderRadius: 3,
                background: "#fff",
                boxShadow: "0 1px 6px 0 #e3f2fd",
                "& .MuiOutlinedInput-root": { borderRadius: 3 },
              }}
              inputProps={{ style: { borderRadius: 12 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarTodayIcon
                      fontSize="small"
                      sx={{ color: "#1976d2" }}
                    />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              color="primary"
              size="small"
              sx={{
                borderRadius: 99,
                minWidth: 90,
                fontWeight: 600,
                ml: 1,
                whiteSpace: "nowrap",
                background: "#e3f2fd",
                borderColor: "#90caf9",
                color: "#1976d2",
                transition: "all 0.2s",
                "&:hover": {
                  background: "#bbdefb",
                  borderColor: "#42a5f5",
                },
              }}
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              disabled={!startDate && !endDate}
            >
              Xóa lọc
            </Button>
          </Stack>
        </Box>
        <Box sx={{ p: 3 }}>
          {orders.length > 0 ? (
            <>
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdate={() => setPage(1)}
                  onAddressChange={handleOrderAddressChange}
                />
              ))}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 4,
                }}
              >
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  siblingCount={1}
                  boundaryCount={1}
                  sx={{
                    "& .MuiPaginationItem-root": {
                      fontSize: "1rem",
                    },
                    "& .Mui-selected": {
                      backgroundColor: "#FF385C !important",
                      color: "white",
                    },
                  }}
                />
              </Box>
            </>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 8,
              }}
            >
              <Typography variant="h6" sx={{ color: "#666", mb: 2 }}>
                Không có đơn hàng nào
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Orders;
