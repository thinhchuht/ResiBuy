import { Box, Container, Typography, Paper, Tabs, Tab, Pagination } from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import { styled } from "@mui/material/styles";
import OrderCard, { type OrderApiResult } from "./OrderCard";
import { OrderStatus, PaymentMethod, PaymentStatus } from "../../types/models";
import orderApi from "../../api/order.api";
import { useAuth } from "../../contexts/AuthContext";

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

const Orders = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<OrderApiResult[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 5;
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;
      try {
        const data = await orderApi.getAll(
          currentTab === 0 ? OrderStatus.None :
          currentTab === 1 ? OrderStatus.Pending :
          currentTab === 2 ? OrderStatus.Processing :
          currentTab === 3 ? OrderStatus.Shipped :
          currentTab === 4 ? OrderStatus.Delivered :
          currentTab === 5 ? OrderStatus.Cancelled : OrderStatus.None,
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
    };
    fetchOrders();
  }, [user?.id, page, currentTab]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleOrderAddressChange = (orderId: string, area: string, building: string, room: string, roomId: string) => {
    setOrders((prevOrders) => prevOrders.map(order =>
      order.id === orderId
        ? {
            ...order,
            roomQueryResult: {
              ...order.roomQueryResult,
              areaName: area,
              buildingName: building,
              name: room,
              id: roomId
            }
          }
        : order
    ));
  };

  const filteredOrders = useMemo(() => {
    return orders;
  }, [orders]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: "#2c3e50",
          mb: 4,
          textAlign: "center",
        }}>
        Tất cả đơn hàng
      </Typography>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid #e8e8e8",
        }}>
        <StyledTabs value={currentTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
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
                <OrderCard key={order.id} order={order} onUpdate={() => setPage(1)} onAddressChange={handleOrderAddressChange} />
              ))}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 4,
                }}>
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
              }}>
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
