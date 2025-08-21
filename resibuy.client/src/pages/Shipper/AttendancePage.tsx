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
  DialogContentText,
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

  const [open, setOpen] = useState(false);

  const handleOpenDialogCheckOut = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleConfirmCheckout = async () => {
    try {
      await shipperApi.ShipperCheckOut(shipperId, false);
      toast.success("Check-out thành công!");
      setOpen(false);
      // ✅ cập nhật luôn trạng thái shipper trong context
      setShipperInfo((prev) => (prev ? { ...prev, isOnline: false } : prev));

      // vẫn load lại bảng điểm danh nếu cần
      await loadAttendance();
    } catch (error) {
      console.error("Check-out failed", error);
    }
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
        {isActiveShipper ? (
          <Button
            variant="contained"
            color="secondary"
            onClick={handleOpenDialogCheckOut} // hàm xử lý check-out
            startIcon={<PunchClockIcon />}
          >
            Check-out hôm nay
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenDialog} // hàm xử lý check-in
            startIcon={<PunchClockIcon />}
          >
            Check-in hôm nay
          </Button>
        )}
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
              color="warning"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              icon={<CheckCircleIcon />}
              label={`Nghỉ: ${timesheetData.countOnTime}`}
              color="error"
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
                        color="warning"
                        size="small"
                        icon={<AccessTimeIcon />}
                      />
                    ) : (
                      <Chip
                        label="Nghỉ"
                        color="error"
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

      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>Xác nhận Check-out</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Bạn có chắc chắn muốn check-out không?
            </Typography>
            <Typography
              variant="body2"
              color="error"
              sx={{
                mt: 1,
                display: "flex",
                alignItems: "center",
                fontWeight: 500,
              }}
            >
              <ReportProblemIcon color="error" sx={{ mr: 1 }} />
              Nếu chưa hết giờ làm đã đăng ký, bạn sẽ bị coi là đi muộn.
            </Typography>
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleConfirmCheckout}
            color="secondary"
            variant="contained"
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendancePage;
