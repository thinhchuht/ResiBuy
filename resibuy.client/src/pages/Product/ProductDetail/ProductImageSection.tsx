import React from "react";
import { Box, Breadcrumbs, Paper, Typography } from "@mui/material";
import StackCard from "../../../animations/StackCard";
import type { Product } from "../../../types/models";
import { Link as RouterLink } from "react-router-dom";

interface ProductImageSectionProps {
  product: Product;
}

const ProductImageSection: React.FC<ProductImageSectionProps> = ({ product }) => {
  return (
    <Box sx={{ width: { xs: "100%", md: "50%" } }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1, fontSize: 24 }}>
        <RouterLink color="inherit" to="/">
          Trang chủ
        </RouterLink>
        <RouterLink color="inherit" to="/products">
          Sản phẩm
        </RouterLink>
        <Typography color="text.primary" fontWeight={600} fontSize={24}>
          {product.name}
        </Typography>
      </Breadcrumbs>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 4,
          backgroundColor: "transparent",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <StackCard
          cardDimensions={{ width: 400, height: 400 }}
          cardsData={product.productImages.map((img, idx) => ({ id: idx, img: img.imgUrl }))}
          randomRotation={true}
          sensitivity={100}
        />
      </Paper>
    </Box>
  );
};

export default ProductImageSection;
