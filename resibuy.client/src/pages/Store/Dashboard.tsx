import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  TextField,
  Button,
  Collapse,
  Alert,
} from "@mui/material";
import {
  CalendarMonth,
  Today,
  DateRange,
  Schedule,
  DateRangeOutlined,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import StoreSalesSummary from "./Analysis/StoreSalesSummary";
import TopSaleProducts from "./Analysis/TopSaleProducts";
import { useParams } from "react-router-dom";

type DateRangeType = "1week" | "1month" | "3months" | "1year" | "custom";

interface DateRangeOption {
  value: DateRangeType;
  label: string;
  icon: React.ReactNode;
  color: "primary" | "secondary" | "success" | "warning" | "info";
}

const Dashboard: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [selectedRange, setSelectedRange] = useState<DateRangeType>("1month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [dateError, setDateError] = useState("");

  const dateRangeOptions: DateRangeOption[] = [
    {
      value: "1week",
      label: "1 Tuần",
      icon: <Today sx={{ fontSize: 18 }} />,
      color: "primary",
    },
    {
      value: "1month",
      label: "1 Tháng",
      icon: <CalendarMonth sx={{ fontSize: 18 }} />,
      color: "secondary",
    },
    {
      value: "3months",
      label: "3 Tháng",
      icon: <DateRange sx={{ fontSize: 18 }} />,
      color: "success",
    },
    {
      value: "1year",
      label: "1 Năm",
      icon: <Schedule sx={{ fontSize: 18 }} />,
      color: "warning",
    },
    {
      value: "custom",
      label: "Tùy chọn",
      icon: <DateRangeOutlined sx={{ fontSize: 18 }} />,
      color: "info",
    },
  ];

  const getDateRange = (range: DateRangeType) => {
    if (range === "custom") {
      if (!customStartDate || !customEndDate) {
        // Nếu chưa set custom date, trả về default
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);
        return {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        };
      }

      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of day

      return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
    }

    const endDate = new Date();
    const startDate = new Date();

    switch (range) {
      case "1week":
        // Từ đầu tuần (Thứ 2) đến hiện tại
        const dayOfWeek = startDate.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0 = Chủ nhật
        startDate.setDate(startDate.getDate() - daysToMonday);
        startDate.setHours(0, 0, 0, 0);
        break;

      case "1month":
        // Từ đầu tháng đến hiện tại
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;

      case "3months":
        // Từ đầu tháng cách đây 3 tháng đến hiện tại
        startDate.setMonth(startDate.getMonth() - 2);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;

      case "1year":
        // Từ đầu năm đến hiện tại
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        break;

      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  };

  const { startDate: startDateStr, endDate: endDateStr } =
    getDateRange(selectedRange);

  const handleRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newRange: DateRangeType | null
  ) => {
    if (newRange !== null) {
      setSelectedRange(newRange);
      setDateError("");

      if (newRange === "custom") {
        setShowCustomDatePicker(true);
        // Set default dates for custom selection
        if (!customStartDate || !customEndDate) {
          const today = new Date();
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(today.getDate() - 30);

          setCustomStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
          setCustomEndDate(today.toISOString().split("T")[0]);
        }
      } else {
        setShowCustomDatePicker(false);
      }
    }
  };

  const validateCustomDates = () => {
    if (!customStartDate || !customEndDate) {
      setDateError("Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc");
      return false;
    }

    const startDate = new Date(customStartDate);
    const endDate = new Date(customEndDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (startDate > endDate) {
      setDateError("Ngày bắt đầu không thể lớn hơn ngày kết thúc");
      return false;
    }

    if (endDate > today) {
      setDateError("Ngày kết thúc không thể lớn hơn ngày hiện tại");
      return false;
    }

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 365) {
      setDateError("Khoảng thời gian không được vượt quá 365 ngày");
      return false;
    }

    setDateError("");
    return true;
  };

  const handleCustomDateChange = () => {
    if (validateCustomDates()) {
      // Trigger re-render by updating a state that affects the components
      setSelectedRange("custom");
    }
  };

  const formatDateForInput = (dateString: string) => {
    return dateString ? dateString.split("T")[0] : "";
  };

  const getDateRangeDisplay = () => {
    const { startDate, endDate } = getDateRange(selectedRange);
    const start = new Date(startDate);
    const end = new Date(endDate);

    return `${start.toLocaleDateString("vi-VN")} - ${end.toLocaleDateString(
      "vi-VN"
    )}`;
  };

  if (!storeId) return null;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header với Date Filter */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 4,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              📊 Dashboard Thống Kê
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Phân tích dữ liệu bán hàng và hiệu suất cửa hàng
            </Typography>
          </Box>

          <Chip
            label={`📅 ${getDateRangeDisplay()}`}
            sx={{
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: 600,
              fontSize: "0.875rem",
              px: 1,
            }}
          />
        </Box>
      </Paper>

      {/* Date Range Filter */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          🗓️ Chọn khoảng thời gian thống kê
        </Typography>

        <ToggleButtonGroup
          value={selectedRange}
          exclusive
          onChange={handleRangeChange}
          aria-label="date range selection"
          sx={{
            gap: 1,
            flexWrap: "wrap",
            "& .MuiToggleButton-root": {
              border: "2px solid",
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 3,
              },
            },
          }}
        >
          {dateRangeOptions.map((option) => (
            <ToggleButton
              key={option.value}
              value={option.value}
              sx={{
                color:
                  selectedRange === option.value
                    ? "white"
                    : `${option.color}.main`,
                borderColor: `${option.color}.main`,
                backgroundColor:
                  selectedRange === option.value
                    ? `${option.color}.main`
                    : "transparent",
                "&:hover": {
                  backgroundColor:
                    selectedRange === option.value
                      ? `${option.color}.dark`
                      : `${option.color}.light`,
                  borderColor:
                    selectedRange === option.value
                      ? `${option.color}.dark`
                      : `${option.color}.main`,
                },
                "&.Mui-selected": {
                  backgroundColor: `${option.color}.main`,
                  color: "white",
                  "&:hover": {
                    backgroundColor: `${option.color}.dark`,
                  },
                },
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                {option.icon}
                {option.label}
              </Box>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Box sx={{ mt: 2, p: 2, backgroundColor: "grey.50", borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            💡 <strong>Ghi chú:</strong> Dữ liệu được tính từ{" "}
            {selectedRange === "1week" && "đầu tuần (Thứ 2)"}
            {selectedRange === "1month" && "đầu tháng"}
            {selectedRange === "3months" && "đầu tháng cách đây 3 tháng"}
            {selectedRange === "1year" && "đầu năm"}
            {selectedRange === "custom" && "ngày bạn chọn"} đến thời điểm{" "}
            {selectedRange === "custom" ? "ngày bạn chọn" : "hiện tại"}.
          </Typography>
        </Box>

        {/* Custom Date Picker */}
        <Collapse in={selectedRange === "custom"} timeout={300}>
          <Paper
            elevation={1}
            sx={{
              mt: 3,
              p: 3,
              backgroundColor: "info.50",
              border: "1px solid",
              borderColor: "info.200",
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <DateRangeOutlined color="info" />
              <Typography
                variant="h6"
                color="info.main"
                sx={{ fontWeight: 600 }}
              >
                Chọn khoảng thời gian tùy chỉnh
              </Typography>
              <Button
                size="small"
                onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
                sx={{ ml: "auto" }}
              >
                {showCustomDatePicker ? <ExpandLess /> : <ExpandMore />}
              </Button>
            </Box>

            <Box
              display="flex"
              gap={3}
              mb={2}
              sx={{
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { sm: "center" },
              }}
            >
              <TextField
                label="Ngày bắt đầu"
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  minWidth: 200,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                  },
                }}
              />

              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{ px: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  đến
                </Typography>
              </Box>

              <TextField
                label="Ngày kết thúc"
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  minWidth: 200,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                  },
                }}
              />

              <Button
                variant="contained"
                color="info"
                onClick={handleCustomDateChange}
                disabled={!customStartDate || !customEndDate}
                sx={{
                  px: 3,
                  py: 1,
                  whiteSpace: "nowrap",
                  minWidth: 100,
                }}
              >
                Áp dụng
              </Button>
            </Box>

            {dateError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {dateError}
              </Alert>
            )}

            <Box
              sx={{
                p: 2,
                backgroundColor: "white",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "grey.200",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                📝 <strong>Lưu ý:</strong>
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                component="ul"
                sx={{ mt: 1, pl: 2 }}
              >
                <li>Khoảng thời gian tối đa là 365 ngày</li>
                <li>Ngày kết thúc không thể lớn hơn ngày hiện tại</li>
                <li>
                  Dữ liệu sẽ được tính từ 00:00 ngày bắt đầu đến 23:59 ngày kết
                  thúc
                </li>
              </Typography>
            </Box>
          </Paper>
        </Collapse>
      </Paper>

      {/* Dashboard Content */}
      <Box display="flex" flexDirection="column" gap={4}>
        <StoreSalesSummary
          storeId={storeId}
          startDate={startDateStr}
          endDate={endDateStr}
        />

        <TopSaleProducts
          storeId={storeId}
          startDate={startDateStr}
          endDate={endDateStr}
        />
      </Box>
    </Box>
  );
};

export default Dashboard;
