

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
import {
  formatCurrency,
  formatCurrencyShort,
  // getTotalYearRevenue,
  // calculateMonthlyGrowth,
  getMonthlyRevenueData,
} from "../../../components/admin/Dashboard/seg/utils";
import { MoreHorizontal } from "lucide-react";
import type  { TooltipProps } from "../../../types/models";
import { Area, RText, Yard, Core, Container } from "../../../lib/by/Div/index";

interface RevenueChartProps {
  timeFilter: string;
  setTimeFilter: (value: string) => void;
}

export function RevenueChart({ timeFilter, setTimeFilter }: RevenueChartProps) {
  const data = getMonthlyRevenueData();
  // const totalRevenue = getTotalYearRevenue();
  // const revenueGrowth = calculateMonthlyGrowth();

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.hasData && data.revenue > 0) {
        return (
          <Core className="bg-white p-3 border rounded-lg shadow-lg">
            <p className=" text-blackfont-medium">{`${label}: ${formatCurrency(data.revenue)}`}</p>
          </Core>
        );
      }
    }
    return null;
  };

  return (
    <Core className="bg-white rounded-lg shadow-sm border">
      <Container className="p-6 border-b">
        <Area className="flex items-center justify-between">
          <Yard>
            <RText className="text-black font-semibold mb-1">Monthly Sales</RText>
          </Yard>
          <Yard className="flex items-center space-x-2">
            <button className="p-2 bg-white  hover:bg-gray-100 rounded">
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </button>
          </Yard>
        </Area>
      </Container>
      <Yard className="p-6">
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
      </Yard>
    </Core>
  );
}
