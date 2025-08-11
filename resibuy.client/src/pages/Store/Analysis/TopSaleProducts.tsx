import React, { useEffect, useState } from "react";
import axios from "../../../api/base.api";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
} from "@mui/material";

interface ProductDto {
  id: number;
  name: string;
  imageUrl?: string;
  quantity: number;
  describe: string;
  price: number;
  weight: number;
  isOutOfStock: boolean;
  discount: number;
  createdAt: string;
  updatedAt: string;
  storeId: string;
  categoryId: string;
}

interface ProductAndSale {
  product: ProductDto;
  sale: number;
}

interface ApiResponse {
  code: number;
  message: string;
  data: Record<string, ProductAndSale>;
}

interface TopSaleProductsProps {
  storeId: string;
  startDate: string;
  endDate: string;
}

const TopSaleProducts: React.FC<TopSaleProductsProps> = ({
  storeId,
  startDate,
  endDate,
}) => {
  const [products, setProducts] = useState<ProductAndSale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTopSaleProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get<ApiResponse>(
          `/api/store/top-sale-products`,
          {
            params: { storeId, startDate, endDate },
          }
        );

        console.log("Top sale products response:", res.data);

        // Kiểm tra response có data không
        if (res.data.code === 0 && res.data.data) {
          // Chuyển đổi object thành array và sắp xếp theo số lượng bán giảm dần
          const result = Object.values(res.data.data)
            .filter((item) => item.product) // Lọc bỏ những item không có product
            .sort((a, b) => b.sale - a.sale) // Sắp xếp theo sale giảm dần
            .slice(0, 10); // Lấy top 10

          setProducts(result);
        } else {
          console.warn("No data or error in response:", res.data.message);
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching top sale products", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchTopSaleProducts();
    }
  }, [storeId, startDate, endDate]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (products.length === 0) {
    return (
      <Box>
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 3,
          }}
        >
          🏆 Top 10 sản phẩm bán chạy
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 6,
            px: 3,
            backgroundColor: "grey.50",
            borderRadius: 2,
            border: "2px dashed",
            borderColor: "grey.300",
          }}
        >
          <Box
            sx={{
              fontSize: "4rem",
              mb: 2,
              opacity: 0.5,
            }}
          >
            📊
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "text.primary",
              mb: 1,
            }}
          >
            Chưa có dữ liệu
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              textAlign: "center",
              maxWidth: 400,
              lineHeight: 1.6,
            }}
          >
            Không có dữ liệu sản phẩm bán chạy trong khoảng thời gian này. Hãy
            thử chọn khoảng thời gian khác hoặc kiểm tra lại dữ liệu.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 3,
        }}
      >
        🏆 Top 10 sản phẩm bán chạy
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={2} justifyContent="flex-start">
        {products.map((item, idx) => {
          const { product } = item;

          return (
            <Card
              key={product.id}
              sx={{
                width: 280,
                position: "relative",
                "&:hover": {
                  transform: "translateY(-2px)",
                  transition: "transform 0.2s ease-in-out",
                },
              }}
            >
              {/* Badge hiển thị thứ hạng */}
              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  backgroundColor: "primary.main",
                  color: "white",
                  borderRadius: "50%",
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "bold",
                  zIndex: 1,
                }}
              >
                {idx + 1}
              </Box>

              <CardMedia
                component="img"
                height="160"
                image={
                  product.imageUrl ||
                  "https://via.placeholder.com/300x160?text=No+Image"
                }
                alt={product.name}
                sx={{ objectFit: "cover" }}
              />

              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: "1rem",
                    fontWeight: "bold",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {product.name}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {product.describe}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                    {product.price.toLocaleString("vi-VN")} VND
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: "success.main", fontWeight: "medium" }}
                  >
                    Đã bán: {item.sale} sản phẩm
                  </Typography>

                  {product.discount > 0 && (
                    <Typography variant="body2" sx={{ color: "error.main" }}>
                      Giảm giá: {product.discount}%
                    </Typography>
                  )}

                  <Typography
                    variant="body2"
                    sx={{
                      color: product.isOutOfStock
                        ? "error.main"
                        : "success.main",
                      fontWeight: "medium",
                    }}
                  >
                    {product.isOutOfStock
                      ? "Hết hàng"
                      : `Còn ${product.quantity} sản phẩm`}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default TopSaleProducts;
