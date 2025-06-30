import React from "react";
import { Box, Typography, Button } from "@mui/material";
import type { Product } from "../../../types/models";
import { fakeProducts } from "../../../fakeData/fakeProductData";
import ProductCard from "../../../components/ProductCard";
import { useNavigate } from 'react-router-dom';

interface RelatedProductsSectionProps {
  currentProduct: Product;
}

const RelatedProductsSection: React.FC<RelatedProductsSectionProps> = ({
  currentProduct,
}) => {
  const navigate = useNavigate();

  const relatedProducts = fakeProducts.filter(
    (product) =>
      product.categoryId === currentProduct.categoryId &&
      product.id !== currentProduct.id
  );

  if (relatedProducts.length === 0) {
    return null;
  }

  const handleProductClick = (productId: string) => {
    navigate(`/products?id=${productId}`);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", my: 4 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          textAlign="center"
        >
          Bạn cũng có thể thích
        </Typography>
        <Button
          variant="outlined"
          sx={{
            borderRadius: 8,
            px: 4,
            textTransform: "none",
            fontSize: "1.1rem",
            borderColor: "#FF6B6B",
            color: "#FF6B6B",
            "&:hover": {
              borderColor: "#FF5C5C",
              backgroundColor: "#FF6B6B1A",
            },
          }}
          onClick={() => navigate(`/products?categoryId=${currentProduct.categoryId}`)}
        >
          Xem thêm
        </Button>
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {relatedProducts.map((product) => (
          <Box
            key={product.id}
            sx={{
              width: {
                xs: "100%",
                sm: "calc(50% - 12px)",
                md: "calc(33.33% - 12px)",
                lg: "calc(30%)",
              },
              cursor: 'pointer',
            }}
            onClick={() => handleProductClick(product.id)}
          >
            <ProductCard product={product} productActions={[]} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default RelatedProductsSection;
