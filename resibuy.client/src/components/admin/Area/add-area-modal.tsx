import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Close, LocationOn as AreaIcon } from "@mui/icons-material";
import { useAreaForm } from "./seg/utlis";
import type { AreaDto } from "../../../types/dtoModels";

interface AddAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (area: AreaDto) => void;
  editArea?: AreaDto | null;
}

export function AddAreaModal({
  isOpen,
  onClose,
  onSubmit,
  editArea,
}: AddAreaModalProps) {
  const { formData, errors, isSubmitting, handleInputChange, handleSubmit } =
    useAreaForm(editArea);

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          maxWidth: "32rem",
          margin: 0,
          borderRadius: 0,
          boxShadow: 24,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease-in-out",
        },
      }}
      PaperProps={{ sx: { bgcolor: "background.paper" } }}
    >
      <DialogTitle
        sx={{
          p: 3,
          borderBottom: 1,
          borderColor: "grey.200",
          bgcolor: "background.paper",
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ color: "grey.900", fontWeight: "medium" }}
          >
            {editArea ? "Sửa Khu vực" : "Thêm Khu vực Mới"}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "grey.500" }}
          >
            {editArea ? "Cập nhật thông tin khu vực" : "Tạo khu vực mới"}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "grey.400",
            bgcolor: "background.paper",
            p: 1,
            borderRadius: 2,
            "&:hover": {
              color: "grey.600",
              bgcolor: "grey.100",
            },
          }}
        >
          <Close sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 3,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <form onSubmit={(e) => handleSubmit(e, onSubmit)}>
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              sx={{
                color: "grey.900",
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <AreaIcon sx={{ fontSize: 20 }} />
              Thông Tin Cơ Bản
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "grey.700",
                    fontWeight: "medium",
                    mb: 1,
                  }}
                >
                  Tên Khu vực *
                </Typography>
                <TextField
                  fullWidth
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nhập tên khu vực"
                  size="small"
                  error={!!errors.name}
                  helperText={errors.name}
                  sx={{
                    bgcolor: "background.paper",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "& fieldset": {
                        borderColor: errors.name ? "error.main" : "grey.300",
                      },
                      "&:hover fieldset": {
                        borderColor: errors.name ? "error.main" : "grey.500",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "primary.main",
                        boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                      },
                    },
                    "& .MuiInputBase-input": {
                      color: "grey.700",
                      px: 1.5,
                      py: 1,
                    },
                  }}
                />
              </Box>

              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange("isActive", e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{ color: "grey.700", fontWeight: "medium" }}
                    >
                      Hoạt động
                    </Typography>
                  }
                />
              </Box>
            </Box>
          </Box>
        </form>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          borderTop: 1,
          borderColor: "grey.200",
          bgcolor: "background.paper",
          position: "sticky",
          bottom: 0,
          display: "flex",
          justifyContent: "flex-end",
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            px: 3,
            py: 1,
            bgcolor: "grey.100",
            color: "grey.700",
            borderRadius: 2,
            "&:hover": { bgcolor: "grey.200" },
          }}
        >
          Hủy
        </Button>
        <Button
          disabled={isSubmitting}
          onClick={(e) => handleSubmit(e as any, onSubmit)}
          sx={{
            px: 3,
            py: 1,
            bgcolor: "primary.main",
            color: "white",
            borderRadius: 2,
            "&:hover": { bgcolor: "primary.dark" },
            "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
          }}
        >
          {isSubmitting ? "Đang Lưu..." : editArea ? "Cập Nhật Khu vực" : "Thêm Khu vực"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}