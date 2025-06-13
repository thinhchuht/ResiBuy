import React from "react";
import { Box, Typography, Paper } from "@mui/material";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType; // Use React.ComponentType for MUI icons
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
        p: 3,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "grey.100",
        transition: "box-shadow 0.3s",
        "&:hover": {
          boxShadow: 3,
        },
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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: valueColor }}>
            {value}
          </Typography>
          {description && (
            <Typography variant="caption" color="text.secondary">
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
      <Typography variant="h5" sx={{ fontWeight: "bold", color: valueColor, mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}