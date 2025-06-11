import React from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Rating,
  Divider,
  IconButton,
  useTheme,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { Product } from "../../../types/models";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastify } from "../../../hooks/useToastify";
import { useNavigate } from "react-router-dom";

interface ProductInfoSectionProps {
  product: Product;
  quantity: number;
  handleIncrementQuantity: () => void;
  handleDecrementQuantity: () => void;
}

const ProductInfoSection: React.FC<ProductInfoSectionProps> = ({
  product,
  quantity,
  handleIncrementQuantity,
  handleDecrementQuantity,
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const toast = useToastify();
  const navigate = useNavigate();

  const handleAddToCart = (product: Product) => {
    if (user) {
      toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
    } else {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      navigate("/login");
    }
  };

  const handleBuy = (product: Product) => {
    if (user) {
      toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
    } else {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      navigate("/login");
    }
  }

  const discountedPrice = product.price * (1 - product.discount / 100);

  return (
    <Box sx={{ width: { xs: "100%", md: "50%" } }}>
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          {product.name}
        </Typography>

        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Rating value={4.5} precision={0.5} readOnly />
          <Typography variant="body2" color="text.secondary">
            (120 đánh giá)
          </Typography>
        </Box>

        <Box mb={3}>
          {product.discount > 0 ? (
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                ${discountedPrice.toFixed(2)}
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ textDecoration: "line-through" }}
              >
                ${product.price.toFixed(2)}
              </Typography>
              <Chip
                label={`Giảm ${product.discount}%`}
                color="error"
                size="small"
              />
            </Box>
          ) : (
            <Typography variant="h4" color="primary" fontWeight="bold">
              ${product.price.toFixed(2)}
            </Typography>
          )}
        </Box>

        <Box mb={3}>
          <Typography variant="body2" color="text.secondary">
            Chỉ còn {product.quantity} sản phẩm trong kho!
          </Typography>
          <Slider
            value={product.quantity}
            max={product.quantity + product.sold}
            min={0}
            sx={{ width: "80%" }}
            disabled
            aria-label="Stock progress"
          />
        </Box>

        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            sx={{ minWidth: "200px" }}
          >
            <Typography variant="body1" fontWeight="medium">
              Số lượng:
            </Typography>
            <Box
              display="flex"
              alignItems="center"
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
              }}
            >
              <IconButton onClick={handleDecrementQuantity} size="small">
                -
              </IconButton>
              <Typography variant="body1" sx={{ px: 1 }}>
                {quantity}
              </Typography>
              <IconButton onClick={handleIncrementQuantity} size="small">
                +
              </IconButton>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<ShoppingCartIcon />}
            disabled={product.isOutOfStock}
            sx={{
              borderRadius: 8,
              px: 4,
              py: 1.5,
              textTransform: "none",
              fontSize: "1.1rem",
              backgroundColor: "#FF6B6B",
              "&:hover": {
                backgroundColor: "#FF5C5C",
              },
              flex: 1,
            }}
            onClick={() => handleAddToCart(product)}
          >
            Thêm vào giỏ hàng
          </Button>
        </Box>

        <Button
          variant="contained"
          size="large"
          disabled={product.isOutOfStock}
          sx={{
            borderRadius: 8,
            px: 4,
            py: 1.5,
            textTransform: "none",
            fontSize: "1.1rem",
            backgroundColor: "#FF6B6B",
            "&:hover": {
              backgroundColor: "#FF5C5C",
            },
            width: "100%",
          }}
          onClick={() => handleBuy(product)}
        >
          Mua ngay
        </Button>

        <Divider sx={{ mt: 3 }} />

        <Box sx={{ p: 2 }}>
          <Accordion
            defaultExpanded
            elevation={0}
            sx={{
              borderRadius: 4,
              backgroundColor: "transparent",
              "&:before": {
                display: "none",
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="product-description-content"
              id="product-description-header"
            >
              <Typography variant="h5" fontWeight="bold">
                Mô tả sản phẩm
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" color="text.secondary" paragraph>
                {product.describe}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trọng lượng: {product.weight} kg
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Accordion
            elevation={0}
            sx={{
              borderRadius: 4,
              backgroundColor: "transparent",
              "&:before": {
                display: "none",
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="privacy-policy-content"
              id="privacy-policy-header"
            >
              <Typography variant="h5" fontWeight="bold">
                Chính sách bảo mật
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" color="text.secondary">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductInfoSection;
