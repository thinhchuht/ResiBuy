import { Box, Typography, Link as MuiLink, Divider, Button } from "@mui/material";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import productApi from "../../api/product.api";
import { Visibility, Store } from "@mui/icons-material";
import type { Product } from "../../types/models";
import { useToastify } from "../../hooks/useToastify";
import ArrowRightIcon from "../../assets/icons/ArrowRightIcon";
import ProductCard from "../../components/ProductCard";

const FeaturedProductSection = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToastify();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productApi.getAll(1, 12);
        console.log(response)
        if (response ) {
          setProducts(response.items);
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
        toast.error("Không thể tải sản phẩm nổi bật.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuickView = (product: Product) => {
    navigate(`/products?id=${product.id}`);
  };

  const productActions = [
    {
      icon: <Visibility sx={{ color: "#FF6B6B", fontSize: 22 }} />,
      onClick: handleQuickView,
      label: "Xem nhanh",
    },
    {
      icon: <Store sx={{ color: "#FF6B6B", fontSize: 22 }} />,
      onClick: (product: Product) => navigate(`/products?storeId=${product.storeId}`),
      label: "Ghé thăm cửa hàng",
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
          width: "85%",
          mx: "auto",
          backgroundColor: "#fafafa",
          borderRadius: 4,
          boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)",
        }}>
        <Typography variant="h6">Đang tải sản phẩm...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        alignContent: "center",
        padding: 2,
        margin: 1,
        backgroundColor: "#fafafa",
        width: "85%",
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        borderRadius: 4,
        boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)",
      }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "30px 15px",
        }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "#2c3e50",
            letterSpacing: "0.5px",
          }}>
          SẢN PHẨM BÁN CHẠY
        </Typography>
        <MuiLink
          component={Link}
          to="/products"
          sx={{
            color: "#FF6B6B",
            fontWeight: 500,
            fontSize: "1.2rem",
            paddingRight: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
            transition: "all 0.2s",
            textDecoration: "none",
            "&:hover": {
              color: "#e04225",
              textDecoration: "underline",
              transform: "translateY(-2px) scale(1.05)",
            },
          }}>
          <Button
            variant="outlined"
            sx={{
              borderRadius: 8,
              textTransform: "none",
              fontSize: "1.1rem",
              borderColor: "#FF6B6B",
              color: "#FF6B6B",
              "&:hover": {
                borderColor: "#FF5C5C",
                backgroundColor: "#FF6B6B1A",
              },
            }}>
            Xem thêm <ArrowRightIcon stroke="#FF6B6B" />
          </Button>
        </MuiLink>
      </Box>
      <Divider sx={{ backgroundColor: "#e04225", width: "80%", margin: "10px auto" }} />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "1fr 1fr 1fr 1fr",
          },
          gap: 5,
          marginBottom: 5,
          marginTop: 5,
        }}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} productActions={productActions} />
        ))}
      </Box>
    </Box>
  );
};

export default FeaturedProductSection;
