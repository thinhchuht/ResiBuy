// FilterPanel.tsx
import { Box, Button, Grid } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

interface Props {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onFilter: () => void;
}

export default function FilterPanel({ startDate, endDate, onStartDateChange, onEndDateChange, onFilter }: Props) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <DatePicker
            label="Từ ngày"
            value={startDate}
            onChange={onStartDateChange}
            format="dd/MM/yyyy"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DatePicker
            label="Đến ngày"
            value={endDate}
            onChange={onEndDateChange}
            format="dd/MM/yyyy"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Button variant="contained" fullWidth onClick={onFilter}>
            Lọc dữ liệu
          </Button>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}
