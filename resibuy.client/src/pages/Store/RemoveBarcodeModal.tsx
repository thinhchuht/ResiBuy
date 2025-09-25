import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  CircularProgress,
  IconButton,
  FormControlLabel,
  Radio,
  RadioGroup,
  Alert,
  Fade,
  Chip,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { BrowserMultiFormatReader } from "@zxing/library";
import orderApi from "../../api/order.api";
import productApi from "../../api/product.api";
import { useToastify } from "../../hooks/useToastify";

interface ProductDetail {
  id: number;
  productId: number;
  productName: string;
  price: number;
  weight: number;
  quantity: number;
  isOutOfStock: boolean;
  barcode: string;
  image: {
    id: string;
    url: string;
    thumbUrl: string;
    name: string;
  };
  additionalData: Array<{
    key: string;
    value: string;
  }>;
  product: {
    id: number;
    name: string;
    describe: string;
    categoryId: string;
    storeId: string;
    isActive: boolean;
  };
}

interface RemoveBarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onBarcodeRemoved: (barcode: string) => void;
}

const RemoveBarcodeModal: React.FC<RemoveBarcodeModalProps> = ({
  isOpen,
  onClose,
  orderId, // eslint-disable-line @typescript-eslint/no-unused-vars
  onBarcodeRemoved,
}) => {
  const { error: showError, success: showSuccess } = useToastify();
  const [barcode, setBarcode] = useState("");
  const [isRemoveFromStore, setIsRemoveFromStore] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(
    null
  );
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  // Hàm gọi API để lấy thông tin sản phẩm theo barcode
  const fetchProductDetail = async (barcodeValue: string) => {
    if (!barcodeValue.trim()) return;

    setIsLoadingProduct(true);
    try {
      const response = await productApi.getDetailByBarcode(barcodeValue);
      if (response.code === 0 && response.data) {
        setProductDetail(response.data);
        showSuccess("Đã tìm thấy sản phẩm!");
      } else {
        showError(
          response.message || "Không tìm thấy sản phẩm với barcode này"
        );
        setProductDetail(null);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin sản phẩm:", error);
      showError("Không tìm thấy sản phẩm với barcode này");
      setProductDetail(null);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const startScanning = async () => {
    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        codeReader.current.decodeFromVideoDevice(
          null,
          videoRef.current,
          (result, err) => {
            if (result) {
              const scannedBarcode = result.getText();
              setBarcode(scannedBarcode);
              fetchProductDetail(scannedBarcode);
              stopScanning();
            }
            if (err) {
              console.error("Lỗi quét:", err);
            }
          }
        );
      }
    } catch (err) {
      console.error("Lỗi truy cập webcam:", err);
      showError("Không thể truy cập webcam");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    codeReader.current.reset();
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = async () => {
        try {
          const result = await codeReader.current.decodeFromImage(img);
          const decodedBarcode = result.getText();
          setBarcode(decodedBarcode);
          fetchProductDetail(decodedBarcode);
        } catch (err) {
          console.error("Lỗi giải mã hình ảnh:", err);
          showError("Không thể đọc barcode từ hình ảnh");
        } finally {
          setIsLoading(false);
          URL.revokeObjectURL(img.src);
        }
      };
    } catch (err) {
      console.error("Lỗi xử lý hình ảnh:", err);
      showError("Lỗi khi xử lý hình ảnh");
      setIsLoading(false);
    }
  };

  const handleRemoveBarcode = async () => {
    if (!barcode) {
      showError("Vui lòng nhập hoặc quét barcode");
      return;
    }

    setIsLoading(true);
    try {
      await orderApi.removeBarcodeFromOrder(barcode, isRemoveFromStore);
      onBarcodeRemoved(barcode);
      showSuccess(
        isRemoveFromStore
          ? "Đã xóa barcode khỏi cửa hàng"
          : "Đã hoàn hàng vào kho thành công"
      );
      setBarcode("");
      setProductDetail(null); // Reset thông tin sản phẩm
      setIsRemoveFromStore(false);
      handleClose();
    } catch (err) {
      console.error("Lỗi xóa barcode:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý khi nhấn Enter trong input barcode
  const handleBarcodeInputKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter" && barcode.trim()) {
      fetchProductDetail(barcode.trim());
    }
  };

  // Reset form khi modal đóng/mở
  const resetForm = () => {
    setBarcode("");
    setProductDetail(null);
    setIsRemoveFromStore(false);
    stopScanning();
  };

  // Handle close modal
  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      // Reset form khi modal mở
      setBarcode("");
      setProductDetail(null);
      setIsRemoveFromStore(false);
      stopScanning();
    }
    return () => {
      stopScanning();
    };
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{ "& .MuiDialog-paper": { maxWidth: "600px", borderRadius: 2 } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Hoàn hàng
        <IconButton onClick={handleClose} disabled={isLoading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Alert severity="info">
            Hành động này chỉ có thể thực hiện khi đơn hàng đã hoàn thành.
          </Alert>
          <TextField
            label="Nhập Barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyPress={handleBarcodeInputKeyPress}
            fullWidth
            disabled={isLoading || isLoadingProduct}
            sx={{ mb: 2 }}
          />

          {/* Hiển thị trạng thái loading */}
          {isLoadingProduct && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{ mb: 2, p: 2, backgroundColor: "#f0f4ff", borderRadius: 1 }}
            >
              <CircularProgress size={20} color="primary" />
              <Typography variant="body2" sx={{ ml: 1, color: "#2196f3" }}>
                🔍 Đang tìm kiếm sản phẩm...
              </Typography>
            </Box>
          )}

          {productDetail && (
            <Fade in={true}>
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  backgroundColor: "#f8f9fa",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, color: "#2196f3" }}>
                  📦 Thông tin sản phẩm
                </Typography>

                {/* Hình ảnh sản phẩm */}
                {productDetail.image && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mb: 2 }}
                  >
                    <img
                      src={productDetail.image.thumbUrl}
                      alt={productDetail.image.name}
                      style={{
                        maxWidth: "150px",
                        maxHeight: "150px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </Box>
                )}

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">
                    <strong>Tên sản phẩm:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#333" }}>
                    {productDetail.productName}
                  </Typography>

                  <Typography variant="body2">
                    <strong>Giá bán:</strong>
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#f44336", fontWeight: "bold" }}
                  >
                    {productDetail.price?.toLocaleString("vi-VN")} VND
                  </Typography>

                  <Typography variant="body2">
                    <strong>Barcode:</strong>
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: "monospace", color: "#666" }}
                  >
                    {productDetail.barcode}
                  </Typography>
                </Box>

                {/* Hiển thị thông tin bổ sung */}
                {productDetail.additionalData &&
                  productDetail.additionalData.length > 0 && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e0e0e0" }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: "bold", mb: 1 }}
                      >
                        Thông tin bổ sung:
                      </Typography>
                      {productDetail.additionalData.map((data, index) => (
                        <Typography key={index} variant="body2" sx={{ ml: 1 }}>
                          • <strong>{data.key}:</strong> {data.value}
                        </Typography>
                      ))}
                    </Box>
                  )}
              </Box>
            </Fade>
          )}
          <Button
            variant="outlined"
            component="label"
            disabled={isLoading}
            sx={{ mb: 2 }}
          >
            Tải lên hình ảnh Barcode
            <input
              type="file"
              accept="image/*"
              hidden
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
          </Button>
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Quét bằng Webcam:
            </Typography>
            <Box
              sx={{
                width: "100%",
                height: 200,
                bgcolor: "#000",
                borderRadius: 2,
                overflow: "hidden",
                mb: 2,
              }}
            >
              <video ref={videoRef} style={{ width: "100%", height: "100%" }} />
            </Box>
            <Button
              variant="contained"
              onClick={isScanning ? stopScanning : startScanning}
              disabled={isLoading}
              sx={{ width: "100%" }}
            >
              {isScanning ? "Dừng Quét" : "Bắt Đầu Quét"}
            </Button>
          </Box>
          <RadioGroup
            value={isRemoveFromStore ? "remove" : "return"}
            onChange={(e) => setIsRemoveFromStore(e.target.value === "remove")}
          >
            <FormControlLabel
              value="return"
              control={<Radio />}
              label="Hoàn hàng vào kho"
              disabled={isLoading}
            />
            <FormControlLabel
              value="remove"
              control={<Radio />}
              label="Xóa barcode khỏi cửa hàng"
              disabled={isLoading}
            />
          </RadioGroup>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleRemoveBarcode}
          disabled={isLoading || !barcode}
        >
          {isLoading ? <CircularProgress size={20} /> : "Xác nhận"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemoveBarcodeModal;
