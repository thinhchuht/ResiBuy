import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Box,
  Button,
  Typography,
  Chip,
  Stack,
} from "@mui/material";
import type { ProductDto } from "../../types/product";

type ProductDetailDialogProps = {
  open: boolean;
  product?: ProductDto;
  onClose: () => void;
  onSelectDetail: (detailId: number) => void;
};

const ProductDetailDialog: React.FC<ProductDetailDialogProps> = ({
  open,
  product,
  onClose,
  onSelectDetail,
}) => {
  if (!product) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {product.name}
        <Typography variant="subtitle2" color="text.secondary">
          {product.describe}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Typography variant="body2" color="text.secondary">
            Danh mục:
          </Typography>
          <Chip label={product.category?.name} size="small" />
          {product.promotion && product.promotion.isActive && (
            <Chip
              label={`Giảm ${product.promotion.discount}%`}
              color="success"
              size="small"
            />
          )}
        </Stack>
        <List>
          {product.productDetails?.map((detail) => (
            <ListItem
              button
              key={detail.id}
              onClick={() => onSelectDetail(detail.id)}
              disabled={detail.quantity === 0 || detail.isOutOfStock}
              alignItems="flex-start"
              sx={{
                border: "1px solid #eee",
                borderRadius: 2,
                mb: 1,
                bgcolor:
                  detail.quantity === 0 || detail.isOutOfStock
                    ? "#f5f5f5"
                    : "inherit",
              }}
            >
              <Box
                component="img"
                src={detail.image?.url || "/no-image.png"}
                alt={product.name}
                sx={{
                  width: 60,
                  height: 60,
                  objectFit: "cover",
                  mr: 2,
                  borderRadius: 1,
                }}
              />
              <Box flex={1}>
                <Typography
                  fontWeight="bold"
                  color={detail.isOutOfStock ? "error" : "inherit"}
                >
                  {detail.price?.toLocaleString()} đ
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {detail.weight} kg
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Đã bán: {detail.sold}
                </Typography>
                <Typography
                  variant="body2"
                  color={
                    detail.quantity === 0 || detail.isOutOfStock
                      ? "error"
                      : "success.main"
                  }
                >
                  {detail.quantity === 0 || detail.isOutOfStock
                    ? "Hết hàng"
                    : `Còn lại: ${detail.quantity}`}
                </Typography>
                {detail.additionalData?.length > 0 && (
                  <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                    {detail.additionalData.map((ad) => (
                      <Chip
                        key={ad.id}
                        label={`${ad.key}: ${ad.value}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductDetailDialog;
