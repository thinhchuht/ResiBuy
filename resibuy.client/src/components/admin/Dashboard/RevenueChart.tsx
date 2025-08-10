import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Menu,
  MenuItem,
} from "@mui/material";
import { MoreHoriz } from "@mui/icons-material";
import { useState } from "react";
import { formatCurrency, formatCurrencyShort } from "./seg/utils";
import type { TooltipProps } from "../../../types/models";

interface RevenueChartProps {
  apiData: any;
  selectedMetric: "totalOrderAmount" | "orderCount" | "productQuantity" | "uniqueBuyers";
  startTime: string; // Thêm prop
  endTime: string;   // Thêm prop
}

export function RevenueChart({ apiData, selectedMetric, startTime, endTime }: RevenueChartProps) {
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [timeRange, setTimeRange] = useState<string>("1day");
  const open = Boolean(anchorEl);

  const getDateRangeDays = () => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (getDateRangeDays() <= 1) {
    return null; 
  }
  const timeOptions = (() => {
    const days = getDateRangeDays();
    const options = [
      { label: "1 ngày", value: "1day", days: 1 },
      { label: "3 ngày", value: "3days", days: 3 },
      { label: "7 ngày", value: "7days", days: 7 },
    ];
    if (days > 30) {
      options.push({ label: "1 tháng", value: "1month", days: 30 });
    }
    return options;
  })();
  const aggregateData = (days: number) => {
    if (!apiData?.data || !apiData.actualStartDate || !apiData.endDate) {
      return [];
    }

    const startDate = new Date(apiData.actualStartDate);
    const endDate = new Date(apiData.endDate);
    const dataMap = new Map(apiData.data.map((item: any) => [item.date, item]));
    const aggregated = [];

    let currentStart = new Date(startDate);
    while (currentStart <= endDate) {
      const periodEnd = new Date(currentStart);
      periodEnd.setDate(currentStart.getDate() + days - 1);
      if (periodEnd > endDate) periodEnd.setTime(endDate.getTime());

      let totalValue = 0;
      let tempDate = new Date(currentStart);
      while (tempDate <= periodEnd) {
        const dateStr = tempDate.toISOString().split("T")[0];
        if (dataMap.has(dateStr)) {
          totalValue += dataMap.get(dateStr)[selectedMetric] || 0;
        }
        tempDate.setDate(tempDate.getDate() + 1);
      }

      const displayDate =
        days === 30
          ? `Tháng ${currentStart.getMonth() + 1}`
          : currentStart.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
            });

      aggregated.push({
        date: displayDate,
        value: totalValue,
      });

      currentStart.setDate(currentStart.getDate() + days);
    }

    return aggregated;
  };
  const getDaysFromTimeRange = () => {
    const option = timeOptions.find((opt) => opt.value === timeRange);
    return option ? option.days : 1;
  };

  const data = aggregateData(getDaysFromTimeRange());

  const metricLabels = {
    totalOrderAmount: "Doanh Thu",
    orderCount: "Số Đơn Hàng",
    productQuantity: "Số Sản Phẩm Bán",
    uniqueBuyers: "Số Người Mua",
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const value = payload[0].payload.value;
      const formattedValue =
        selectedMetric === "totalOrderAmount" ? formatCurrency(value) : value.toString();
      return (
        <Paper
          elevation={3}
          sx={{
            p: 1.5,
            border: "1px solid",
            borderColor: "grey.200",
            borderRadius: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "text.primary", fontWeight: "medium" }}
          >
            {`${label}: ${formattedValue}`}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const getYAxisDomainAndTicks = () => {
    const values = data.map((item: any) => item.value);
    const maxValue = Math.max(...values, 0);
    let domain: [number, number];
    let ticks: number[];

    if (selectedMetric === "totalOrderAmount") {
      const upperBound = Math.ceil(maxValue / 10000) * 10000;
      domain = [0, upperBound || 10000];
      ticks = Array.from({ length: 5 }, (_, i) => (i * (upperBound || 10000)) / 4);
    } else {
      const upperBound = Math.ceil(maxValue / 5) * 5;
      domain = [0, upperBound || 5];
      ticks = Array.from({ length: 5 }, (_, i) => (i * (upperBound || 5)) / 4);
    }

    return { domain, ticks };
  };

  const { domain, ticks } = getYAxisDomainAndTicks();

  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 1,
        border: "1px solid",
        borderColor: "grey.200",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          p: 3,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ color: "text.primary", fontWeight: "medium" }}
            >
              {metricLabels[selectedMetric]} Theo {timeOptions.find((opt) => opt.value === timeRange)?.label || "Ngày"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tabs
              value={chartType}
              onChange={(_, value) => setChartType(value)}
              sx={{ minHeight: 36 }}
            >
              <Tab label="Line" value="line" sx={{ fontSize: 12, minWidth: 60 }} />
              <Tab label="Bar" value="bar" sx={{ fontSize: 12, minWidth: 60 }} />
            </Tabs>
            <IconButton
              onClick={(event) => setAnchorEl(event.currentTarget)}
              sx={{
                p: 1,
                bgcolor: "background.paper",
                "&:hover": { bgcolor: "grey.100" },
                borderRadius: 1,
              }}
            >
              <MoreHoriz sx={{ fontSize: 16, color: "grey.500" }} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
              MenuListProps={{
                "aria-labelledby": "time-range-button",
              }}
            >
              {timeOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  onClick={() => {
                    setTimeRange(option.value);
                    setAnchorEl(null);
                  }}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Box>
      </Box>
      <Box sx={{ p: 3, overflowX: "auto" }}>
        <Box sx={{ minWidth: data.length * 100, width: "100%" }}>
          <ResponsiveContainer width="100%" height={300}>
            {chartType === "line" ? (
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    selectedMetric === "totalOrderAmount" ? formatCurrencyShort(value) : value
                  }
                  domain={domain}
                  ticks={ticks}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={domain[1] / 4}
                  stroke="#e5e7eb"
                  strokeDasharray="2 2"
                  strokeWidth={1}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    selectedMetric === "totalOrderAmount" ? formatCurrencyShort(value) : value
                  }
                  domain={domain}
                  ticks={ticks}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={domain[1] / 4}
                  stroke="#e5e7eb"
                  strokeDasharray="2 2"
                  strokeWidth={1}
                />
                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </Box>
      </Box>
    </Paper>
  );
}