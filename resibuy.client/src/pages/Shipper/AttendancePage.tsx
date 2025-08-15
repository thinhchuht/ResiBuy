import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import PunchClockIcon from "@mui/icons-material/PunchClock";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventBusyIcon from "@mui/icons-material/EventBusy";

interface AttendanceRecord {
  date: string; // yyyy-MM-dd
  status: "Present" | "Absent";
}

const mockAttendance: AttendanceRecord[] = [
  { date: "2025-08-01", status: "Present" },
  { date: "2025-08-02", status: "Absent" },
  { date: "2025-08-03", status: "Present" },
  { date: "2025-08-04", status: "Present" },
  { date: "2025-08-05", status: "Absent" },
  { date: "2025-08-06", status: "Present" },
  { date: "2025-08-07", status: "Present" },
];

// Hàm format date từ yyyy-MM-dd sang dd/MM/yyyy
const formatDateDisplay = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Hàm lấy hôm nay dạng yyyy-MM-dd
const getTodayString = (): string => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${year}-${month}-${day}`;
};

const AttendancePage: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(mockAttendance);

  const handleCheckIn = () => {
    const todayStr = getTodayString();
    if (!attendance.find(a => a.date === todayStr)) {
      setAttendance(prev => [...prev, { date: todayStr, status: "Present" }]);
    }
  };

  const workingDays = attendance.filter(a => a.status === "Present").length;
  const absentDays = attendance.filter(a => a.status === "Absent").length;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        <PunchClockIcon sx={{ mr: 1 }} />
        Điểm danh
      </Typography>

      {/* Nút check-in */}
      <Box mb={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCheckIn}
          startIcon={<PunchClockIcon />}
        >
          Check-in hôm nay
        </Button>
      </Box>

      {/* Thống kê */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <EventAvailableIcon color="success" sx={{ fontSize: 40 }} />
            <Typography variant="h6">{workingDays} ngày làm</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <EventBusyIcon color="error" sx={{ fontSize: 40 }} />
            <Typography variant="h6">{absentDays} ngày nghỉ</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Bảng chi tiết */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ngày</TableCell>
              <TableCell>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendance.map((record, index) => (
              <TableRow key={index}>
                <TableCell>{formatDateDisplay(record.date)}</TableCell>
                <TableCell>
                  {record.status === "Present" ? (
                    <Typography color="success.main">Làm việc</Typography>
                  ) : (
                    <Typography color="error.main">Nghỉ</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AttendancePage;
