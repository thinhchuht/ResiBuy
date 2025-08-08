import { useEffect, useState } from "react";
import {
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
  Box,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Toolbar,
  Stack,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import orderApi from "../../api/order.api";
import OrderList from "../../components/shipper/statistical/OrderList";
import { useAuth } from "../../contexts/AuthContext";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface ChartData {
  date: string;
  amount: number;
}

interface Order {
  id: string;
  store: string;
  amount: number;
  updateAt: string; // matches OrderList prop
}

interface Summary {
  day: number;
  week: number;
  month: number;
  year: number;
}

const formatDate = (date: Date): string => {
  const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return vnTime.toISOString().split("T")[0];
};

const getStartOfWeek = (): string => {
  const now = new Date();
  const day = now.getDay() || 7;
  now.setDate(now.getDate() - day + 1);
  now.setHours(0, 0, 0, 0);
  return formatDate(now);
};

const getEndOfWeek = (): string => {
  const now = new Date();
  const day = now.getDay() || 7;
  now.setDate(now.getDate() - day + 7);
  now.setHours(23, 59, 59, 999);
  return formatDate(now);
};

const getStartOfMonth = (): string => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  firstDay.setHours(0, 0, 0, 0);
  return formatDate(firstDay);
};

const getEndOfMonth = (): string => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  lastDay.setHours(23, 59, 59, 999);
  return formatDate(lastDay);
};

const getStartOfYear = (): string => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  start.setHours(0, 0, 0, 0);
  return formatDate(start);
};

const getToday = (): string => {
  return formatDate(new Date());
};

export default function IncomePage() {
  const [summary, setSummary] = useState<Summary>({
    day: 0,
    week: 0,
    month: 0,
    year: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // pagination
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  const { user } = useAuth();

  const fetchIncomeData = async () => {
    try {
      if (!user?.id) return;

      const [dayRes, weekRes, monthRes, yearRes] = await Promise.all([
        orderApi.getTotalShippingFeeshipper({
          shipperId: user.id,
          startDate: getToday(),
          endDate: getToday(),
        }),
        orderApi.getTotalShippingFeeshipper({
          shipperId: user.id,
          startDate: getStartOfWeek(),
          endDate: getEndOfWeek(),
        }),
        orderApi.getTotalShippingFeeshipper({
          shipperId: user.id,
          startDate: getStartOfMonth(),
          endDate: getEndOfMonth(),
        }),
        orderApi.getTotalShippingFeeshipper({
          shipperId: user.id,
          startDate: getStartOfYear(),
          endDate: getToday(),
        }),
      ]);

      setSummary({
        day: dayRes?.data || 0,
        week: weekRes?.data || 0,
        month: monthRes?.data || 0,
        year: yearRes?.data || 0,
      });
    } catch (error) {
      console.error("Error fetching income data:", error);
    }
  };

  const fetchChartData = async () => {
    try {
      if (!user?.id) return;

      const startOfWeek = new Date(getStartOfWeek());
      const tempData: ChartData[] = [];

      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + i);
        const dateStr = formatDate(currentDate);

        const res = await orderApi.getTotalShippingFeeshipper({
          shipperId: user.id,
          startDate: dateStr,
          endDate: dateStr,
        });

        tempData.push({
          date: dateStr,
          amount: Number(res?.data) || 0,
        });
      }

      setChartData(tempData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setChartData([]);
    }
  };

  /**
   * Fetch orders delivered today (paged)
   */
  const fetchTodayDeliveredOrders = async (page = 1, size = pageSize) => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const today = getToday();
      const resp = await orderApi.getAll(
        "Delivered",
        "None",
        "None",
        undefined,
        undefined,
        user.id,
        page,
        size,
        today,
        today
      );

      // normalize response shapes
      let items: {
        id: string;
        store?: { name?: string; title?: string } | string;
        storeName?: string;
        shippingFee?: number;
        totalAmount?: number;
        deliveredAt?: string;
        updateAt?: string;
        updatedAt?: string;
        createdAt?: string;
      }[] = [];
      let total = 0;
      if (!resp) {
        items = [];
        total = 0;
      } else if (Array.isArray(resp)) {
        items = resp;
        total = resp.length;
      } else if (resp.items && Array.isArray(resp.items)) {
        items = resp.items;
        total =
          typeof resp.totalCount === "number"
            ? resp.totalCount
            : resp.items.length;
      } else if (
        resp.data &&
        resp.data.items &&
        Array.isArray(resp.data.items)
      ) {
        items = resp.data.items;
        total =
          typeof resp.data.totalCount === "number"
            ? resp.data.totalCount
            : resp.data.items.length;
      } else if (resp.data && Array.isArray(resp.data)) {
        items = resp.data;
        total = resp.data.length;
      } else {
        items = [];
        total = 0;
      }

      const mapped: Order[] = items.map((o: {
        id: string;
        store?: { name?: string; title?: string } | string;
        storeName?: string;
        shippingFee?: number;
        totalAmount?: number;
        deliveredAt?: string;
        updateAt?: string;
        updatedAt?: string;
        createdAt?: string;
      }) => ({
        id: o.id,
        store:
          (typeof o.store === "object"
            ? (o.store.name || o.storeName)
            : o.store) ||
          o.storeName ||
          (typeof o.store === "object" ? o.store?.title : undefined) ||
          "Unknown Store",
        amount:
          typeof o.shippingFee === "number"
            ? o.shippingFee
            : o.totalAmount || 0,
        updateAt:
          o.deliveredAt || o.updateAt || o.updatedAt || o.createdAt || "",
      }));

      // filter to today's date only
      const filtered = mapped.filter((m) => {
        if (!m.updateAt) return false;
        const d = new Date(m.updateAt);
        if (isNaN(d.getTime())) return false;
        return formatDate(d) === today;
      });

      setOrders(filtered);
      setTotalCount(total);
    } catch (error) {
      console.error("Error fetching today's orders:", error);
      setOrders([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchIncomeData();
      fetchChartData();
      fetchTodayDeliveredOrders(pageNumber, pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pageNumber, pageSize]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => setPageNumber(value);
  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<{ value: unknown }> | any
  ) => {
    const newSize = Number(event.target.value);
    setPageSize(newSize);
    setPageNumber(1); // reset to first page
  };

  return (
    <Container>
      {/* Header / Toolbar */}
      <Toolbar disableGutters sx={{ justifyContent: "space-between", mb: 2 }}>
        <Stack direction="column" spacing={0.5}>
          <Typography variant="h5">Thống kê thu nhập</Typography>
        </Stack>

        <Card elevation={2} sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="subtitle2">Tổng thu hôm nay</Typography>
            <Typography variant="h6" color="primary">
              {summary.day?.toLocaleString?.() || 0} đ
            </Typography>
          </CardContent>
        </Card>
      </Toolbar>

      <Divider sx={{ my: 3 }} />

      {/* Income Summary - make all cards same height */}
      <Grid container spacing={2} alignItems="stretch" sx={{ mb: 2 }}>
        {[
          { label: "Hôm nay", value: summary.day, icon: "📅" },
          { label: "Tuần này", value: summary.week, icon: "🗓️" },
          { label: "Tháng này", value: summary.month, icon: "📈" },
          { label: "Năm nay", value: summary.year, icon: "💰" },
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              elevation={2}
              sx={{
                height: "100%", // important: stretch to fill grid row height
                minHeight: 150, // ensures cards aren't too short
                p: 2,
                display: "flex",
                alignItems: "center",
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 2,
                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                  borderRadius: 1,
                  fontSize: 28,
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" noWrap>
                  {item.label}
                </Typography>
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{
                    mt: 0.5,
                    fontWeight: 700,
                    fontSize: { xs: "1.0rem", sm: "1.15rem", md: "1.2rem" },
                  }}
                >
                  {typeof item.value === "number"
                    ? item.value.toLocaleString() + " đ"
                    : item.value}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Bar Chart */}
      <Typography variant="h6" gutterBottom>
        Thu nhập tuần này
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Bar
          data={{
            labels: chartData.length ? chartData.map((d) => d.date) : [],
            datasets: [
              {
                label: "Thu nhập",
                data: chartData.length ? chartData.map((d) => d.amount) : [],
                backgroundColor: "#1976d2",
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: true,
                position: "top",
              },
            },
          }}
        />
      </Paper>

      <Divider sx={{ my: 2 }} />

      {/* Orders - Today */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography variant="h6">Đơn hàng đã giao (Hôm nay)</Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="page-size-label">Số / trang</InputLabel>
            <Select
              labelId="page-size-label"
              value={pageSize}
              label="Số / trang"
              onChange={handlePageSizeChange}
            >
              {[5, 10, 20, 50].map((n) => (
                <MenuItem value={n} key={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      <Paper>
        {isLoading ? (
          <Box p={4} display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : orders.length === 0 ? (
          <Box p={4}>
            <Typography>Không có đơn hàng nào trong ngày hôm nay.</Typography>
          </Box>
        ) : (
          <>
            <OrderList orders={orders} />

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              p={2}
            >
              <Typography variant="body2">
                Hiển thị {orders.length} trên {totalCount} kết quả
              </Typography>

              {totalPages > 1 && (
                <Pagination
                  count={totalPages}
                  page={pageNumber}
                  onChange={handlePageChange}
                />
              )}
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}
