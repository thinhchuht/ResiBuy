import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/base.api";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardMedia,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  Chip,
  Divider,
} from "@mui/material";
import { Edit as EditIcon, Visibility as ViewIcon } from "@mui/icons-material";

interface AdditionalData {
  id: number;
  key: string;
  value: string;
  productDetailId: number;
}

interface ProductImage {
  id: string;
  url: string;
  thumbUrl: string;
  name: string;
  productDetailId: number;
}

interface ProductDetail {
  id: number;
  isOutOfStock: boolean;
  productId: number;
  sold: number;
  price: number;
  weight: number;
  image: ProductImage;
  quantity: number;
  additionalData: AdditionalData[];
}

interface Product {
  id: number;
  name: string;
  describe: string;
  isOutOfStock: boolean;
  discount: number;
  createdAt: string;
  updatedAt: string;
  storeId: string;
  categoryId: string;
  productDetails: ProductDetail[];
}

interface ApiResponse {
  code: number;
  message: string;
  data: Product;
}

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);

  useEffect(() => {
    if (!productId) return;

    setLoading(true);
    setError(null);

    axios
      .get<ApiResponse>(`/api/Product/${productId}`)
      .then((res) => {
        const json = res.data;
        if (json.code !== 0) throw new Error(json.message || "Lỗi API");

        setData(json.data);
        if (json.data.productDetails && json.data.productDetails.length > 0) {
          setSelectedDetailId(json.data.productDetails[0].id);
        }
      })
      .catch((err) => {
        if (err.response) {
          setError(
            `HTTP ${err.response.status}: ${
              err.response.data?.message || "Lỗi API"
            }`
          );
        } else {
          setError(err.message || "Lỗi khi tải dữ liệu");
        }
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const handleNavigateToUpdate = () => {
    navigate(`/store/${data?.storeId}/product-update/${productId}`);
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" p={6}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box p={6} textAlign="center">
        <Typography color="error.main" variant="h6">
          Lỗi: {error}
        </Typography>
      </Box>
    );

  if (!data)
    return (
      <Box p={6} textAlign="center">
        <Typography variant="h6">Không có dữ liệu</Typography>
      </Box>
    );

  const product = data;
  const details = product.productDetails || [];
  const selectedDetail =
    details.find((d) => d.id === selectedDetailId) || details[0];

  const price = selectedDetail ? selectedDetail.price : 0;
  const discount = product.discount || 0;
  const priceAfterDiscount = Math.round((price * (100 - discount)) / 100);

  const getVariantLabel = (detail: ProductDetail): string => {
    if (detail.additionalData && detail.additionalData.length > 0) {
      return detail.additionalData.map((ad) => ad.value).join(" / ");
    }
    return `Phiên bản ${detail.id}`;
  };

  const isProductOutOfStock =
    product.isOutOfStock || (selectedDetail && selectedDetail.isOutOfStock);

  return (
    <Box maxWidth="lg" mx="auto" p={4}>
      {/* Header with Edit Button */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight="bold">
          Chi tiết sản phẩm
        </Typography>
        <Box>
          <Button
            variant="contained"
            onClick={handleNavigateToUpdate}
            startIcon={<EditIcon />}
          >
            Cập nhật sản phẩm
          </Button>
        </Box>
      </Box>

      <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={4}>
        {/* Left: Images */}
        <Box flex={1}>
          <Card elevation={2} sx={{ mb: 2 }}>
            <img
              key={selectedDetail?.image?.url} // Force re-render
              src={
                selectedDetail?.image?.url
                  ? `${selectedDetail.image.url}?v=${Date.now()}`
                  : ""
              } // Cache busting
              alt={`${product.name} - ${
                selectedDetail ? getVariantLabel(selectedDetail) : ""
              }`}
              onLoad={() =>
                console.log("Image loaded", selectedDetail?.image?.url)
              }
              onError={(e) => console.log("Image error:", e)}
              style={{
                width: "100%",
                height: "500px",
                objectFit: "cover",
                transition: "all 0.3s ease",
                display: "block",
              }}
            />
          </Card>

          {/* Thumbnail Images */}
          <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
            {details.map((detail) => (
              <Card
                key={detail.id}
                sx={{
                  border:
                    detail.id === selectedDetailId
                      ? "3px solid #1976d2"
                      : "2px solid #e0e0e0",
                  width: 100,
                  height: 100,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: 3,
                    border: "3px solid #1976d2",
                  },
                }}
                onClick={() => {
                  setSelectedDetailId(detail.id);
                }}
              >
                <CardMedia
                  component="img"
                  height="100"
                  image={detail.image?.thumbUrl || detail.image?.url}
                  alt={`${product.name} - ${getVariantLabel(detail)}`}
                  sx={{ objectFit: "cover" }}
                />
              </Card>
            ))}
          </Box>
        </Box>

        {/* Right: Product Info */}
        <Box flex={1}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              {product.name}
            </Typography>

            <Box mb={2}>
              <Chip
                label={isProductOutOfStock ? "Hết hàng" : "Còn hàng"}
                color={isProductOutOfStock ? "error" : "success"}
                size="small"
              />
              {discount > 0 && (
                <Chip
                  label={`Giảm ${discount}%`}
                  color="secondary"
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>

            <Box mb={3}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {priceAfterDiscount.toLocaleString("vi-VN")}₫
              </Typography>
              {discount > 0 && (
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ textDecoration: "line-through" }}
                >
                  {price.toLocaleString("vi-VN")}₫
                </Typography>
              )}
            </Box>

            {details.length > 1 && (
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Phiên bản sản phẩm:
                </Typography>
                <RadioGroup
                  value={selectedDetailId}
                  onChange={(e) => setSelectedDetailId(Number(e.target.value))}
                >
                  {details.map((detail) => (
                    <FormControlLabel
                      key={detail.id}
                      value={detail.id}
                      control={<Radio color="primary" />}
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography>{getVariantLabel(detail)}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            ({detail.price.toLocaleString("vi-VN")}₫)
                          </Typography>
                          {detail.isOutOfStock && (
                            <Chip label="Hết hàng" size="small" color="error" />
                          )}
                        </Box>
                      }
                    />
                  ))}
                </RadioGroup>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Product Details */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Thông tin chi tiết
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    SKU:
                  </Typography>
                  <Typography variant="body1">{product.id}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Trọng lượng:
                  </Typography>
                  <Typography variant="body1">
                    {selectedDetail?.weight || 0} kg
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Tồn kho:
                  </Typography>
                  <Typography variant="body1">
                    {selectedDetail?.quantity || 0} sản phẩm
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Đã bán:
                  </Typography>
                  <Typography variant="body1">
                    {selectedDetail?.sold || 0} sản phẩm
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Cập nhật lần cuối:
                  </Typography>
                  <Typography variant="body1">
                    {new Date(product.updatedAt).toLocaleDateString("vi-VN")}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Product Description */}
      <Box mt={6}>
        <Card elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Mô tả sản phẩm
          </Typography>
          <Typography
            variant="body1"
            sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}
          >
            {product.describe || "Chưa có mô tả sản phẩm"}
          </Typography>
        </Card>
      </Box>
    </Box>
  );
}
