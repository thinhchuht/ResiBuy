import _ from "lodash";
import {
  monthlyRevenueData,
  topProducts,
  topCustomers,
  recentOrders,
} from "../../../../constants/share/dashboard/index";
import { categoryData } from "../../../../constants/share/index";

//#region fomatCurrency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Math.abs(amount));
};
//#endregion
//#region fomatCurrencyShort
export const formatCurrencyShort = (amount: number): string => {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(0)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return amount.toString();
};
//#endregion
//#region getCurrentMonth
export const getCurrentMonth = (): number => {
  return new Date().getMonth(); // 0-11, May = 4
};
//#endregion
//#region calculateMonthlyGrowth
export const calculateMonthlyGrowth = (): string => {
  const currentMonth = getCurrentMonth();
  if (currentMonth === 0) return "0";

  const currentRevenue = monthlyRevenueData[currentMonth]?.revenue || 0;
  const previousRevenue = monthlyRevenueData[currentMonth - 1]?.revenue || 0;

  if (previousRevenue === 0) return "0";

  const growth = (
    ((currentRevenue - previousRevenue) / previousRevenue) *
    100
  ).toFixed(1);
  return growth;
};
//#endregion
//#region getTotalYearRevenue
export const getTotalYearRevenue = (): number => {
  const currentMonth = getCurrentMonth();
  return _.sumBy(_.take(monthlyRevenueData, currentMonth + 1), "revenue");
};
//#endregion
//#region getStatusBadgeConfig
export const getStatusBadgeConfig = (status: string) => {
  const statusConfig = {
    completed: {
      label: "Completed",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-100 text-red-800 border-red-200",
    },
    in_progress: {
      label: "In progress",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    in_review: {
      label: "In review",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
  };

  return statusConfig[status as keyof typeof statusConfig];
};
//#endregion
//#region getPaymentMethodIcon
export const getPaymentMethodIcon = (method: string) => {
  if (method === "mastercard") {
    return {
      className:
        "w-8 h-5 bg-gradient-to-r from-red-500 to-yellow-500 rounded text-white text-xs flex items-center justify-center font-bold",
      text: "MC",
    };
  }
  return {
    className:
      "w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-800 rounded text-white text-xs flex items-center justify-center font-bold",
    text: "VISA",
  };
};
//#endregion
//#region getCurrentDate
export const getCurrentDate = (): string => {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

//#endregion
//#region getMonthlyRevenueData
// Data processing functions
export const getMonthlyRevenueData = () => {
  const currentMonth = getCurrentMonth();
  return _.map(monthlyRevenueData, (item, index) => ({
    ...item,
    revenue: index <= currentMonth ? item.revenue : 0,
    hasData: index <= currentMonth,
  }));
};
//#endregion
//#region getTopProductsData
export const getTopProductsData = () => {
  return _.take(_.orderBy(topProducts, ["revenue"], ["desc"]), 5);
};
//#endregion
//#region getTopCustomersData
export const getTopCustomersData = () => {
  return _.take(_.orderBy(topCustomers, ["spent"], ["desc"]), 5);
};
//#endregion
//#region getCategoryDistribution
export const getCategoryDistribution = () => {
  return _.map(categoryData, (category) => ({
    ...category,
    percentage: `${category.value}%`,
  }));
};
//#endregion
//#region getRecentTransactions
export const getRecentTransactions = () => {
  return _.take(_.orderBy(recentOrders, ["date"], ["desc"]), 10);
};
//#endregion
//#region getOverviewMetrics
export const getOverviewMetrics = () => {
  const totalRevenue = getTotalYearRevenue();
  const totalOrders = 1234;
  const totalCustomers = 8945;
  const averageRating = 4.8;

  return {
    revenue: totalRevenue,
    orders: totalOrders,
    customers: totalCustomers,
    rating: averageRating,
  };
};
//#endregion
