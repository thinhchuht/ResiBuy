import React from "react";
import { Box, Typography, Paper } from "@mui/material";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType;
  iconColor: string;
  iconBgColor: string;
  valueColor?: string;
  description?: React.ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
  sx?: any; // 
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  valueColor = "text.primary",
  description,
  onClick,
  isSelected = false,
  sx, // Nhận sx prop
}: StatsCardProps) {
  return (
    <Paper
      elevation={1}
      onClick={onClick}
      sx={{
        p: 3,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "grey.100",
        borderBottom: isSelected ? "3px solid #1976d2" : "1px solid grey.100",
        transition: "box-shadow 0.3s, border-bottom 0.3s",
        cursor: onClick ? "pointer" : "default",
        "&:hover": {
          boxShadow: 3,
        },
        ...sx, // Áp dụng sx prop
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box
          sx={{
            p: 1.5,
            bgcolor: iconBgColor,
            borderRadius: 2,
            mr: 2,
          }}
        >
          <Icon sx={{ fontSize: 24, color: iconColor }} />
        </Box>
        <Box>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mb: 0.5 }}
          >
            {title}
          </Typography>
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", color: valueColor }}
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
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "grey.100",
        textAlign: "center",
        transition: "box-shadow 0.3s",
        "&:hover": {
          boxShadow: 3,
        },
      }}
    >
      <Typography
        variant="h5"
        sx={{ fontWeight: "bold", color: valueColor, mb: 0.5 }}
      >
        {value}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
    </Paper>
  );
}