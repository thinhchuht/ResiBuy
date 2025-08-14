import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Paper,
  Skeleton,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useParams } from "react-router-dom";
import axios from "../../../api/base.api";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DateRangeIcon from "@mui/icons-material/DateRange";
import EventIcon from "@mui/icons-material/Event";

// Đăng ký các thành phần của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

type ChartEntry = { [label: string]: number };
type ChartDataResponse = ChartEntry[];

interface ChartCardProps {
  title: string;
  data: any;
  loading: boolean;
  icon: React.ReactNode;
  color: string;
  period: string;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  data,
  loading,
  icon,
  color,
  period,
}) => {
  const theme = useTheme();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: alpha(theme.palette.background.paper, 0.95),
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: alpha(color, 0.3),
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context: any) => {
            return `Doanh thu: ${context.parsed.y.toLocaleString("vi-VN")} VND`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: alpha(theme.palette.divider, 0.2),
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            size: 11,
          },
          callback: (value: any) => {
            return `${(value / 1000000).toFixed(1)}M`;
          },
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        borderRadius: 3,
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 8px 32px ${alpha(color, 0.15)}`,
          border: `1px solid ${alpha(color, 0.3)}`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: alpha(color, 0.1),
                color: color,
              }}
            >
              {icon}
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="600" color="text.primary">
                {title}
              </Typography>
              <Chip
                label={period}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.75rem",
                  backgroundColor: alpha(color, 0.1),
                  color: color,
                  border: "none",
                }}
                variant="outlined"
              />
            </Box>
          </Box>
        </Box>

        {/* Chart Content */}
        <Box sx={{ height: 280 }}>
          {loading ? (
            <Box>
              <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" width="100%" height={200} />
              <Box display="flex" justifyContent="space-between" mt={2}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} variant="text" width={40} height={20} />
                ))}
              </Box>
            </Box>
          ) : data ? (
            <Line data={data} options={chartOptions} />
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
              color="text.secondary"
            >
              <TrendingUpIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
              <Typography variant="body2">Không có dữ liệu</Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const ChartView: React.FC = () => {
  const [weekData, setWeekData] = useState<any>(null);
  const [monthData, setMonthData] = useState<any>(null);
  const [yearData, setYearData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { storeId } = useParams<{ storeId: string }>();
  const theme = useTheme();

  const fetchChartData = async (
    startDate: Date,
    endDate: Date,
    setState: React.Dispatch<React.SetStateAction<any>>,
    color: string
  ) => {
    try {
      const params = {
        storeId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      const res = await axios.get<ApiResponse<ChartDataResponse>>(
        "/api/Store/get-chart-data",
        { params }
      );

      if (res.data.code === 0 && res.data.data) {
        const labels = res.data.data.map((item) => Object.keys(item)[0]);
        const values = res.data.data.map((item) => Object.values(item)[0]);

        setState({
          labels,
          datasets: [
            {
              label: "Doanh thu",
              data: values,
              borderColor: color,
              backgroundColor: alpha(color, 0.1),
              borderWidth: 3,
              pointBackgroundColor: color,
              pointBorderColor: "#ffffff",
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
              tension: 0.4,
              fill: true,
            },
          ],
        });
      } else {
        console.error("API trả về lỗi:", res.data.message);
      }
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
    }
  };

  useEffect(() => {
    const today = new Date();
    setLoading(true);

    // Đầu tuần (thứ 2)
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7));

    // Đầu tháng
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Đầu năm
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

    const colors = {
      week: "#1976d2",
      month: "#ed6c02",
      year: "#2e7d32",
    };

    Promise.all([
      fetchChartData(firstDayOfWeek, today, setWeekData, colors.week),
      fetchChartData(firstDayOfMonth, today, setMonthData, colors.month),
      fetchChartData(firstDayOfYear, today, setYearData, colors.year),
    ]).finally(() => {
      setLoading(false);
    });
  }, [storeId]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.1
          )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            }}
          >
            <TrendingUpIcon fontSize="large" />
          </Box>
          <Box>
            <Typography
              variant="h3"
              fontWeight="700"
              color="text.primary"
              gutterBottom
            >
              Thống kê doanh thu
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Theo dõi hiệu suất kinh doanh theo thời gian thực
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Charts Container - Hiển thị theo 3 dòng */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {/* Biểu đồ tuần - Dòng 1 */}
        <ChartCard
          title="Tuần này"
          data={weekData}
          loading={loading}
          icon={<CalendarTodayIcon />}
          color="#1976d2"
          period="7 ngày"
        />

        {/* Biểu đồ tháng - Dòng 2 */}
        <ChartCard
          title="Tháng này"
          data={monthData}
          loading={loading}
          icon={<DateRangeIcon />}
          color="#ed6c02"
          period="30 ngày"
        />

        {/* Biểu đồ năm - Dòng 3 */}
        <ChartCard
          title="Năm này"
          data={yearData}
          loading={loading}
          icon={<EventIcon />}
          color="#2e7d32"
          period="365 ngày"
        />
      </Box>
    </Container>
  );
};

export default ChartView;
