

import {
  DollarSign,
  ShoppingCart,
  Users,
  Star,
  TrendingUp,
} from "lucide-react";
import {
  formatCurrency,
  getTotalYearRevenue,
  calculateMonthlyGrowth,
} from "../../../components/admin/Dashboard/seg/utils";
import { StatsCard } from "../../../layouts/AdminLayout/components/StatsCard";
import { Area } from "../../../lib/by/Div/index";

export function OverviewCards() {
  const totalRevenue = getTotalYearRevenue();
  const revenueGrowth = calculateMonthlyGrowth();

  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      iconColor: "text-blue-600",
      iconBgColor: "bg-blue-50",
      valueColor: "text-blue-600",
      change: `+${revenueGrowth}% from last month`,
    },
    {
      title: "Orders",
      value: "1,234",
      icon: ShoppingCart,
      iconColor: "text-green-600",
      iconBgColor: "bg-green-50",
      valueColor: "text-green-600",
      change: "+8.2% from last week",
    },
    {
      title: "Customers",
      value: "8,945",
      icon: Users,
      iconColor: "text-purple-600",
      iconBgColor: "bg-purple-50",
      valueColor: "text-purple-600",
      change: "+156 new this week",
    },
    {
      title: "Reviews",
      value: "4.8",
      icon: Star,
      iconColor: "text-pink-600",
      iconBgColor: "bg-pink-50",
      valueColor: "text-pink-600",
      change: "23 new reviews",
    },
  ];

  return (
    <Area className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <TrendingUp className="h-3 w-3" />
              {card.change}
            </span>
          }
        />
      ))}
    </Area>
  );
}
