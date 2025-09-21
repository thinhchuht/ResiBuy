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
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { BrowserMultiFormatReader } from "@zxing/library";
import cartApi from "../../api/cart.api";
import { useToastify } from "../../hooks/useToastify";

interface BarcodeScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartId: string;
  onAddItem: () => void;
  cartItems: OrderItem[];
  allScannedBarcodes: string[];
  onBarcodeAdded: (barcode: string, itemId: string) => void;
}

interface OrderItem {
  id: string;
  productDetailId: number;
  quantity: number;
  price: number;
  discount: number;
  product: {
    id: number;
    name: string;
    stock: number;
    image?: string;
  };
  productDetail?: {
    barcodes?: { id: number; code: string; productDetailId: number }[];
  };
}

const BarcodeScanModal: React.FC<BarcodeScanModalProps> = ({
  isOpen,
  onClose,
  cartId,
  onAddItem,
  allScannedBarcodes,
  onBarcodeAdded,
}) => {
  const toast = useToastify();
  const [barcode, setBarcode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  const startScanning = async () => {
    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        codeReader.current.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, err) => {
            if (result) {
              setBarcode(result.getText());
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
      toast.error("Không thể truy cập webcam");
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = async () => {
        try {
          const result = await codeReader.current.decodeFromImage(img);
          setBarcode(result.getText());
        } catch (err) {
          console.error("Lỗi giải mã hình ảnh:", err);
          toast.error("Không thể đọc barcode từ hình ảnh");
        } finally {
          setIsLoading(false);
          URL.revokeObjectURL(img.src);
        }
      };
    } catch (err) {
      console.error("Lỗi xử lý hình ảnh:", err);
      toast.error("Lỗi khi xử lý hình ảnh");
      setIsLoading(false);
    }
  };

  const handleAddBarcode = async () => {
    if (!barcode) {
      toast.error("Vui lòng nhập hoặc quét barcode");
      return;
    }

    console.log("Barcode hiện tại:", barcode);
    console.log("Danh sách barcode đã quét:", allScannedBarcodes);

    if (allScannedBarcodes.includes(barcode)) {
      toast.error("Barcode này đã được quét");
      return;
    }

    setIsLoading(true);
    try {
      const response = await cartApi.addByBarcode(cartId, barcode);
      const itemId = response.data.data.cartItemId;
      if (itemId) {
        onBarcodeAdded(barcode, itemId); // Sử dụng barcode đầu vào
        toast.success("Thêm sản phẩm vào giỏ hàng thành công");
        setBarcode("");
        onAddItem();
      } else {
        toast.error("Không tìm thấy ID sản phẩm trong phản hồi");
      }
    } catch (err: any) {
      console.error("Lỗi thêm barcode:", err);

    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{ "& .MuiDialog-paper": { maxWidth: "600px", borderRadius: 2 } }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Quét Barcode
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Nhập Barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            fullWidth
            disabled={isLoading}
            sx={{ mb: 2 }}
          />
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
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleAddBarcode}
          disabled={isLoading || !barcode}
        >
          {isLoading ? <CircularProgress size={20} /> : "Thêm vào Giỏ"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BarcodeScanModal;