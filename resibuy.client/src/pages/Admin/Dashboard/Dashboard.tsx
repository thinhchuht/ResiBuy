// Dashboard.tsx
import { useState } from "react";
import { OverviewCards } from "../../../components/admin/Dashboard/OverviewCards";
import { RevenueChart } from "../../../components/admin/Dashboard/RevenueChart";
import { StatisticsSection } from "../../../components/admin/Dashboard/StatisticSection";
import { TransactionsTable } from "../../../components/admin/Dashboard/TransactionTable";
import { Area, Yard, RText, Core, Block } from "../../../lib/by/Div/index";
export default function Dashboard() {
  const [timeFilter, setTimeFilter] = useState("last_7_days");
  const [activeTab, setActiveTab] = useState("products");

  return (
    <Core className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="flex h-16 items-center gap-2 border-b bg-white px-4">
        <Yard className="flex items-center gap-2 text-sm text-gray-500">
          <RText>Dashboard</RText>
        </Yard>
      </header>

      {/* Main Content */}
      <Area className="flex-1 space-y-6 p-6 overflow-auto">
        <OverviewCards />
        <RevenueChart timeFilter={timeFilter} setTimeFilter={setTimeFilter} />
        <StatisticsSection activeTab={activeTab} setActiveTab={setActiveTab} />
        <TransactionsTable />
      </Area>
    </Core>
  );
}
