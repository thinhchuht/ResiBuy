import { Box, Typography, Card } from "@mui/material";
import { Link } from "react-router-dom";
import { Star } from "@mui/icons-material";
import type { Product } from "../types/models";
import { formatPrice } from "../utils/priceUtils";

interface ProductCardProps {
  product: Product;
  productActions: {
    icon: React.ReactNode;
    onClick: (product: Product) => void;
    label: string;
  }[];
}

const ProductCard = ({ product, productActions }: ProductCardProps) => {
  // Get productDetail with minimum price
  const defaultProductDetail = product.productDetails.reduce((min, current) => 
    (current.price < min.price ? current : min), product.productDetails[0]);

  const basePrice = defaultProductDetail.price;
  const discountedPrice = basePrice * (1 - product.discount / 100);
  // Get first image's thumbUrl from the default product detail
  const thumbUrl = defaultProductDetail.image?.thumbUrl;

  const handleActionClick = (e: React.MouseEvent, action: ProductCardProps["productActions"][0]) => {
    e.preventDefault();
    action.onClick(product);
  };

  return (
    <Card
      sx={{
        borderRadius: 8,
        border: "1px solid rgb(202, 176, 172)",
        boxShadow: "0 2px 12px 0 rgba(0,0,0,0.03)",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "visible",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 1,
        "&:hover": {
          transform: "translateY(-20px)",
          boxShadow: "0 12px 28px 0 rgba(36, 33, 33, 0.08)",
        },
        background: "#fff",
        minHeight: 500,
      }}>
      {product.discount > 0 && (
        <Box
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 2,
            background: "#FF6B6B",
            color: "#fff",
            fontWeight: 600,
            fontSize: 12,
            px: 1.2,
            py: 0.2,
            borderRadius: 3,
            boxShadow: "0 2px 8px 0 rgba(255,107,107,0.15)",
            letterSpacing: 0.5,
          }}>
          Giảm {product.discount}%
        </Box>
      )}
      <Link to={`/products?id=${product.id}`} style={{ display: "block", width: "100%" }}>
        <Box
          sx={{
            width: "100%",
            aspectRatio: "1/1",
            overflow: "hidden",
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 0.5,
            position: "relative",
            cursor: "pointer",
            "&:hover .product-actions": {
              opacity: 1,
              pointerEvents: "auto",
              transform: "translate(-50%, -50%)",
            },
          }}>
          <img
            src={thumbUrl}
            alt={product.name}
            style={{
              width: "90%",
              height: "90%",
              objectFit: "contain",
              display: "block",
              margin: "0 auto",
              transition: "transform 0.4s ease",
            }}
          />
          <Box
            className="product-actions"
            sx={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              gap: 1,
              opacity: 0,
              pointerEvents: "none",
              transition: "all 0.4s ease",
              zIndex: 3,
            }}>
            {productActions.map((action, idx) => (
              <Box
                key={idx}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#fff",
                  boxShadow: "0 4px 12px 0 rgba(0,0,0,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "#fff5f5",
                    transform: "scale(1.1)",
                  },
                }}
                onClick={(e) => handleActionClick(e, action)}
                aria-label={action.label}>
                {action.icon}
              </Box>
            ))}
          </Box>
        </Box>
      </Link>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 0.2 }}>
        {[...Array(5)].map((_, i) => (
          <Star key={i} sx={{ color: "#FFD93D", fontSize: 18, mx: 0.05 }} />
        ))}
      </Box>
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 500,
          color: "#2d3436",
          mb: 0.2,
          textAlign: "center",
          fontFamily: "'Poppins', sans-serif",
          fontSize: "0.95rem",
        }}>
        {product.name}
      </Typography>
      <Box
        sx={{
          position: "absolute",
          right: 10,
          bottom: 6,
          background: "rgba(255,107,107,0.08)",
          px: 0.8,
          py: 0.2,
          borderRadius: 3,
          fontSize: 11,
          color: "#FF6B6B",
          fontWeight: 500,
          zIndex: 2,
        }}>
        Lượt mua: {product.sold}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, justifyContent: "center", mb: 0.2 }}>
        <Typography sx={{ color: "#FF6B6B", fontWeight: 600, fontSize: "1.05rem" }}>{formatPrice(discountedPrice)}</Typography>
        {product.discount > 0 && (
          <Typography
            variant="body2"
            sx={{
              color: "#b0b0b0",
              textDecoration: "line-through",
              fontWeight: 400,
              fontSize: 13,
            }}>
            {formatPrice(basePrice)}
          </Typography>
        )}
      </Box>
    </Card>
  );
};

export default ProductCard;
