import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import productApi from "../../../api/product.api";
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
        setLoading(true);
        if (productId) {
          const response = await productApi.getById(productId);
          if (response.data) {
            setProduct(response.data);
          } else {
            setProduct(null); // Product not found
          }
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [productId]);

  const handleIncrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.max(1, newQuantity));
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Typography variant="h5">Đang tải sản phẩm...</Typography>
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
        <Typography variant="h5">Không tìm thấy sản phẩm</Typography>
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
          handleQuantityChange={handleQuantityChange}
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
