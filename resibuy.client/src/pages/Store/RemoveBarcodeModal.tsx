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
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { BrowserMultiFormatReader } from "@zxing/library";
import orderApi from "../../api/order.api";
import { useToastify } from "../../hooks/useToastify";

interface RemoveBarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onBarcodeRemoved: (barcode: string) => void;
}

const RemoveBarcodeModal: React.FC<RemoveBarcodeModalProps> = ({
  isOpen,
  onClose,
  orderId,
  onBarcodeRemoved,
}) => {
  const { error: showError, success: showSuccess } = useToastify();
  const [barcode, setBarcode] = useState("");
  const [isRemoveFromStore, setIsRemoveFromStore] = useState<boolean>(false);
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
          ? "Đã xóa barcode khỏi đơn hàng"
          : "Đã hoàn hàng vào kho thành công"
      );
      setBarcode("");
      setIsRemoveFromStore(false);
      onClose();
    } catch (err: any) {
      console.error("Lỗi xóa barcode:", err);
      showError(
        `Lỗi khi xóa barcode: ${err.response?.data?.message || "Đã có lỗi xảy ra"}`
      );
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
        Hoàn hàng
        <IconButton onClick={onClose} disabled={isLoading}>
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
              label="Xóa barcode khỏi đơn hàng"
              disabled={isLoading}
            />
          </RadioGroup>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>
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