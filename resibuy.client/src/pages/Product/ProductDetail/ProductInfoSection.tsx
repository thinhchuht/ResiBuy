import React, { useState } from "react";
import { Box, Typography, Button, Chip, Divider, IconButton, useTheme, Accordion, AccordionSummary, AccordionDetails, Slider, TextField } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { Product } from "../../../types/models";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastify } from "../../../hooks/useToastify";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../../../utils/priceUtils";
import Tooltip from "@mui/material/Tooltip";
import cartApi from "../../../api/cart.api";
import checkoutApi from "../../../api/checkout.api";

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

  const optionGroups: Record<string, string[]> = {};
  (product.productDetails ?? []).forEach((detail) => {
    if (Array.isArray(detail.additionalData)) {
      detail.additionalData.forEach(({ key, value }) => {
        if (!optionGroups[key]) optionGroups[key] = [];
        if (!optionGroups[key].includes(value)) optionGroups[key].push(value);
      });
    }
  });

  const [selectedOptions, setSelectedOptions] = useState(() => {
    const initial: Record<string, string> = {};
    Object.entries(optionGroups).forEach(([key, values]) => {
      initial[key] = values[0];
    });
    return initial;
  });

  const selectedDetail =
    (product.productDetails ?? []).find((detail) => {
      if (!Array.isArray(detail.additionalData)) return false;
      const keys = Object.keys(selectedOptions);
      return keys.every(
        (key) => Array.isArray(detail.additionalData) && detail.additionalData.some((ad: { key: string; value: string }) => ad.key === key && ad.value === selectedOptions[key])
      );
    }) || null;

  const handleOptionChange = (key: string, value: string) => {
    const keys = Object.keys(optionGroups);
    const idx = keys.indexOf(key);

    const newSelected: Record<string, string> = {};
    keys.forEach((k, i) => {
      if (i < idx) newSelected[k] = selectedOptions[k];
      else if (i === idx) newSelected[k] = value;
    });

    for (let i = idx + 1; i < keys.length; i++) {
      const k = keys[i];
      const validValue = optionGroups[k].find((v) => {
        const testOptions = { ...newSelected, [k]: v };
        return (product.productDetails ?? []).some((detail) =>
          Object.entries(testOptions).every(
            ([kk, vv]) => Array.isArray(detail.additionalData) && detail.additionalData.some((ad: { key: string; value: string }) => ad.key === kk && ad.value === vv)
          )
        );
      });
      newSelected[k] = validValue || optionGroups[k][0];
    }

    setSelectedOptions(newSelected);
  };

  const basePrice = selectedDetail?.price || 0;
  const discountedPrice = basePrice * (1 - product.discount / 100);

  const handleAddToCart = () => {
    if (!selectedDetail || !user) return;
    cartApi
      .addToCart(user?.cartId, selectedDetail.id, quantity)
      .then((response) => {
        if (response.data.code !== -1) {
          toast.success(`Đã thêm sản phẩm vào giỏ hàng!`);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleBuy = async () => {
    if (!selectedDetail) {
      toast.error("Vui lòng chọn phân loại sản phẩm");
      return;
    }
    console.log(selectedDetail);
    if (user) {
      const item = {
        productDetailId: selectedDetail.id,
        storeId: product.storeId,
        quantity,
      };
      console.log(item);
      const response = await checkoutApi.createTempOrder(user.id, { cartItems: [item], isInstance: true });
      const tempCheckoutId = response.data;
      if (tempCheckoutId) {
        navigate("/checkout", { state: { tempCheckoutId } });
      } else {
        toast.error("Không lấy được mã đơn hàng, thử lại sau");
      }
    } else {
      toast.error("Vui lòng đăng nhập để mua hàng");
      navigate("/login");
    }
  };

  const handleQuantityInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(event.target.value);
    if (isNaN(value) || value < 1) {
      value = 1;
    }
    if (value > 10) {
      value = 10;
    }
    handleQuantityChange(value);
  };

  return (
    <Box sx={{ width: { xs: "100%", md: "50%" } }}>
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", marginTop: 6 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" mb={3}>
          {product.name}
        </Typography>

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
            {product.isOutOfStock || (selectedDetail && selectedDetail.quantity) === 0 ? "Hết hàng" : "Số lượng có hạn"}
          </Typography>
          <Slider
            value={selectedDetail ? (selectedDetail.quantity > 100 ? 100 : selectedDetail.quantity) : 0}
            max={100}
            min={0}
            sx={{ width: "80%" }}
            disabled
            aria-label="Stock progress"
          />
        </Box>

        <Box mb={2}>
          {Object.entries(optionGroups).map(([key, values], groupIdx, arr) => (
            <Box key={key} mb={1.2} display="flex" alignItems="center" gap={2}>
              <Typography sx={{ minWidth: 48, fontWeight: 500, color: "#888", fontSize: 14 }}>{key}:</Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {values.map((value) => {
                  let isValid = true;
                  if (groupIdx > 0) {
                    const testOptions: Record<string, string> = {};
                    arr.slice(0, groupIdx).forEach(([prevKey]) => {
                      testOptions[prevKey] = selectedOptions[prevKey];
                    });
                    testOptions[key] = value;
                    isValid = (product.productDetails ?? []).some((detail) =>
                      Object.entries(testOptions).every(
                        ([k, v]) => Array.isArray(detail.additionalData) && detail.additionalData.some((ad: { key: string; value: string }) => ad.key === k && ad.value === v)
                      )
                    );
                  }
                  const button = (
                    <Button
                      key={value}
                      variant={selectedOptions[key] === value ? "contained" : "outlined"}
                      onClick={() => handleOptionChange(key, value)}
                      disabled={!isValid}
                      sx={{
                        opacity: isValid ? 1 : 0.5,
                        minWidth: 36,
                        height: 36,
                        p: 0.2,
                        borderRadius: 2,
                        borderWidth: 2,
                        boxShadow: selectedOptions[key] === value ? "0 1px 4px 0 rgba(0,209,255,0.10)" : "none",
                        borderColor: selectedOptions[key] === value ? "#00D1FF" : "#e0e0e0",
                        color: selectedOptions[key] === value ? "#fff" : "#333",
                        background: selectedOptions[key] === value ? "#00D1FF" : "#fff",
                        fontWeight: 500,
                        fontSize: 13,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        transition: "all 0.2s",
                        "&:hover": {
                          background: selectedOptions[key] === value ? "#00D1FF" : "#f8f8f8",
                          color: "#00D1FF",
                          borderColor: "#00D1FF",
                        },
                      }}>
                      <span>{value}</span>
                    </Button>
                  );
                  return isValid ? (
                    button
                  ) : (
                    <Tooltip key={value} title="Hiện tại đang hết hàng" arrow>
                      <span>{button}</span>
                    </Tooltip>
                  );
                })}
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
            disabled={product.isOutOfStock || !selectedDetail}
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
            onClick={handleAddToCart}>
            Thêm vào giỏ hàng
          </Button>
        </Box>

        {!selectedDetail && (
          <Typography color="error" fontSize={14} mt={1}>
            Không có tổ hợp sản phẩm phù hợp với lựa chọn hiện tại.
          </Typography>
        )}

        <Button
          variant="contained"
          size="large"
          disabled={product.isOutOfStock || !selectedDetail}
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
          onClick={handleBuy}>
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
                Danh mục : {product.category.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {product.describe}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trọng lượng: {selectedDetail?.weight ?? "Không xác định"} kg
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
                Chúng tôi cam kết bảo vệ thông tin cá nhân của khách hàng. Mọi thông tin thanh toán và giao hàng đều được mã hóa an toàn. Chúng tôi không chia sẻ thông tin khách
                hàng cho bên thứ ba mà không có sự đồng ý. Mọi giao dịch đều được bảo mật theo tiêu chuẩn quốc tế.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductInfoSection;
