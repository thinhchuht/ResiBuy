import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  Paper,
  Container,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from "@mui/material";
import { ArrowBack, Inventory, LocalOffer, Edit, Visibility as VisibilityIcon, Print as PrintIcon } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../api/base.api";
import bwipjs from 'bwip-js';
import jsPDF from 'jspdf';

interface Image {
  id?: string;
  url: string;
  thumbUrl: string;
  name: string;
}

interface AdditionalDataInput {
  id?: number;
  key: string;
  value: string;
}

interface ProductDetailInput {
  id?: number;
  price: number;
  weight: number;
  quantity: number;
  isOutOfStock: boolean;
  sold: number;
  image?: Image;
  additionalData: AdditionalDataInput[];
  barcodes: { code: string; orderItemId?: string }[];
}

interface ProductInput {
  id?: number;
  name: string;
  describe: string;
  promotionId: number;
  storeId: string;
  categoryId: string;
  expiryDate?: string;
  warrantyMonths?: number;
  productDetails: ProductDetailInput[];
}

interface CategoryDto {
  id: string;
  name: string;
}

interface PromotionDto {
  id: number;
  name: string;
  discount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function ViewProduct() {
  const { productId, storeId } = useParams<{ productId: string; storeId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductInput | null>(null);
  const [listCategory, setListCategory] = useState<CategoryDto[]>([]);
  const [listPromotions, setListPromotions] = useState<PromotionDto[]>([]);
  const [openBarcodeDialog, setOpenBarcodeDialog] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<ProductDetailInput | null>(null);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([loadCategories(), loadPromotions()]);

        if (productId) {
          const productRes = await axiosClient.get(`api/Product/${productId}`);
          if (productRes.status === 200) {
            const productData = productRes.data.data;
            setProduct({
              ...productData,
              storeId: storeId || productData.storeId,
              promotionId: productData.promotionId || 0,
              productDetails: productData.productDetails.map((detail: any) => ({
                id: detail.id,
                price: detail.price,
                weight: detail.weight,
                quantity: detail.quantity,
                isOutOfStock: detail.isOutOfStock,
                sold: detail.sold || 0,
                image: detail.image,
                additionalData: detail.additionalData,
                barcodes: detail.barcodes
                  .map((barcode: any) => ({
                    code: barcode.code ?? '',
                    orderItemId: barcode.orderItemId,
                  }))
                  .filter((barcode: { code: string }) => barcode.code.trim() !== ''),
              })),
            });
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
        console.error("Không thể tải dữ liệu sản phẩm. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productId, storeId]);

  const loadCategories = async () => {
    try {
      const response = await axiosClient.get("api/Category/categories");
      const categories: CategoryDto[] = response.data.data || [];
      setListCategory(categories);
    } catch (error) {
      console.error("Error loading categories:", error);
      console.error("Không thể tải danh sách danh mục");
    }
  };

  const loadPromotions = async () => {
    try {
      const response = await axiosClient.get("api/Promotion", {
        params: { IsActive: true },
      });
      const promotions: PromotionDto[] = response.data.data || [];
      const currentDate = new Date();
      const validPromotions = promotions.filter(
        (promotion) =>
          promotion.isActive &&
          new Date(promotion.startDate) <= currentDate &&
          new Date(promotion.endDate) >= currentDate
      );
      setListPromotions(validPromotions);
    } catch (error) {
      console.error("Error loading promotions:", error);
      console.error("Không thể tải danh sách khuyến mãi");
    }
  };

  // Helper function to generate barcode image URL
  const generateBarcodeImage = (barcode: string): string => {
    if (!barcode || barcode.trim() === '') {
      console.error('Invalid barcode:', barcode);
      return '';
    }
    try {
      const canvas = document.createElement('canvas');
      bwipjs.toCanvas(canvas, {
        bcid: 'code128',
        text: barcode,
        scale: 3,
        height: 10,
        includetext: false,
        textxalign: 'center',
      });
      const imageUrl = canvas.toDataURL('image/png');
      console.log('Generated barcode image URL:', imageUrl.substring(0, 50) + '...');
      return imageUrl;
    } catch (error) {
      console.error('Error generating barcode:', error, 'Barcode:', barcode);
      return '';
    }
  };

  // Handle opening barcode dialog
  const handleOpenBarcodeDialog = (productDetail: ProductDetailInput) => {
    if (productDetail.barcodes.length === 0) {
      console.error("Không có barcode để hiển thị!");
      return;
    }
    setSelectedProductDetail(productDetail);
    setOpenBarcodeDialog(true);
  };

  // Handle closing barcode dialog
  const handleCloseBarcodeDialog = () => {
    setOpenBarcodeDialog(false);
    setSelectedProductDetail(null);
  };

  // Handle downloading barcode image
  const handleDownloadBarcode = (barcode: string) => {
    const imageUrl = generateBarcodeImage(barcode);
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `barcode_${barcode}.png`;
      link.click();
    } else {
      console.error("Không thể tạo ảnh barcode.");
    }
  };

  // Handle generating PDF with barcodes for a specific product detail
  const handlePrintBarcodes = (productDetail: ProductDetailInput) => {
    const validBarcodes = productDetail.barcodes
      .filter(barcode => barcode.code.trim() !== '' && !barcode.orderItemId);
    if (validBarcodes.length === 0) {
      console.error("Không có barcode hợp lệ để tạo PDF!");
      return;
    }
    console.log('Generating PDF for barcodes:', validBarcodes);

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    validBarcodes.forEach((barcode, index) => {
      const imageUrl = generateBarcodeImage(barcode.code);
      if (imageUrl) {
        if (index > 0) {
          doc.addPage();
        }
        doc.addImage(imageUrl, 'PNG', 55, 100, 100, 30);
      }
    });

    doc.save(`barcodes_detail_${productDetail.id || 'unknown'}.pdf`);
  };

  // Handle generating PDF with all barcodes for all product details
  const handlePrintAllBarcodes = () => {
    if (!product || product.productDetails.every(detail => detail.barcodes.length === 0)) {
      console.error("Không có barcode nào để tạo PDF!");
      return;
    }
    const allBarcodes = product.productDetails
      .flatMap(detail => detail.barcodes)
      .filter(barcode => barcode.code.trim() !== '' && !barcode.orderItemId);
    if (allBarcodes.length === 0) {
      console.error("Không có barcode hợp lệ để tạo PDF!");
      return;
    }
    console.log('Generating PDF for all barcodes:', allBarcodes);

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    allBarcodes.forEach((barcode, index) => {
      const imageUrl = generateBarcodeImage(barcode.code);
      if (imageUrl) {
        if (index > 0) {
          doc.addPage();
        }
        doc.addImage(imageUrl, 'PNG', 55, 100, 100, 30);
      }
    });

    doc.save(`all_barcodes_${product?.id || 'unknown'}.pdf`);
  };

  // Helper function to format promotion display text
  const formatPromotionDisplay = (promotion: PromotionDto): string => {
    const startDate = new Date(promotion.startDate).toLocaleDateString('vi-VN');
    const endDate = new Date(promotion.endDate).toLocaleDateString('vi-VN');
    return `${promotion.name} (${promotion.discount}% - ${startDate} đến ${endDate})`;
  };

  // Helper function to check if promotion is ending soon
  const isPromotionEndingSoon = (promotion: PromotionDto): boolean => {
    const endDate = new Date(promotion.endDate);
    const currentDate = new Date();
    const diffTime = endDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  // Helper function to display classification text
  const classifyText = (productDetail: ProductDetailInput) => {
    return productDetail.additionalData
      .map((data) => `${data.key}: ${data.value}`)
      .join(", ");
  };

  // Get category name
  const getCategoryName = (categoryId: string) => {
    const category = listCategory.find((cat) => cat.id === categoryId);
    return category ? category.name : "Không xác định";
  };

  // Get selected promotion
  const selectedPromotion = listPromotions.find((p) => p.id === product?.promotionId);

  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Đang tải dữ liệu...
        </Typography>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Không tìm thấy thông tin sản phẩm!</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          {/* Header */}
          <Paper elevation={0} sx={{ p: 3, bgcolor: "white", borderRadius: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
              Chi tiết sản phẩm
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Xem thông tin chi tiết sản phẩm
            </Typography>
          </Paper>

          {/* Promotion ending soon warning */}
          {selectedPromotion && isPromotionEndingSoon(selectedPromotion) && (
            <Alert severity="warning" icon={<LocalOffer />}>
              Chương trình khuyến mãi "{selectedPromotion.name}" sẽ kết thúc vào{" "}
              {new Date(selectedPromotion.endDate).toLocaleDateString('vi-VN')}
            </Alert>
          )}

          {/* Product Basic Information */}
          <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Box
              sx={{
                p: 3,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                  <Edit />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  Thông tin cơ bản
                </Typography>
              </Stack>
            </Box>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Stack direction="row" spacing={3}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tên sản phẩm
                    </Typography>
                    <Typography variant="body1">{product.name}</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Danh mục
                    </Typography>
                    <Typography variant="body1">{getCategoryName(product.categoryId)}</Typography>
                  </Box>
                </Stack>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mô tả sản phẩm
                  </Typography>
                  <Typography variant="body1">{product.describe || "Không có mô tả"}</Typography>
                </Box>
                <Stack direction="row" spacing={3}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Chương trình khuyến mãi
                    </Typography>
                    <Typography variant="body1">
                      {selectedPromotion
                        ? formatPromotionDisplay(selectedPromotion)
                        : "Không có khuyến mãi"}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Thời gian bảo hành
                    </Typography>
                    <Typography variant="body1">
                      {product.warrantyMonths
                        ? `${product.warrantyMonths} tháng`
                        : "Không có"}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Hạn sử dụng
                    </Typography>
                    <Typography variant="body1">
                      {product.expiryDate
                        ? new Date(product.expiryDate).toLocaleDateString('vi-VN')
                        : "Không có"}
                    </Typography>
                  </Box>
                </Stack>
                {selectedPromotion && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      bgcolor: "primary.lighter",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "primary.light",
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <LocalOffer color="primary" />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          {selectedPromotion.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Giảm giá: {selectedPromotion.discount}% | Từ{" "}
                          {new Date(selectedPromotion.startDate).toLocaleDateString('vi-VN')} đến{" "}
                          {new Date(selectedPromotion.endDate).toLocaleDateString('vi-VN')}
                        </Typography>
                      </Box>
                      <Chip
                        label={selectedPromotion.isActive ? "Đang hoạt động" : "Không hoạt động"}
                        color={selectedPromotion.isActive ? "success" : "error"}
                        size="small"
                      />
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </CardContent>
          </Paper>

          {/* Product Details */}
          {product.productDetails.length > 0 && (
            <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
              <Box
                sx={{
                  p: 3,
                  background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                  color: "white",
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                      <Inventory />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Chi tiết sản phẩm ({product.productDetails.length})
                    </Typography>
                  </Stack>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<PrintIcon />}
                    onClick={handlePrintAllBarcodes}
                    disabled={product.productDetails.every(detail => detail.barcodes.every(barcode => barcode.orderItemId))}
                    sx={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
                  >
                    Tải PDF tất cả barcode
                  </Button>
                </Stack>
              </Box>
              <Box sx={{ overflow: "auto" }}>
                <Table sx={{ minWidth: 1000 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableCell sx={{ fontWeight: "bold", minWidth: 200 }}>
                        Phân loại
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", minWidth: 120 }}>
                        Giá (VNĐ)
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", minWidth: 120 }}>
                        Cân nặng (kg)
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", minWidth: 100 }}>
                        Số lượng
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", minWidth: 100 }}>
                        Đã bán
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", minWidth: 100 }}>
                        Hết hàng
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", minWidth: 200 }}>
                        Barcode
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", minWidth: 150 }}>
                        Ảnh sản phẩm
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", minWidth: 150 }}>
                        Hành động
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {product.productDetails.map((productDetail, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Chip
                            label={classifyText(productDetail)}
                            variant="outlined"
                            size="small"
                            sx={{ maxWidth: 200 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{productDetail.price.toLocaleString('vi-VN')}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{productDetail.weight}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{productDetail.quantity}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{productDetail.sold}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {productDetail.isOutOfStock ? "Hết hàng" : "Còn hàng"}
                          </Typography>
                        </TableCell>
                        <TableCell>
  {productDetail.barcodes.length > 0 ? (
    <Box
      sx={{
        maxHeight: 200, // ~5 dòng, tùy chỉnh theo chiều cao dòng
        overflowY: productDetail.barcodes.length > 5 ? "auto" : "visible",
      }}
    >
      <Stack direction="column" spacing={1}>
        {productDetail.barcodes.map((barcode, idx) => (
          <Stack key={idx} direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2">{barcode.code}</Typography>
            {barcode.orderItemId && (
              <Typography
                variant="caption"
                color="error"
                sx={{ fontWeight: 600 }}
              >
                (Đã bán)
              </Typography>
            )}
          </Stack>
        ))}
      </Stack>
    </Box>
  ) : (
    <Typography variant="body2">Không có</Typography>
  )}
</TableCell>

                        <TableCell>
                          {productDetail.image?.thumbUrl ? (
                            <img
                              src={productDetail.image.thumbUrl}
                              alt="Ảnh sản phẩm"
                              style={{
                                width: 80,
                                height: 80,
                                objectFit: "cover",
                                borderRadius: 8,
                                border: "2px solid #e0e0e0",
                              }}
                            />
                          ) : (
                            <Typography variant="body2">Chưa có ảnh</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Xem barcode">
                            <IconButton
                              onClick={() => handleOpenBarcodeDialog(productDetail)}
                              sx={{
                                color: "#0288d1",
                                backgroundColor: "rgba(2, 136, 209, 0.08)",
                                transition: "all 0.2s",
                                "&:hover": {
                                  backgroundColor: "rgba(2, 136, 209, 0.15)",
                                  transform: "scale(1.1)",
                                },
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Tải PDF barcode">
                            <span>
                              <IconButton
                                onClick={() => handlePrintBarcodes(productDetail)}
                                disabled={productDetail.barcodes.every(barcode => barcode.orderItemId)}
                                sx={{
                                  color: "#4caf50",
                                  backgroundColor: "rgba(76, 175, 80, 0.08)",
                                  transition: "all 0.2s",
                                  "&:hover": {
                                    backgroundColor: "rgba(76, 175, 80, 0.15)",
                                    transform: "scale(1.1)",
                                  },
                                  "&.Mui-disabled": {
                                    backgroundColor: "rgba(76, 175, 80, 0.08)",
                                    opacity: 0.5,
                                  },
                                }}
                              >
                                <PrintIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Paper>
          )}

          {/* Barcode Dialog */}
          <Dialog
            open={openBarcodeDialog}
            onClose={handleCloseBarcodeDialog}
            PaperProps={{
              sx: {
                borderRadius: 3,
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                minWidth: "400px",
                maxWidth: "600px",
                width: "100%",
                overflow: "hidden",
                border: "1px solid rgba(0,0,0,0.1)",
              },
            }}
          >
            <DialogTitle
              sx={{
                fontWeight: 700,
                fontSize: "1.5rem",
                p: 3,
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                color: "white",
              }}
            >
              Danh sách Barcode
            </DialogTitle>
            <DialogContent sx={{ p: 3, maxHeight: 400, overflowY: "auto" }}>
              {selectedProductDetail && selectedProductDetail.barcodes.length > 0 ? (
                <Stack spacing={2}>
                  {selectedProductDetail.barcodes.map((barcode, index) => (
                    <Box key={index} sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {barcode.code}
                        </Typography>
                        {barcode.orderItemId && (
                          <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>
                            (Đã bán)
                          </Typography>
                        )}
                      </Stack>
                      {barcode.orderItemId && (
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                          Order ID: {barcode.orderItemId}
                        </Typography>
                      )}
                      {generateBarcodeImage(barcode.code) ? (
                        <img
                          src={generateBarcodeImage(barcode.code)}
                          alt={`Barcode ${barcode.code}`}
                          style={{
                            width: "100%",
                            maxWidth: 300,
                            height: "auto",
                            borderRadius: 4,
                          }}
                        />
                      ) : (
                        <Typography color="error">Không thể tạo mã vạch: {barcode.code}</Typography>
                      )}
                      {!barcode.orderItemId && (
                        <Button
                          variant="outlined"
                          onClick={() => handleDownloadBarcode(barcode.code)}
                          sx={{ mt: 1 }}
                        >
                          Tải xuống ảnh
                        </Button>
                      )}
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Không có barcode nào để hiển thị.
                </Typography>
              )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center", p: 2 }}>
              <Button
                onClick={handleCloseBarcodeDialog}
                variant="outlined"
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  borderColor: "#e0e0e0",
                  color: "text.primary",
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#bdbdbd",
                    bgcolor: "rgba(0,0,0,0.02)",
                  },
                }}
              >
                Đóng
              </Button>
            </DialogActions>
          </Dialog>

          {/* Action Button */}
          <Stack direction="row" justifyContent="flex-start" sx={{ pt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate(`/store/${storeId}/productPage`)}
              size="large"
              sx={{ borderRadius: 3, px: 4, py: 1.5 }}
            >
              Quay lại
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}