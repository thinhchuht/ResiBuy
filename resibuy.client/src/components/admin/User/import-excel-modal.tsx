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
}

export function ImportExcelModal({ isOpen, onClose, onSubmit }: ImportExcelModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const  toast  = useToastify();
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
        setError('Chỉ chấp nhận file Excel (.xlsx, .xls)');
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
      setError('Vui lòng chọn file Excel');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      await onSubmit(selectedFile);
      setSuccess('Nhập Excel thành công!');
      toast.success('Nhập Excel thành công!');
      setTimeout(() => {
        onClose();
        setSelectedFile(null);
        setSuccess(null);
      }, 1000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi nhập Excel';
      setError(errorMessage);
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
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
        setError('Chỉ chấp nhận file Excel (.xlsx, .xls)');
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
            Gửi lên Excel
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: "grey.600", mb: 2 }}>
            Chọn file Excel để <span style={{ fontWeight: "bold", color: "red" }}>CHO PHÉP CƯ DÂN ĐĂNG KÍ TÀI KHOẢN, KHÔNG PHẢI TẠO NGƯỜI DÙNG MỚI TRÊN HỆ THỐNG</span>. File phải có định dạng .xlsx hoặc .xls.
          </Typography>
          
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
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls"
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
                  Kéo thả file Excel vào đây
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
            "Nhập Excel"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 