

import { Area, RText, Yard } from "../../../lib/by/Div";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  valueColor?: string;
  description?: React.ReactNode;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  valueColor = "text-gray-900",
}: StatsCardProps) {
  return (
    <Yard className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <Area className="flex items-center">
        <Yard className={`p-3 ${iconBgColor} rounded-xl mr-4`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </Yard>
        <Yard>
          <RText className="text-sm font-medium text-gray-500 mb-1">
            {title}
          </RText>
          <RText className={`text-2xl font-bold ${valueColor}`}>{value}</RText>
        </Yard>
      </Area>
    </Yard>
  );
}

interface MiniStatsCardProps {
  value: string | number;
  label: string;
  valueColor: string;
}

export function MiniStatsCard({
  value,
  label,
  valueColor,
}: MiniStatsCardProps) {
  return (
    <Yard className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
      <RText className={`text-2xl font-bold ${valueColor} mb-1`}>{value}</RText>
      <RText className="text-sm text-gray-500">{label}</RText>
    </Yard>
  );
}
