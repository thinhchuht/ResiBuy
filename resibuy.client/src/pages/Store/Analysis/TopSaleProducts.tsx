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
  imageUrl?: string; // 👈 Cho phép undefined
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
  product?: ProductDto; // 👈 Có thể undefined
  sale: number;
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
        const res = await axios.get(`/api/store/top-sale-products`, {
          params: { storeId, startDate, endDate },
        });

        const result = Object.values(
          res.data as Record<string, ProductAndSale>
        );
        setProducts(result);
      } catch (error) {
        console.error("Error fetching top sale products", error);
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchTopSaleProducts();
    }
  }, [storeId, startDate, endDate]);

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Top 10 sản phẩm bán chạy
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={2} justifyContent="flex-start">
        {products.map((item, idx) => {
          const product = item.product;

          if (!product) return null; // 👈 Bỏ qua nếu product null

          return (
            <Card key={product.id ?? idx} sx={{ width: 280 }}>
              <CardMedia
                component="img"
                height="160"
                image={product.imageUrl || "https://via.placeholder.com/300"}
                alt={product.name || "Ảnh sản phẩm"}
              />
              <CardContent>
                <Typography variant="h6">{product.name}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {product.describe}
                </Typography>
                <Typography>
                  Giá: {product.price.toLocaleString()} VND
                </Typography>
                <Typography>Đã bán: {item.sale}</Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default TopSaleProducts;
