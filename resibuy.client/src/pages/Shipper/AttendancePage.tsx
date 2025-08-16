import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import PunchClockIcon from "@mui/icons-material/PunchClock";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import shipperApi from "../../api/ship.api";
import areaApi from "../../api/area.api";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useShipper } from "../../contexts/ShipperContext";

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
  const { shipperInfo } = useShipper();
  const isActiveShipper = shipperInfo?.isOnline ?? false;
  const { setShipperInfo } = useShipper(); // lấy từ ShipperContext

  const [timesheetData, setTimesheetData] = useState<TimesheetData | null>(
    null
  );
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

      // ✅ cập nhật luôn trạng thái shipper trong context
      setShipperInfo((prev) =>
        prev ? { ...prev, isOnline: true, areaId: selectedAreaId } : prev
      );

      // vẫn load lại bảng điểm danh nếu cần
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
      {/* Tiêu đề */}
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <PunchClockIcon color="primary" fontSize="large" />
        <Typography variant="h4" fontWeight={600}>
          Điểm danh
        </Typography>
      </Stack>

      {/* Nút check-in */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: 3,
          boxShadow: 2,
          bgcolor: "linear-gradient(135deg, #42a5f5, #478ed1)",
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Hãy điểm danh để bắt đầu ca làm hôm nay
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenDialog}
          startIcon={<PunchClockIcon />}
          disabled={isActiveShipper} // disable nếu đã check-in
        >
          Check-in hôm nay
        </Button>
      </Paper>

      {/* Thống kê */}
      {timesheetData && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 2 }}>
          <Typography variant="h6" gutterBottom>
            Thống kê điểm danh
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Stack direction="row" spacing={3}>
            <Chip
              icon={<EventAvailableIcon />}
              label={`Tổng số ngày: ${timesheetData.countAll}`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              icon={<ReportProblemIcon />}
              label={`Đi muộn: ${timesheetData.countLate}`}
              color="error"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              icon={<CheckCircleIcon />}
              label={`Đúng giờ: ${timesheetData.countOnTime}`}
              color="success"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </Paper>
      )}

      {/* Lịch sử điểm danh */}
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
        <Typography variant="h6" gutterBottom>
          Lịch sử điểm danh
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <b>Ngày</b>
                </TableCell>
                <TableCell>
                  <b>Giờ điểm danh</b>
                </TableCell>
                <TableCell>
                  <b>Trạng thái</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timesheetData?.data?.map((record) => (
                <TableRow key={record.id} hover>
                  <TableCell>
                    {dayjs(record.dateMark).format("DD/MM/YYYY")}
                  </TableCell>
                  <TableCell>
                    {dayjs(record.dateMark).format("HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    {record.isLate ? (
                      <Chip
                        label="Đi muộn"
                        color="error"
                        size="small"
                        icon={<AccessTimeIcon />}
                      />
                    ) : (
                      <Chip
                        label="Đúng giờ"
                        color="success"
                        size="small"
                        icon={<CheckCircleIcon />}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {(!timesheetData || timesheetData.data.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography color="text.secondary">
                      Không có dữ liệu
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog chọn khu vực */}
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
