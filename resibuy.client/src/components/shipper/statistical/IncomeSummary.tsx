import React from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface Props {
  dayIncome: number;
  weekIncome: number;
  monthIncome: number;
  yearIncome: number;
}

export default function IncomeSummary({
  dayIncome,
  weekIncome,
  monthIncome,
  yearIncome,
}: Props) {
  const summaryItems = [
    { label: "Hôm nay", value: dayIncome, icon: "📅" },
    { label: "Tuần này", value: weekIncome, icon: "🗓️" },
    { label: "Tháng này", value: monthIncome, icon: "📈" },
    { label: "Năm nay", value: yearIncome, icon: "💰" },
  ];

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Grid container spacing={2} alignItems="stretch">
        {summaryItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                alignItems: "center",
                borderRadius: 2,
                minHeight: 120,
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 2,
                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                  borderRadius: 1,
                  fontSize: 28,
                }}
              >
                {item.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" noWrap>
                  {item.label}
                </Typography>
                <Typography
                  variant="h5"
                  color="primary"
                  sx={{ mt: 0.5, fontWeight: "bold" }}
                >
                  {(item.value ?? 0).toLocaleString()} đ
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
