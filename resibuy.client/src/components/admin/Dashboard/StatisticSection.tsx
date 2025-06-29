import { Box, Paper, Typography, Button } from "@mui/material";
import { TrendingUp, TrendingDown } from "@mui/icons-material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  formatCurrency,
  getTopProductsData,
  getTopCustomersData,
  getCategoryDistribution,
} from "../../../components/admin/Dashboard/seg/utils";
import map from "lodash/map";
import type { StatisticsSectionProps } from "../../../types/models";

export function StatisticsSection({
  activeTab,
  setActiveTab,
}: StatisticsSectionProps) {
  const topProducts = getTopProductsData();
  const topCustomers = getTopCustomersData();
  const categoryData = getCategoryDistribution();

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2, // Thay gap-4 (2 × 8px = 16px)
        gridTemplateColumns: {
          xs: "1fr", 
          lg: "2fr 1fr", // Thay lg:grid-cols-3 (2:1 tỷ lệ cho 2 cột và 1 cột)
        },
      }}
    >
      <Paper
        elevation={1}
        sx={{
          borderRadius: 1, // Thay rounded-lg
          border: "1px solid",
          borderColor: "grey.200", // Thay border
          bgcolor: "background.paper", // Thay bg-white
        
        }}
      >
        <Box
          sx={{
            p: 3, // Thay p-6
            borderBottom: 1,
            borderColor: "divider", // Thay border-b
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: "text.primary", fontWeight: "medium" }} // Thay text-lg text-black font-semibold
          >
            Thống Kê Tháng Này
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}> {/* Thay p-6 */}
          <Box sx={{ display: "flex", gap: 0.5, mb: 2 }}> {/* Thay flex space-x-1 mb-4 */}
            <Button
              onClick={() => setActiveTab("products")}
              sx={{
                px: 2, // Thay px-4
                py: 1, // Thay py-2
                fontSize: "0.875rem", // Thay text-sm
                fontWeight: "medium",
                borderRadius: 1, // Thay rounded-md
                bgcolor: activeTab === "products" ? "primary.light" : "background.paper",
                color: activeTab === "products" ? "primary.dark" : "text.secondary",
                "&:hover": {
                  bgcolor: activeTab === "products" ? "primary.light" : "grey.100",
                  color: activeTab === "products" ? "primary.dark" : "text.primary",
                },
              }}
            >
              Sản Phẩm Hàng Đầu
            </Button>
            <Button
              onClick={() => setActiveTab("customers")}
              sx={{
                px: 2,
                py: 1,
                fontSize: "0.875rem",
                fontWeight: "medium",
                borderRadius: 1,
                bgcolor: activeTab === "customers" ? "primary.light" : "background.paper",
                color: activeTab === "customers" ? "primary.dark" : "text.secondary",
                "&:hover": {
                  bgcolor: activeTab === "customers" ? "primary.light" : "grey.100",
                  color: activeTab === "customers" ? "primary.dark" : "text.primary",
                },
              }}
            >
              Khách Hàng Hàng Đầu
            </Button>
          </Box>

          {activeTab === "products" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}> {/* Thay space-y-3 */}
              {map(topProducts, (product) => (
                <Box
                  key={product.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2, // Thay space-x-4
                    p: 1.5, // Thay p-3
                    borderRadius: 1, // Thay rounded-lg
                    bgcolor: "grey.50", // Thay bg-slate-50
                    color: "text.primary", // Thay text-black
                  }}
                >
                  <Box
                    sx={{
                      width: 40, // Thay w-10
                      height: 40, // Thay h-10
                      borderRadius: "50%", // Thay rounded-full
                      bgcolor: "grey.200", // Thay bg-gray-200
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {product.name.charAt(0)}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "medium", overflow: "hidden", textOverflow: "ellipsis" }} // Thay text-sm font-medium truncate
                    >
                      {product.name}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}> {/* Thay flex items-center text-xs */}
                      {product.trend === "up" ? (
                        <TrendingUp sx={{ fontSize: 12, color: "success.main" }} /> // Thay h-3 w-3 text-green-500
                      ) : (
                        <TrendingDown sx={{ fontSize: 12, color: "error.main" }} /> // Thay h-3 w-3 text-red-500
                      )}
                      <Typography
                        variant="caption"
                        sx={{ color: product.trend === "up" ? "success.main" : "error.main" }}
                      >
                        {product.change}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", ml: 0.5 }}>
                        so với tháng trước
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {formatCurrency(product.revenue)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {activeTab === "customers" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {map(topCustomers, (customer) => (
                <Box
                  key={customer.id}
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
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "grey.200",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {customer.name.charAt(0)}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "medium", overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      {customer.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      {customer.email}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {formatCurrency(customer.spent)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {customer.orders} đơn hàng
                    </Typography>
                  </Box>
                </Box>
              ))}
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
          <Typography
            variant="h6"
            sx={{ color: "text.primary", fontWeight: "medium" }} // Thay text-lg font-semibold text-black
          >
            Danh Mục Sản Phẩm
          </Typography>
        </Box>
        <Box sx={{ p: 3, color: "text.primary" }}> {/* Thay p-6 text-black */}
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {map(categoryData, (entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}> {/* Thay space-y-2 mt-4 */}
            {map(categoryData, (category, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.875rem", // Thay text-sm
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}> {/* Thay flex items-center space-x-2 */}
                  <Box
                    sx={{
                      width: 12, // Thay w-3
                      height: 12, // Thay h-3
                      borderRadius: "50%", // Thay rounded-full
                      bgcolor: category.color, // Sử dụng màu từ dữ liệu
                    }}
                  />
                  <Typography variant="body2">{category.name}</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {category.percentage}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}