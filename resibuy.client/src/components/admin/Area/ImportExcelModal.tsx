import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import { CloudUpload, Description } from "@mui/icons-material";
import { useToastify } from "../../../hooks/useToastify";

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
  onDownloadTemplate: () => void;
}

export function ImportExcelModal({ isOpen, onClose, onSubmit, onDownloadTemplate }: ImportExcelModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const toast = useToastify();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (fileExtension !== "xlsx" && fileExtension !== "xls" && fileExtension !== "csv") {
        setError("Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV (.csv)");
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setError(null);
      setSuccess(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Vui lòng chọn file Excel hoặc CSV");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      await onSubmit(selectedFile);
      setSuccess("Nhập file thành công!");
      toast.success("Nhập file thành công!");
      setTimeout(() => {
        onClose();
        setSelectedFile(null);
        setSuccess(null);
      }, 1000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra khi nhập file";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      onClose();
      setSelectedFile(null);
      setError(null);
      setSuccess(null);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (fileExtension !== "xlsx" && fileExtension !== "xls" && fileExtension !== "csv") {
        setError("Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV (.csv)");
        return;
      }

      setSelectedFile(file);
      setError(null);
      setSuccess(null);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 24,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Description sx={{ color: "primary.main" }} />
          <Typography variant="h6" sx={{ color: "grey.900" }}>
            Nhập File Excel hoặc CSV
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: "grey.600", mb: 2 }}>
           <span style={{ fontWeight: "bold", color: "red" }}>LƯU Ý:</span> Hệ thống sẽ kiểm tra tất cả các thực thể, nếu thực thể nào chưa có thì sẽ tạo mới, nếu khu vực đã tồn tại thì bạn chỉ cần nhập tên hệ thống sẽ tự thêm các thực thể còn lại. File phải có định dạng .xlsx, .xls hoặc .csv với các cột: Tên khu vực, Vĩ độ, Kinh độ, Tên tòa nhà, Tên phòng.
          </Typography>

          <Button
            variant="outlined"
            color="primary"
            onClick={onDownloadTemplate}
            sx={{ mb: 2 }}
          >
            Tải Template
          </Button>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Paper
            variant="outlined"
            sx={{
              p: 3,
              textAlign: "center",
              border: "2px dashed",
              borderColor: selectedFile ? "success.main" : "grey.300",
              bgcolor: selectedFile ? "success.light" : "grey.50",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "primary.light",
              },
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />

            <CloudUpload sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />

            {selectedFile ? (
              <Box>
                <Typography variant="h6" sx={{ color: "success.main", mb: 1 }}>
                  File đã chọn
                </Typography>
                <Typography variant="body2" sx={{ color: "grey.700" }}>
                  {selectedFile.name}
                </Typography>
                <Typography variant="caption" sx={{ color: "grey.500" }}>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" sx={{ color: "grey.700", mb: 1 }}>
                  Kéo thả file Excel hoặc CSV vào đây
                </Typography>
                <Typography variant="body2" sx={{ color: "grey.500" }}>
                  Hoặc click để chọn file
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={handleClose}
          disabled={isUploading}
          sx={{
            color: "grey.500",
            "&:hover": { bgcolor: "grey.100" },
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedFile || isUploading}
          variant="contained"
          sx={{
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "primary.dark" },
            "&:disabled": { bgcolor: "grey.300" },
          }}
        >
          {isUploading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} />
              Đang xử lý...
            </Box>
          ) : (
            "Nhập File"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}