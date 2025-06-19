import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Box, Paper, Typography, IconButton } from "@mui/material";
import { MoreHoriz } from "@mui/icons-material";
import {
  formatCurrency,
  formatCurrencyShort,
  getMonthlyRevenueData,
} from "../../../components/admin/Dashboard/seg/utils";
import type { TooltipProps } from "../../../types/models";

interface RevenueChartProps {
  timeFilter: string;
  setTimeFilter: (value: string) => void;
}

export function RevenueChart({ timeFilter, setTimeFilter }: RevenueChartProps) {
  const data = getMonthlyRevenueData();

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.hasData && data.revenue > 0) {
        return (
          <Paper
            elevation={3}
            sx={{
              p: 1.5, // Thay p-3
              border: "1px solid",
              borderColor: "grey.200", // Thay border
              borderRadius: 1, // Thay rounded-lg
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "text.primary", fontWeight: "medium" }} // Thay text-black font-medium
            >
              {`${label}: ${formatCurrency(data.revenue)}`}
            </Typography>
          </Paper>
        );
      }
    }
    return null;
  };

  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 1, // Thay rounded-lg
        border: "1px solid",
        borderColor: "grey.200", // Thay border
        bgcolor: "background.paper", // Thay bg-white
      }}
    >
      <Box
        sx={{
          p: 3, // Thay p-6
          borderBottom: 1,
          borderColor: "divider", // Thay border-b
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between", // Thay flex items-center justify-between
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ color: "text.primary", fontWeight: "medium" }} // Thay text-black font-semibold mb-1
            >
              Doanh Thu Của Các Cửa Hành Hàng Tháng
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              sx={{
                p: 1, // Thay p-2
                bgcolor: "background.paper", // Thay bg-white
                "&:hover": { bgcolor: "grey.100" }, // Thay hover:bg-gray-100
                borderRadius: 1, // Thay rounded
              }}
            >
              <MoreHoriz sx={{ fontSize: 16, color: "grey.500" }} /> {/* Thay h-4 w-4 text-gray-500 */}
            </IconButton>
          </Box>
        </Box>
      </Box>
      <Box sx={{ p: 3 }}> {/* Thay p-6 */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
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
              tickFormatter={(value) => formatCurrencyShort(value)}
              domain={[0, 400000000]}
              ticks={[0, 100000000, 200000000, 300000000, 400000000]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={100000000}
              stroke="#e5e7eb"
              strokeDasharray="2 2"
              strokeWidth={1}
            />
            <Bar
              dataKey="revenue"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}