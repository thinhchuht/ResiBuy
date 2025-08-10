import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import {
  AttachMoney,
  ShoppingCart,
  People,
  ShoppingBag,
  TrendingUp,
} from "@mui/icons-material";
import { formatCurrency, calculateStatsFromApi } from "./seg/utils";
import { StatsCard } from "../../../layouts/AdminLayout/components/StatsCard";

interface OverviewCardsProps {
  startTime: string;
  endTime: string;
  apiData: any;
  setSelectedMetric: (metric: "totalOrderAmount" | "orderCount" | "productQuantity" | "uniqueBuyers") => void;
}

export function OverviewCards({ startTime, endTime, apiData, setSelectedMetric }: OverviewCardsProps) {
  const isSameDay = startTime === endTime;
  const [selectedCard, setSelectedCard] = useState<string | null>(isSameDay ? null : "totalOrderAmount");

  useEffect(() => {
    if (!isSameDay) {
      setSelectedMetric("totalOrderAmount");
      setSelectedCard("totalOrderAmount");
    } else {
      setSelectedCard(null);
    }
  }, [startTime, endTime, setSelectedMetric]);

  const stats = apiData ? calculateStatsFromApi(apiData) : {
    totalOrderAmount: 0,
    orderCount: 0,
    productQuantity: 0,
    uniqueBuyers: 0,
    comparison: {
      changeOrderAmount: "0%",
      changeOrderCount: "0%",
      changeProductQuantity: "0%",
      changeUniqueBuyers: "0%",
    },
  };

  const getComparisonText = () => {
    if (!apiData?.actualStartDate || !apiData?.endDate) {
      return "Không có dữ liệu so sánh";
    }

    const startDate = new Date(apiData.actualStartDate);
    const endDate = new Date(apiData.endDate);
    const isSameDay = startDate.toISOString().split("T")[0] === endDate.toISOString().split("T")[0];

    if (isSameDay) {
      const prevDay = new Date(endDate);
      prevDay.setDate(endDate.getDate() - 1);
      return `So với ngày hôm trước (${prevDay.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })})`;
    } else {
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const prevEnd = new Date(startDate);
      prevEnd.setDate(startDate.getDate() - 1);
      const prevStart = new Date(prevEnd);
      prevStart.setDate(prevEnd.getDate() - daysDiff + 1);
      return `So với cùng kỳ trước (${prevStart.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })} - ${prevEnd.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })})`;
    }
  };

  const cards = [
    {
      title: "Doanh Thu Các Cửa Hàng",
      value: formatCurrency(stats.totalOrderAmount),
      icon: AttachMoney,
      iconColor: "#1976d2",
      iconBgColor: "#e3f2fd",
      valueColor: "#1976d2",
      change: stats.comparison.changeOrderAmount,
      metric: "totalOrderAmount" as const,
    },
    {
      title: "Đơn Hàng",
      value: stats.orderCount.toString(),
      icon: ShoppingCart,
      iconColor: "#2e7d32",
      iconBgColor: "#e8f5e9",
      valueColor: "#2e7d32",
      change: stats.comparison.changeOrderCount,
      metric: "orderCount" as const,
    },
    {
      title: "Sản Phẩm Bán",
      value: stats.productQuantity.toString(),
      icon: ShoppingBag,
      iconColor: "#7b1fa2",
      iconBgColor: "#f3e5f5",
      valueColor: "#7b1fa2",
      change: stats.comparison.changeProductQuantity,
      metric: "productQuantity" as const,
    },
    {
      title: "Tổng Người Mua Các Ngày",
      value: stats.uniqueBuyers.toString(),
      icon: People,
      iconColor: "#d81b60",
      iconBgColor: "#fce4ec",
      valueColor: "#d81b60",
      change: stats.comparison.changeUniqueBuyers,
      metric: "uniqueBuyers" as const,
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ color: "text.primary", fontWeight: "medium" }}>
          Số liệu
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {getComparisonText()}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
            lg: "1fr 1fr 1fr 1fr",
          },
          gap: 3,
        }}
      >
        {apiData ? (
          cards.map((card, index) => (
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
              onClick={() => {
                setSelectedMetric(card.metric);
                setSelectedCard(card.metric);
              }}
              isSelected={selectedCard === card.metric}
            />
          ))
        ) : (
          <Typography color="text.secondary">Đang tải dữ liệu...</Typography>
        )}
      </Box>
    </Box>
  );
}