import React from "react";
import { Box, Typography, Paper } from "@mui/material";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType; // Hỗ trợ biểu tượng MUI
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
  valueColor = "text.primary",
  description,
}: StatsCardProps) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 3, // Thay p-6 (3 × 8px = 24px)
        borderRadius: 2, // Thay rounded-xl
        border: "1px solid",
        borderColor: "grey.100", // Thay border-gray-100
        transition: "box-shadow 0.3s",
        "&:hover": {
          boxShadow: 3, // Thay hover:shadow-md
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box
          sx={{
            p: 1.5, // Thay p-3 (1.5 × 8px = 12px)
            bgcolor: iconBgColor, // Sử dụng màu nền động
            borderRadius: 2, // Thay rounded-xl
            mr: 2, // Thay mr-4 (2 × 8px = 16px)
          }}
        >
          <Icon sx={{ fontSize: 24, color: iconColor }} /> {/* Thay w-6 h-6 */}
        </Box>
        <Box>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mb: 0.5 }} // Thay text-sm text-gray-500 mb-1
          >
            {title}
          </Typography>
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", color: valueColor }} // Thay text-2xl font-bold
          >
            {value}
          </Typography>
          {description && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {description}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

interface MiniStatsCardProps {
  value: string | number;
  label: string;
  valueColor: string;
}

export function MiniStatsCard({ value, label, valueColor }: MiniStatsCardProps) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2, // Thay p-4 (2 × 8px = 16px)
        borderRadius: 2, // Thay rounded-xl
        border: "1px solid",
        borderColor: "grey.100", // Thay border-gray-100
        textAlign: "center", // Thay text-center
        transition: "box-shadow 0.3s",
        "&:hover": {
          boxShadow: 3, // Thay hover:shadow-md
        },
      }}
    >
      <Typography
        variant="h5"
        sx={{ fontWeight: "bold", color: valueColor, mb: 0.5 }} // Thay text-2xl font-bold mb-1
      >
        {value}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {label} {/* Thay text-sm text-gray-500 */}
      </Typography>
    </Paper>
  );
}