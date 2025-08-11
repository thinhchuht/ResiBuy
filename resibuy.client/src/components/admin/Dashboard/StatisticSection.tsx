import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Paper, Typography, Tabs, Tab, Avatar } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "./seg/utils";
import statisticsApi from "../../../api/statistics.api";
import { useToastify } from "../../../hooks/useToastify";

interface StatisticsSectionProps {
  startTime: string;
  endTime: string;
}

export function StatisticsSection({ startTime, endTime }: StatisticsSectionProps) {
  const [activeTab, setActiveTab] = useState<"customers" | "stores" | "products">("customers");
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToastify();
  const navigate = useNavigate();

  // Định dạng thời gian cho API (YYYY-MM-DD HH:mm:ss.ffffff)
  const formatTimeForApi = (date: string, isStart: boolean) => {
    return `${date} ${isStart ? "00:00:00.000000" : "23:59:59.999999"}`;
  };

  // Gọi API khi startTime hoặc endTime thay đổi
  useEffect(() => {
    if (!startTime || !endTime) return;

    const fetchTopAndCategory = async () => {
      setLoading(true);
      setError(null);
      try {
        const formattedStartTime = formatTimeForApi(startTime, true);
        const formattedEndTime = formatTimeForApi(endTime, false);
        const response = await statisticsApi.getTopAndCategory(formattedStartTime, formattedEndTime);
        console.log("StatisticsSection API response:", response);
        if (response) {
          setApiData(response);
        } else {
          throw new Error("Dữ liệu không hợp lệ");
        }
      } catch (err: any) {
        console.error("Fetch top and category error:", err);
        setError(err.message || "Lỗi khi lấy thống kê top và danh mục");
        toast.error(err.message || "Lỗi khi lấy thống kê top và danh mục");
      } finally {
        setLoading(false);
      }
    };

    fetchTopAndCategory();
  }, [startTime, endTime]);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  const topBuyers = apiData?.topStatistics?.[0]?.topBuyers || [];
  const topStores = apiData?.topStatistics?.[0]?.topStores || [];
  const topProducts = apiData?.topStatistics?.[0]?.topProducts || [];
  const categoryData = (apiData?.categoryPercentages || []).map((cat: any, index: number) => ({
    name: cat.name,
    value: cat.value,
    color: COLORS[index % COLORS.length],
  }));

   const getTitle = () => {
    switch (activeTab) {
      case "customers":
        return "Top 20 Khách Hàng Nhiều Đơn Nhất";
      case "stores":
        return "Top 20 Cửa Hàng Nhiều Đơn Nhất";
      case "products":
        return "Top 20 Sản Phẩm Nhiều Đơn Nhất";
      default:
        return "Thống Kê Hàng Đầu";
    }
  };
  const handleProductClick = (productId: number) => {
    navigate(`/products?id=${productId}`);
  };

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
      }}
    >
      <Paper
        elevation={1}
        sx={{
          borderRadius: 1,
          border: "1px solid",
          borderColor: "grey.200",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6" sx={{ color: "text.primary", fontWeight: "medium" }}>
            {getTitle()}
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab label="Khách Hàng" value="customers" sx={{ fontSize: "0.875rem" }} />
            <Tab label="Cửa Hàng" value="stores" sx={{ fontSize: "0.875rem" }} />
            <Tab label="Sản Phẩm" value="products" sx={{ fontSize: "0.875rem" }} />
          </Tabs>

          {loading ? (
            <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
              Đang tải dữ liệu...
            </Typography>
          ) : error ? (
            <Typography color="error" sx={{ textAlign: "center", py: 4 }}>
              {error}
            </Typography>
          ) : (
            <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
              {activeTab === "customers" && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {topBuyers.length === 0 ? (
                    <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                      Chưa có dữ liệu
                    </Typography>
                  ) : (
                    topBuyers.map((customer: any, index: number) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: "grey.50",
                          color: "text.primary",
                        }}
                      >
                        <Avatar
                          src={customer.avatar}
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: customer.avatar ? "transparent" : "grey.200",
                            color: "text.primary",
                            fontWeight: "medium",
                          }}
                        >
                          {!customer.avatar && customer.fullName.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "medium", overflow: "hidden", textOverflow: "ellipsis" }}
                          >
                            {customer.fullName}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis" }}
                          >
                            {customer.phoneNumber} | {customer.address}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                            {formatCurrency(customer.totalValue)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {customer.totalOrders} đơn hàng
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              )}

              {activeTab === "stores" && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {topStores.length === 0 ? (
                    <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                      Chưa có dữ liệu
                    </Typography>
                  ) : (
                    topStores.map((store: any, index: number) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: "grey.50",
                          color: "text.primary",
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: "grey.200",
                            color: "text.primary",
                            fontWeight: "medium",
                          }}
                        >
                          {store.storeName.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "medium", overflow: "hidden", textOverflow: "ellipsis" }}
                          >
                            {store.storeName}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis" }}
                          >
                            {store.phoneNumber} | {store.address}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                            {formatCurrency(store.totalRevenue)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {store.totalOrders} đơn hàng
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              )}

              {activeTab === "products" && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {topProducts.length === 0 ? (
                    <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                      Chưa có dữ liệu
                    </Typography>
                  ) : (
                    topProducts.map((product: any, index: number) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: "grey.50",
                          color: "text.primary",
                        }}
                      >
                        <Avatar
                          src={product.productImg}
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: product.productImg ? "transparent" : "grey.200",
                            color: "text.primary",
                            fontWeight: "medium",
                            cursor: "pointer",
                          }}
                          onClick={() => handleProductClick(product.id)}
                        >
                          {!product.productImg && product.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: "medium",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              cursor: "pointer",
                              "&:hover": { textDecoration: "underline" },
                            }}
                            onClick={() => handleProductClick(product.id)}
                          >
                            {product.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis" }}
                          >
                            Cửa hàng: {product.storeName} | bán {product.soldQuantity} sản phẩm
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                            {formatCurrency(product.totalRevenue)}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>
      <Paper
        elevation={1}
        sx={{
          borderRadius: 1,
          border: "1px solid",
          borderColor: "grey.200",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6" sx={{ color: "text.primary", fontWeight: "medium" }}>
            Danh Mục Sản Phẩm
          </Typography>
        </Box>
        <Box sx={{ p: 3, color: "text.primary" }}>
          {loading ? (
            <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
              Đang tải dữ liệu...
            </Typography>
          ) : error ? (
            <Typography color="error" sx={{ textAlign: "center", py: 4 }}>
              {error}
            </Typography>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
               <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name} (${value.toFixed(1)}%)`}
                  >
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
                {categoryData.map((category: any, index: number) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.875rem",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          bgcolor: category.color,
                        }}
                      />
                      <Typography variant="body2">{category.name}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {category.value.toFixed(1)}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}