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
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import type { AreaDto } from "../../../types/dtoModels";
import { useState } from "react";

interface AddAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (area: AreaDto) => void;
  editArea?: AreaDto | null;
}

const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "8px",
  border: "1px solid",
  borderColor: "grey.300",
};

const defaultCenter = {
  lat: 10.7769, // Trung tâm TP.HCM
  lng: 106.7009,
};

export function AddAreaModal({
  isOpen,
  onClose,
  onSubmit,
  editArea,
}: AddAreaModalProps) {
  const { formData, errors, isSubmitting, handleInputChange, handleSubmit } =
    useAreaForm(editArea);
  const [mapCenter, setMapCenter] = useState(
    editArea ? { lat: editArea.latitude, lng: editArea.longitude } : defaultCenter
  );

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      handleInputChange("latitude", lat);
      handleInputChange("longitude", lng);
      setMapCenter({ lat, lng });
    }
  };

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
                <Typography
                  variant="body2"
                  sx={{
                    color: "grey.700",
                    fontWeight: "medium",
                    mb: 1,
                  }}
                >
                  Vĩ Độ *
                </Typography>
                <TextField
                  fullWidth
                  value={formData.latitude}
                  disabled
                  size="small"
                  error={!!errors.latitude}
                  helperText={errors.latitude}
                  sx={{
                    bgcolor: "background.paper",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "& fieldset": {
                        borderColor: errors.latitude ? "error.main" : "grey.300",
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
                <Typography
                  variant="body2"
                  sx={{
                    color: "grey.700",
                    fontWeight: "medium",
                    mb: 1,
                  }}
                >
                  Kinh Độ *
                </Typography>
                <TextField
                  fullWidth
                  value={formData.longitude}
                  disabled
                  size="small"
                  error={!!errors.longitude}
                  helperText={errors.longitude}
                  sx={{
                    bgcolor: "background.paper",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "& fieldset": {
                        borderColor: errors.longitude ? "error.main" : "grey.300",
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
                <Typography
                  variant="body2"
                  sx={{
                    color: "grey.700",
                    fontWeight: "medium",
                    mb: 1,
                  }}
                >
                  Chọn Vị Trí Trên Bản Đồ
                </Typography>
                <LoadScript googleMapsApiKey="AIzaSyAjdoFr8FEz_oEzRH1PwUClVqIO3EPeX9U">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={15}
                    onClick={handleMapClick}
                  >
                    <Marker position={mapCenter} />
                  </GoogleMap>
                </LoadScript>
              </Box>

              {editArea && (
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
              )}
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