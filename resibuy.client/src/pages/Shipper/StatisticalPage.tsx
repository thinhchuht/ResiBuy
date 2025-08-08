import { useEffect, useState } from "react";
import { Container, Divider, Grid, Paper, Typography } from "@mui/material";
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
import FilterPanel from "../../components/shipper/statistical/FilterPanel";
import OrderList from "../../components/shipper/statistical/OrderList";

// Đăng ký chart components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface ChartData {
  date: string;
  amount: number;
}

interface Order {
  id: string;
  store: string;
  amount: number;
  deliveredAt: string;
}

const formatDate = (date: Date): string => {
  // Chuyển sang giờ VN (UTC+7) bằng cách cộng thêm 7 tiếng
  const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return vnTime.toISOString().split("T")[0];
};

const getStartOfWeek = (): string => {
  const now = new Date();
  const day = now.getDay() || 7; // Chủ nhật = 0 -> thành 7
  now.setDate(now.getDate() - day + 1); // Trở về thứ 2 đầu tuần
  now.setHours(0, 0, 0, 0);
  return formatDate(now);
};

const getEndOfWeek = (): string => {
  const now = new Date();
  const day = now.getDay() || 7;
  now.setDate(now.getDate() - day + 7); // Trở về chủ nhật
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

const getEndOfYear = (): string => {
  const now = new Date();
  const end = new Date(now.getFullYear(), 11, 31);
  end.setHours(23, 59, 59, 999);
  return formatDate(end);
};

export default function IncomePage() {
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState<Date>(new Date());

  const [summary, setSummary] = useState({
    day: 0,
    week: 0,
    month: 0,
    year: 0,
  });

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchIncomeData = async () => {
    try {
      const shipperId = "543f9860-dc83-482c-a15e-3fc130d0546f"; // TODO: lấy từ Auth

      const [dayRes, weekRes, monthRes, yearRes] = await Promise.all([
        orderApi.getTotalShippingFeeshipper({
          shipperId,
          startDate: formatDate(new Date()),
          endDate: formatDate(new Date()),
        }),
        orderApi.getTotalShippingFeeshipper({
          shipperId,
          startDate: getStartOfWeek(),
          endDate: getEndOfWeek(),
        }),
        orderApi.getTotalShippingFeeshipper({
          shipperId,
          startDate: getStartOfMonth(),
          endDate: getEndOfMonth(),
        }),
        orderApi.getTotalShippingFeeshipper({
          shipperId,
          startDate: getStartOfYear(),
          endDate: getEndOfYear(),
        }),
      ]);

      setSummary({
        day: dayRes.data || 0,
        week: weekRes.data || 0,
        month: monthRes.data || 0,
        year: yearRes.data || 0,
      });

      // Giả lập dữ liệu biểu đồ
      setChartData([
        { date: "2025-08-01", amount: 300000 },
        { date: "2025-08-02", amount: 500000 },
        { date: "2025-08-03", amount: 450000 },
      ]);

      // Giả lập đơn hàng
      setOrders([
        {
          id: "OD001",
          store: "Cửa hàng A",
          amount: 35000,
          deliveredAt: "2025-08-01",
        },
        {
          id: "OD002",
          store: "Cửa hàng B",
          amount: 40000,
          deliveredAt: "2025-08-02",
        },
      ]);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu thu nhập:", error);
    }
  };

  useEffect(() => {
    fetchIncomeData();
  }, []);

  return (
    <Container>

      <FilterPanel
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onFilter={fetchIncomeData}
      />

      <Divider sx={{ my: 3 }} />

      {/* Thu nhập tổng quan */}
      <Grid container spacing={2}>
        {[
          { label: "Hôm nay", value: summary.day },
          { label: "Tuần này", value: summary.week },
          { label: "Tháng này", value: summary.month },
          { label: "Năm nay", value: summary.year },
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper elevation={3} sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6">{item.label}</Typography>
              <Typography variant="h5" color="primary">
                {item.value?.toLocaleString?.() || 0} đ
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Biểu đồ cột */}
      <Typography variant="h6" gutterBottom>
        Biểu đồ thu nhập
      </Typography>
      <Bar
        data={{
          labels: chartData.map((d) => d.date),
          datasets: [
            {
              label: "Thu nhập",
              data: chartData.map((d) => d.amount),
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

      <Divider sx={{ my: 3 }} />

      {/* Danh sách đơn hàng */}
      <Typography variant="h6">Đơn hàng đã giao</Typography>
      <OrderList orders={orders} />
    </Container>
  );
}
