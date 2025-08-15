import { useState, useEffect } from "react";
import { Paper, Typography, Button } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { OverviewCards } from "../../../components/admin/Dashboard/OverviewCards";
import { RevenueChart } from "../../../components/admin/Dashboard/RevenueChart";
import { StatisticsSection } from "../../../components/admin/Dashboard/StatisticSection";
import { TransactionsTable } from "../../../components/admin/Dashboard/TransactionTable";
import statisticsApi from "../../../api/statistics.api";
import { useToastify } from "../../../hooks/useToastify";
import { format } from "date-fns";

export default function Dashboard() {
  const today = new Date();
  const [startTime, setStartTime] = useState(today.toISOString().split("T")[0]);
  const [endTime, setEndTime] = useState(today.toISOString().split("T")[0]);
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<"totalOrderAmount" | "orderCount" | "productQuantity" | "uniqueBuyers">("totalOrderAmount");
  const toast = useToastify();

  const formatTimeForApi = (date: string, isStart: boolean) => {
    return `${date} ${isStart ? "00:00:00.000000" : "23:59:59.999999"}`;
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!startTime || !endTime) return;
      setLoading(true);
      setError(null);
      try {
        const formattedStartTime = formatTimeForApi(startTime, true);
        const formattedEndTime = formatTimeForApi(endTime, false);
        const response = await statisticsApi.getStats(formattedStartTime, formattedEndTime);
        console.log("Dashboard API response:", response);
        if (response.data) {
          setApiData(response);
        } else {
          throw new Error("Dữ liệu không hợp lệ");
        }
      } catch (err: any) {
        console.error("Fetch stats error:", err);
        setError(err.message || "Lỗi khi lấy thống kê");
        toast.error(err.message || "Lỗi khi lấy thống kê");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [startTime, endTime]);

  // Xử lý chọn nhanh
  const handleQuickSelect = (days: number | "today") => {
    const today = new Date();
    let start: Date, end: Date;
    if (days === "today") {
      start = today;
      end = today;
    } else {
      end = today;
      start = new Date(today);
      start.setDate(today.getDate() - days);
    }
    setStartTime(start.toISOString().split("T")[0]);
    setEndTime(end.toISOString().split("T")[0]);
  };

  // Định dạng ngày hiển thị
  const formatDate = (date: string | Date) => {
    return format(new Date(date), "dd-MM-yyyy");
  };

  // Kiểm tra xem có phải hôm nay không
  const isToday = startTime === endTime && startTime === today.toISOString().split("T")[0];

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "grey.50",
      }}
      elevation={0}
    >
      {/* Header */}
      <Paper
        component="header"
        sx={{
          display: "flex",
          alignItems: "center",
          height: 64,
          gap: 1,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          px: 2,
        }}
        elevation={1}
      >
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Dashboard
        </Typography>
      </Paper>

      {/* Main Content */}
      <Paper
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          p: 3,
          overflow: "auto",
          bgcolor: "grey.50",
        }}
        elevation={0}
      >
        {/* Form chọn ngày */}
        <Paper
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            border: "1px solid",
            borderColor: "grey.300",
            borderRadius: 1,
            p: 2,
            bgcolor: "background.paper",
          }}
          elevation={1}
        >
          <Paper
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              bgcolor: "transparent",
              boxShadow: "none",
            }}
            elevation={0}
          >
            <Paper
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                bgcolor: "transparent",
                boxShadow: "none",
              }}
              elevation={0}
            >
              <Typography variant="body2" sx={{ color: "text.primary", fontWeight: "medium" }}>
                Thời Gian Dữ Liệu: {formatDate(startTime)} ~ {formatDate(endTime)}
              </Typography>
              <Paper
                sx={{
                  display: "flex",
                  gap: 1,
                  border: "1px solid",
                  borderColor: "grey.300",
                  borderRadius: 1,
                  p: 1,
                  bgcolor: "background.paper",
                }}
                elevation={1}
              >
                <Button
                  variant={startTime === today.toISOString().split("T")[0] && endTime === today.toISOString().split("T")[0] ? "contained" : "outlined"}
                  size="small"
                  onClick={() => handleQuickSelect("today")}
                  sx={{
                    textTransform: "none",
                    borderRadius: 1,
                  }}
                >
                  Hôm nay
                </Button>
                <Button
                  variant={
                    Math.ceil((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60 * 24)) === 7 ? "contained" : "outlined"
                  }
                  size="small"
                  onClick={() => handleQuickSelect(7)}
                  sx={{
                    textTransform: "none",
                    borderRadius: 1,
                  }}
                >
                  7 ngày
                </Button>
                <Button
                  variant={
                    Math.ceil((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60 * 24)) === 30 ? "contained" : "outlined"
                  }
                  size="small"
                  onClick={() => handleQuickSelect(30)}
                  sx={{
                    textTransform: "none",
                    borderRadius: 1,
                  }}
                >
                  30 ngày
                </Button>
              </Paper>
            </Paper>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Paper
                sx={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid",
                  borderColor: "grey.300",
                  borderRadius: 1,
                  p: 1,
                  bgcolor: "background.paper",
                }}
                elevation={1}
              >
                <DatePicker
                  label="Ngày bắt đầu"
                  value={new Date(startTime)}
                  onChange={(newValue) => {
                    if (newValue) {
                      setStartTime(newValue.toISOString().split("T")[0]);
                    }
                  }}
                  slotProps={{
                    textField: {
                      sx: {
                        maxWidth: 150,
                        "& .MuiInputBase-root": {
                          height: 40,
                          borderRadius: 1,
                          "& fieldset": {
                            borderColor: "grey.300",
                          },
                          "&:hover fieldset": {
                            borderColor: "grey.500",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "primary.main",
                          },
                        },
                      },
                    },
                  }}
                />
                <Typography sx={{ mx: 1, color: "text.secondary" }}>-</Typography>
                <DatePicker
                  label="Ngày kết thúc"
                  value={new Date(endTime)}
                  onChange={(newValue) => {
                    if (newValue) {
                      setEndTime(newValue.toISOString().split("T")[0]);
                    }
                  }}
                  slotProps={{
                    textField: {
                      sx: {
                        maxWidth: 150,
                        "& .MuiInputBase-root": {
                          height: 40,
                          borderRadius: 1,
                          "& fieldset": {
                            borderColor: "grey.300",
                          },
                          "&:hover fieldset": {
                            borderColor: "grey.500",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "primary.main",
                          },
                        },
                      },
                    },
                  }}
                />
              </Paper>
            </LocalizationProvider>
          </Paper>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Dữ liệu được cập nhật trong ngày
          </Typography>
        </Paper>

        {loading ? (
          <Paper
            sx={{ display: "flex", justifyContent: "center", py: 4, bgcolor: "grey.50" }}
            elevation={0}
          >
            <Typography color="text.secondary">Đang tải dữ liệu...</Typography>
          </Paper>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            <OverviewCards
              startTime={startTime}
              endTime={endTime}
              apiData={apiData}
              setSelectedMetric={setSelectedMetric}
            />
            {!isToday && (
              <RevenueChart
                apiData={apiData}
                selectedMetric={selectedMetric}
                startTime={startTime}
                endTime={endTime}
              />
            )}
            <StatisticsSection
              startTime={startTime}
              endTime={endTime}
            />
            {apiData?.data?.length > 0 && (
              <TransactionsTable
                startTime={startTime}
                endTime={endTime}
                apiData={apiData.data}
              />
            )}
          </>
        )}
      </Paper>
    </Paper>
  );
}