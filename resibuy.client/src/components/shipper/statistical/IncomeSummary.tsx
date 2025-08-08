import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

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
    { label: "Hôm nay", value: dayIncome },
    { label: "Tuần này", value: weekIncome },
    { label: "Tháng này", value: monthIncome },
    { label: "Năm nay", value: yearIncome },
  ];

  return (
    <Grid container spacing={2}>
      {summaryItems.map((item, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper elevation={3} sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6">{item.label}</Typography>
            <Typography variant="h5" color="primary">
              {(item.value ?? 0).toLocaleString()} đ
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
