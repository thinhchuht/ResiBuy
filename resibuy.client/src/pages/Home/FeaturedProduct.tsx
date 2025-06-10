import { Box, Typography, Link as MuiLink, Divider } from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fakeProducts } from "../../fakeData/fakeProductData";
import { ShoppingCart, Visibility, Store } from "@mui/icons-material";
import type { Product } from "../../types/models";
import { useToastify } from "../../hooks/useToastify";
import ArrowRightIcon from "../../assets/icons/ArrowRightIcon";
import { useAuth } from "../../contexts/AuthContext";
import ProductCard from "../../components/ProductCard";

const FeaturedProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products] = useState(fakeProducts.slice(0, 12));
  const toast = useToastify();
  const handleAddToCart = (product: Product) => {
    if (user) {
      toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
    } else {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      navigate("/login");
    }
  };
  const handleQuickView = (product: Product) => {
    alert(`Xem nhanh: ${product.name}`);
  };

  const productActions = [
    {
      icon: <ShoppingCart sx={{ color: "#FF6B6B", fontSize: 22 }} />,
      onClick: handleAddToCart,
      label: "Thêm vào giỏ",
    },
    {
      icon: <Visibility sx={{ color: "#FF6B6B", fontSize: 22 }} />,
      onClick: handleQuickView,
      label: "Xem nhanh",
    },
    {
      icon: <Store sx={{ color: "#FF6B6B", fontSize: 22 }} />,
      onClick: (product: Product) => navigate(`/store/${product.storeId}`),
      label: "Ghé thăm cửa hàng",
    },
  ];

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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "30px 15px" }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            marginBottom: "40px",
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
          Xem thêm <ArrowRightIcon width={24} height={24} />
        </MuiLink>
      </Box>
      <Divider sx={{ backgroundColor: "#e04225", width: "80%", margin: "10px auto" }} />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
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

export default FeaturedProduct;
