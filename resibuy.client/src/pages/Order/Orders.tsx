import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Pagination,
} from "@mui/material";
import { useState, useEffect, useMemo, useCallback } from "react";
import { styled } from "@mui/material/styles";
import OrderCard, { type OrderApiResult } from "./OrderCard";
import { OrderStatus, PaymentMethod, PaymentStatus } from "../../types/models";
import orderApi from "../../api/order.api";
import { useAuth } from "../../contexts/AuthContext";
import { HubEventType, useEventHub } from "../../hooks/useEventHub";
import { Link } from "react-router-dom";
import Breadcrumbs from '@mui/material/Breadcrumbs';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

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
  OrderStatus.Shipped,
  OrderStatus.Delivered,
  OrderStatus.Cancelled,
];

const Orders = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<OrderApiResult[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 5;
  const { user } = useAuth();

  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await orderApi.getAll(
        orderStatusTabs[currentTab],
        PaymentMethod.None,
        PaymentStatus.None,
        user.id,
        page,
        ordersPerPage
      );
      setOrders(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      setOrders([]);
      setTotalPages(1);
    }
  }, [user?.id, page, currentTab]);

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

  const filteredOrders = useMemo(() => {
    return orders;
  }, [orders]);

  const handleOrderStatusChanged = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data: any) => {
      if (currentTab === 0) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === data.order.id
              ? {
                  ...order,
                  status: data.order.status as OrderStatus,
                  paymentStatus: data.order.paymentStatus as PaymentStatus,
                }
              : order
          )
        );
      } else if (orderStatusTabs[currentTab] === data.oldStatus) {
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order.id !== data.order.id)
        );
      } else if (orderStatusTabs[currentTab] === data.order.status) {
        fetchOrders();
      }
    },
    [currentTab, fetchOrders]
  );

  const eventHandlers = useMemo(
    () => ({
      [HubEventType.OrderStatusChanged]: handleOrderStatusChanged,
    }),
    [handleOrderStatusChanged]
  );
  useEventHub(eventHandlers);

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
          '& .MuiBreadcrumbs-separator': { color: '#bdbdbd' }
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#1976d2',
            fontWeight: 600
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
        <StyledTabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <StyledTab label="Tất cả" />
          <StyledTab label="Chờ xác nhận" />
          <StyledTab label="Đang xử lý" />
          <StyledTab label="Đang giao" />
          <StyledTab label="Đã giao" />
          <StyledTab label="Đã hủy" />
        </StyledTabs>

        <Box sx={{ p: 3 }}>
          {filteredOrders.length > 0 ? (
            <>
              {filteredOrders.map((order) => (
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
