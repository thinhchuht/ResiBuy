import { Box, Container, Typography, Paper, Tabs, Tab, Pagination, Chip } from "@mui/material";
import { useState } from "react";
import { styled } from "@mui/material/styles";
import OrderCard from "./components/OrderCard";
import { fakeOrders } from "../../fakeData/fakeOrderData";
import { OrderStatus, PaymentStatus } from "../../types/models";

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
  const ordersPerPage = 5;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const getFilteredOrders = () => {
    switch (currentTab) {
      case 0: // Tất cả
        return fakeOrders;
      case 1: // Chờ xác nhận
        return fakeOrders.filter((order) => order.status === OrderStatus.Pending);
      case 2: // Đang xử lý
        return fakeOrders.filter((order) => order.status === OrderStatus.Processing);
      case 3: // Đang giao
        return fakeOrders.filter((order) => order.status === OrderStatus.Shipped);
      case 4: // Đã giao
        return fakeOrders.filter((order) => order.status === OrderStatus.Delivered);
      case 5: // Đã hủy
        return fakeOrders.filter((order) => order.status === OrderStatus.Cancelled);
      default:
        return fakeOrders;
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.Paid:
        return "#4CAF50";
      case PaymentStatus.Pending:
        return "#FFA500";
      case PaymentStatus.Failed:
        return "#F44336";
      case PaymentStatus.Refunded:
        return "#2196F3";
      default:
        return "#666";
    }
  };

  const getPaymentStatusText = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.Paid:
        return "Đã thanh toán";
      case PaymentStatus.Pending:
        return "Chờ thanh toán";
      case PaymentStatus.Failed:
        return "Thanh toán thất bại";
      case PaymentStatus.Refunded:
        return "Đã hoàn tiền";
      default:
        return "Không xác định";
    }
  };

  const filteredOrders = getFilteredOrders();
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const currentOrders = filteredOrders.slice((page - 1) * ordersPerPage, page * ordersPerPage);

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
          {currentOrders.length > 0 ? (
            <>
              {currentOrders.map((order) => (
                <Box key={order.id} sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
                    <Chip
                      label={getPaymentStatusText(order.paymentStatus)}
                      sx={{
                        backgroundColor: `${getPaymentStatusColor(order.paymentStatus)}15`,
                        color: getPaymentStatusColor(order.paymentStatus),
                        fontWeight: 600,
                        height: 32,
                      }}
                    />
                  </Box>
                  <OrderCard order={order} />
                </Box>
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
