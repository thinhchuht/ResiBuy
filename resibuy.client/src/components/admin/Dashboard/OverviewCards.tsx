import { Box, Typography } from "@mui/material";
import {
  AttachMoney,
  ShoppingCart,
  People,
  Star,
  TrendingUp,
} from "@mui/icons-material";
import {
  formatCurrency,
  getTotalYearRevenue,
  calculateMonthlyGrowth,
} from "../../../components/admin/Dashboard/seg/utils";
import { StatsCard } from "../../../layouts/AdminLayout/components/StatsCard";

export function OverviewCards() {
  const totalRevenue = getTotalYearRevenue();
  const revenueGrowth = calculateMonthlyGrowth();

  const cards = [
    {
      title: "Tổng Doanh Thu",
      value: formatCurrency(totalRevenue),
      icon: AttachMoney,
      iconColor: "#1976d2",
      iconBgColor: "#e3f2fd",
      valueColor: "#1976d2",
      change: `+${revenueGrowth}% so với tháng trước`,
    },
    {
      title: "Đơn Hàng",
      value: "1.234",
      icon: ShoppingCart,
      iconColor: "#2e7d32",
      iconBgColor: "#e8f5e9",
      valueColor: "#2e7d32",
      change: "+8,2% so với tuần trước",
    },
    {
      title: "Khách Hàng",
      value: "8.945",
      icon: People,
      iconColor: "#7b1fa2",
      iconBgColor: "#f3e5f5",
      valueColor: "#7b1fa2",
      change: "+156 khách hàng mới tuần này",
    },
    {
      title: "Đánh Giá",
      value: "4,8",
      icon: Star,
      iconColor: "#d81b60",
      iconBgColor: "#fce4ec",
      valueColor: "#d81b60",
      change: "23 đánh giá mới",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "1fr 1fr",
          lg: "1fr 1fr 1fr 1fr",
        },
        gap: 3,
        mb: 3,
      }}
    >
      {cards.map((card, index) => (
        <StatsCard
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          iconColor={card.iconColor}
          iconBgColor={card.iconBgColor}
          valueColor={card.valueColor}
          description={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <TrendingUp sx={{ fontSize: 12, color: "text.secondary" }} />
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {card.change}
              </Typography>
            </Box>
          }
        />
      ))}
    </Box>
  );
}