import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { OverviewCards } from "../../../components/admin/Dashboard/OverviewCards";
import { RevenueChart } from "../../../components/admin/Dashboard/RevenueChart";
import { StatisticsSection } from "../../../components/admin/Dashboard/StatisticSection";
import { TransactionsTable } from "../../../components/admin/Dashboard/TransactionTable";

export default function Dashboard() {
  const [timeFilter, setTimeFilter] = useState("last_7_days");
  const [activeTab, setActiveTab] = useState("products");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%", // Thay h-full
        bgcolor: "grey.50", // Thay bg-gray-50
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          display: "flex",
          alignItems: "center",
          height: 64, // Thay h-16 (16 × 4px = 64px trong Tailwind)
          gap: 1, // Thay gap-2 (1 × 8px = 8px trong MUI)
          borderBottom: 1,
          borderColor: "divider", // Thay border-b
          bgcolor: "background.paper", // Thay bg-white
          px: 2, // Thay px-4 (2 × 8px = 16px)
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Dashboard
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1, // Thay flex-1
          display: "flex",
          flexDirection: "column",
          gap: 3, // Thay space-y-6 (24px, 3 × 8px = 24px)
          p: 3, // Thay p-6
          overflow: "auto", // Thay overflow-auto
        }}
      >
        <OverviewCards />
        <RevenueChart timeFilter={timeFilter} setTimeFilter={setTimeFilter} />
        <StatisticsSection activeTab={activeTab} setActiveTab={setActiveTab} />
        <TransactionsTable />
      </Box>
    </Box>
  );
}