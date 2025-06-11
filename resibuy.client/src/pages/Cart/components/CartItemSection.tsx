import { Box, Typography, IconButton, Checkbox } from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type { CartItem as CartItemType } from "../../../types/models";

interface CartItemSectionProps {
  items: CartItemType[];
  selectedItems: string[];
  onSelect: (itemId: string) => void;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  onRemove: (itemId: string) => void;
}

const CartItemSection = ({
  items,
  selectedItems,
  onSelect,
  onQuantityChange,
  onRemove,
}: CartItemSectionProps) => {
  const navigate = useNavigate();

  const calculateItemTotal = (item: CartItemType): string => {
    return (item.product[0].price * item.quantity).toFixed(2);
  };

  return (
    <>
      {/* Header */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "auto 3fr 1fr 1fr 1fr",
          pb: 1,
          borderBottom: "1px solid #eee",
          mb: 2,
          fontWeight: "bold",
        }}
      >
        <Box sx={{ width: 40 }}></Box>
        <Typography variant="subtitle1" fontWeight="bold">
          SẢN PHẨM
        </Typography>
        <Typography variant="subtitle1" fontWeight="bold">
          SỐ LƯỢNG
        </Typography>
        <Typography variant="subtitle1" fontWeight="bold">
          CÂN NẶNG
        </Typography>
        <Typography variant="subtitle1" fontWeight="bold" textAlign="right">
          TỔNG CỘNG
        </Typography>
      </Box>

      {/* Items */}
      {items.map((item) => {
        const product = item.product[0];
        return (
          <Box
            key={item.id}
            sx={{
              display: "grid",
              gridTemplateColumns: "auto 3fr 1fr 1fr 1fr",
              alignItems: "center",
              py: 2,
              borderBottom: "1px solid #eee",
            }}
          >
            <Checkbox
              checked={selectedItems.includes(item.id)}
              onChange={() => onSelect(item.id)}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "contain",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/products?id=${product.id}`)}
              />
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      color: "primary.main",
                    },
                  }}
                  onClick={() => navigate(`/products?id=${product.id}`)}
                >
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Giá: ${product.price.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                size="small"
                onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <Remove fontSize="small" />
              </IconButton>
              <Typography variant="body1">{item.quantity}</Typography>
              <IconButton
                size="small"
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              >
                <Add fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => onRemove(item.id)}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>

            <Typography variant="body1">
              {(product.weight * item.quantity).toFixed(2)} kg
            </Typography>

            <Typography variant="h6" textAlign="right" color="primary.main">
              ${calculateItemTotal(item)}
            </Typography>
          </Box>
        );
      })}
    </>
  );
};

export default CartItemSection; 