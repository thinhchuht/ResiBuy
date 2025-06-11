import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fakeProducts } from "../../../fakeData/fakeProductData";
import {
  Box,
  Container,
  Divider,
  Typography,
} from "@mui/material";
import type { Product } from "../../../types/models";
import ProductImageSection from "./ProductImageSection";
import ProductInfoSection from "./ProductInfoSection";
import CustomerReviewsSection from "./CustomerReviewsSection";
import RelatedProductsSection from "./RelatedProductsSection";

const ProductDetail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("id");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        console.log('fetch')
        const data = fakeProducts.find((product) => product.id === productId);
        if (data) setProduct(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product details:", error);
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetail();
    }
  }, [productId]);

  const handleIncrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Typography variant="h5">Loading...</Typography>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Typography variant="h5">Product not found</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 , backgroundColor : 'white', borderRadius : 14 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
        }}
      >
        <ProductImageSection product={product} />

        <ProductInfoSection
          product={product}
          quantity={quantity}
          handleIncrementQuantity={handleIncrementQuantity}
          handleDecrementQuantity={handleDecrementQuantity}
        />
      </Box>
      <Divider />
      <CustomerReviewsSection product={product} />
      <Divider />
      <RelatedProductsSection currentProduct={product} />
    </Container>
  );
};

export default ProductDetail;
