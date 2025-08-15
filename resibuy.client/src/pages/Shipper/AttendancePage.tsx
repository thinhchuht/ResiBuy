import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
} from "@mui/material";
import PunchClockIcon from "@mui/icons-material/PunchClock";
import shipperApi from "../../api/ship.api";
import areaApi from "../../api/area.api";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import dayjs from "dayjs";

interface Area {
  id: string;
  name: string;
}

interface TimesheetData {
  countAll: number;
  countLate: number;
  countOnTime: number;
  data: {
    id: string;
    dateMark: string;
    isLate: boolean;
  }[];
}

const getTodayString = (): string => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${year}-${month}-${day}`;
};

const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const shipperId = user?.id || "";

  const [timesheetData, setTimesheetData] = useState<TimesheetData | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const todayStr = getTodayString();

  const loadAttendance = async () => {
    if (!shipperId) return;
    try {
      const start = `${todayStr.substring(0, 7)}-01`;
      const end = todayStr;

      const res = await shipperApi.timesheets(shipperId, start, end);

      // API trả nguyên object { countAll, countLate, countOnTime, data }
      setTimesheetData(res || null);
    } catch (error) {
      console.error("Error loading timesheets", error);
      toast.error("Không thể tải dữ liệu điểm danh");
    }
  };

  const loadAreas = async () => {
    try {
      const res = await areaApi.getAll();
      setAreas(res || []);
    } catch (error) {
      console.error("Error loading areas", error);
      toast.error("Không thể tải danh sách khu vực");
    }
  };

  const handleOpenDialog = async () => {
    await loadAreas();
    setOpenDialog(true);
  };

  const handleSubmitCheckIn = async () => {
    if (!selectedAreaId || !shipperId) {
      toast.warning("Vui lòng chọn khu vực trước khi check-in");
      return;
    }
    try {
      await shipperApi.updateStatus(shipperId, true, selectedAreaId);
      toast.success("Check-in thành công!");
      setOpenDialog(false);
      await loadAttendance();
    } catch (error) {
      console.error("Check-in failed", error);
      toast.error("Check-in thất bại");
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [shipperId]);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        <PunchClockIcon sx={{ mr: 1 }} />
        Điểm danh
      </Typography>

      <Box mb={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenDialog}
          startIcon={<PunchClockIcon />}
        >
          Check-in hôm nay
        </Button>
      </Box>

      <Box p={2}>
        <Typography variant="h5" gutterBottom>
          Lịch sử điểm danh
        </Typography>

        {timesheetData && (
          <Box display="flex" gap={4} mb={2}>
            <Typography>
              Tổng số ngày đã điểm danh: {timesheetData.countAll}
            </Typography>
            <Typography>
              Số ngày đi muộn: {timesheetData.countLate}
            </Typography>
            <Typography>
              Số ngày đúng giờ: {timesheetData.countOnTime}
            </Typography>
          </Box>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ngày</TableCell>
                <TableCell>Giờ điểm danh</TableCell>
                <TableCell>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timesheetData?.data?.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {dayjs(record.dateMark).format("DD/MM/YYYY")}
                  </TableCell>
                  <TableCell>
                    {dayjs(record.dateMark).format("HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    {record.isLate ? (
                      <Typography color="error.main">Đi muộn</Typography>
                    ) : (
                      <Typography color="success.main">Đúng giờ</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {(!timesheetData || timesheetData.data.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Vui lòng chọn khu vực bạn đang đứng</DialogTitle>
        <DialogContent>
          <Select
            fullWidth
            value={selectedAreaId}
            onChange={(e) => setSelectedAreaId(e.target.value)}
          >
            {areas.map((area) => (
              <MenuItem key={area.id} value={area.id}>
                {area.name}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmitCheckIn}>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendancePage;
