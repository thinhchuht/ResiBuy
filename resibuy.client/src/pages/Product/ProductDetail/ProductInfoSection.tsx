import React, { useState } from "react";
import { Box, Typography, Button, Chip, Rating, Divider, IconButton, useTheme, Accordion, AccordionSummary, AccordionDetails, Slider, TextField } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { Product } from "../../../types/models";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastify } from "../../../hooks/useToastify";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../../../utils/priceUtils";

interface ProductInfoSectionProps {
  product: Product;
  quantity: number;
  handleIncrementQuantity: () => void;
  handleDecrementQuantity: () => void;
  handleQuantityChange: (newQuantity: number) => void;
}

const ProductInfoSection: React.FC<ProductInfoSectionProps> = ({ product, quantity, handleIncrementQuantity, handleDecrementQuantity, handleQuantityChange }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const toast = useToastify();
  const navigate = useNavigate();

  // Group costData by key
  const costGroups = product.costData.reduce((acc: Record<string, typeof product.costData>, cost) => {
    if (!acc[cost.key]) acc[cost.key] = [];
    acc[cost.key].push(cost);
    return acc;
  }, {} as Record<string, typeof product.costData>);

  // State for selected options
  const [selectedOptions, setSelectedOptions] = useState(() => {
    const initial: Record<string, string> = {};
    Object.keys(costGroups).forEach((key) => {
      initial[key] = costGroups[key][0]?.id || "";
    });
    return initial;
  });

  // Find selected costData
  const selectedCost =
    Object.values(costGroups)
      .flat()
      .find((cost) => Object.values(selectedOptions).includes(cost.id)) || product.costData[0];

  // Handle option change
  const handleOptionChange = (key: string, id: string) => {
    setSelectedOptions((prev) => ({ ...prev, [key]: id }));
  };

  // Price logic
  const basePrice = selectedCost.price;
  const discountedPrice = basePrice * (1 - product.discount / 100);

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
  };

  const handleQuantityInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(event.target.value);
    if (isNaN(value) || value < 1) {
      value = 1; // Mặc định về 1 nếu không hợp lệ
    }
    if (value > 10) {
      value = 10; // Giới hạn tối đa là 10
    }
    handleQuantityChange(value);
  };

  return (
    <Box sx={{ width: { xs: "100%", md: "50%" } }}>
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", marginTop: 6 }}>
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
                {formatPrice(discountedPrice)}
              </Typography>
              <Typography variant="h5" color="text.secondary" sx={{ textDecoration: "line-through" }}>
                {formatPrice(basePrice)}
              </Typography>
              <Chip label={`Giảm ${product.discount}%`} color="error" size="small" />
            </Box>
          ) : (
            <Typography variant="h4" color="primary" fontWeight="bold">
              {formatPrice(basePrice)}
            </Typography>
          )}
        </Box>

        {/* Stock progress bar below price */}
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary">
            {product.isOutOfStock ? "Hết hàng" : "Số lượng có hạn"}
          </Typography>
          <Slider value={product.isOutOfStock ? 0 : 40} max={100} min={0} sx={{ width: "80%" }} disabled aria-label="Stock progress" />
        </Box>

        <Box mb={2}>
          {Object.entries(costGroups).map(([key, options]) => (
            <Box key={key} mb={1.2} display="flex" alignItems="center" gap={2}>
              <Typography sx={{ minWidth: 48, fontWeight: 500, color: "#888", fontSize: 14 }}>{key}</Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {options.map((opt) => (
                  <Button
                    key={opt.id}
                    variant={selectedOptions[key] === opt.id ? "contained" : "outlined"}
                    onClick={() => handleOptionChange(key, opt.id)}
                    sx={{
                      minWidth: 36,
                      height: 36,
                      p: 0.2,
                      borderRadius: 2,
                      borderWidth: 2,
                      boxShadow: selectedOptions[key] === opt.id ? "0 1px 4px 0 rgba(0,209,255,0.10)" : "none",
                      borderColor: selectedOptions[key] === opt.id ? "#00D1FF" : "#e0e0e0",
                      color: selectedOptions[key] === opt.id ? "#fff" : "#333",
                      background: selectedOptions[key] === opt.id ? "#00D1FF" : "#fff",
                      fontWeight: 500,
                      fontSize: 13,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      transition: "all 0.2s",
                      "&:hover": {
                        background: selectedOptions[key] === opt.id ? "#00D1FF" : "#f8f8f8",
                        color: "#00D1FF",
                        borderColor: "#00D1FF",
                      },
                    }}>
                    {key.toLowerCase().includes("màu") && product.productImgs && product.productImgs[options.indexOf(opt)] ? (
                      <img
                        src={product.productImgs[options.indexOf(opt)]?.thumbUrl}
                        alt={opt.value}
                        style={{ width: 22, height: 22, marginBottom: 2, borderRadius: 3, boxShadow: "0 1px 2px #eee" }}
                      />
                    ) : null}
                    <span>{opt.value}</span>
                  </Button>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <Box display="flex" alignItems="center" gap={2} sx={{ minWidth: "200px" }}>
            <Typography variant="body1" fontWeight="medium">
              Số lượng:
            </Typography>
            <Box
              display="flex"
              alignItems="center"
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
              }}>
              <IconButton onClick={handleDecrementQuantity} size="small" disabled={quantity <= 1}>
                -
              </IconButton>
              <TextField
                value={quantity}
                onChange={handleQuantityInputChange}
                variant="standard"
                size="small"
                sx={{
                  width: 30,
                  "& .MuiInput-root": {
                    fontWeight: 500,
                    "&:before": { borderBottom: "none" },
                    "&:after": { borderBottom: "none" },
                    "&:hover:not(.Mui-disabled):before": { borderBottom: "none" },
                  },
                  "& .MuiInput-input": {
                    textAlign: "center",
                    padding: "8px 4px",
                  },
                }}
                inputProps={{
                  min: 1,
                  max: 10,
                  style: { textAlign: "center" },
                }}
              />
              <IconButton onClick={handleIncrementQuantity} size="small" disabled={quantity >= 10}>
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
            onClick={() => handleAddToCart(product)}>
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
          onClick={() => handleBuy(product)}>
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
            }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="product-description-content" id="product-description-header">
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
            }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="privacy-policy-content" id="privacy-policy-header">
              <Typography variant="h5" fontWeight="bold">
                Chính sách bảo mật
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" color="text.secondary">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductInfoSection;
