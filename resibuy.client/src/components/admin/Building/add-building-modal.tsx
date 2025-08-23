import { useState, useEffect } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Close, Apartment as BuildingIcon } from "@mui/icons-material";
import { useBuildingForm } from "./seg/utlis";
import { useAreasLogic } from "../Area/seg/utlis";
import type { BuildingDto } from "../../../types/dtoModels";
import { useParams } from "react-router-dom";

interface AddBuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (building: BuildingDto) => void;
  editBuilding?: BuildingDto | null;
}

export function AddBuildingModal({
  isOpen,
  onClose,
  onSubmit,
  editBuilding,
}: AddBuildingModalProps) {
  const { areaId } = useParams<{ areaId: string }>();
  const { formData, errors, isSubmitting, handleInputChange, handleSubmit, handleClose } =
    useBuildingForm(editBuilding, areaId);
  const { areas, fetchAreas, loading: areasLoading, error: areasError } = useAreasLogic();

  // Gọi fetchAreas ngay khi component mount
  useEffect(() => {
    fetchAreas();
  }, []);

  // Tìm tên khu vực dựa trên areaId
  const selectedArea = areas.find((area) => area.id === formData.areaId);

  const handleModalClose = () => {
    handleClose(); // Gọi hàm reset form
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={handleModalClose}
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
            {editBuilding ? "Sửa Tòa Nhà" : "Thêm Tòa Nhà Mới"}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "grey.500" }}
          >
            {editBuilding ? "Cập nhật thông tin tòa nhà" : "Tạo tòa nhà mới"}
          </Typography>
        </Box>
        <IconButton
          onClick={handleModalClose}
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
              <BuildingIcon sx={{ fontSize: 20 }} />
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
                  Tên Tòa Nhà *
                </Typography>
                <TextField
                  fullWidth
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nhập tên tòa nhà"
                  size="small"
                  error={!!errors.name}
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
                {errors.name && (
                  <Typography
                    variant="caption"
                    sx={{ color: "error.main", mt: 0.5 }}
                  >
                    {errors.name}
                  </Typography>
                )}
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
                  Khu vực *
                </Typography>
                {editBuilding ? (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "grey.700",
                      bgcolor: "grey.100",
                      p: 1,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "grey.300",
                    }}
                  >
                    {areasLoading
                      ? "Đang tải khu vực..."
                      : selectedArea
                      ? selectedArea.name
                      : "Không tìm thấy khu vực"}
                  </Typography>
                ) : (
                  <FormControl fullWidth size="small" error={!!errors.areaId}>
                    <InputLabel id="area-select-label">Chọn khu vực</InputLabel>
                    <Select
                      labelId="area-select-label"
                      value={formData.areaId || ""}
                      onChange={(e) => handleInputChange("areaId", e.target.value)}
                      label="Chọn khu vực"
                      disabled={areasLoading}
                      sx={{
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        "& .MuiSelect-select": {
                          py: 1,
                          px: 1.5,
                        },
                      }}
                    >
                      {areasLoading && (
                        <MenuItem value="" disabled>
                          Đang tải khu vực...
                        </MenuItem>
                      )}
                      {areasError && (
                        <MenuItem value="" disabled>
                          Lỗi khi tải khu vực
                        </MenuItem>
                      )}
                      {areas.length === 0 && !areasLoading && !areasError && (
                        <MenuItem value="" disabled>
                          Không có khu vực nào
                        </MenuItem>
                      )}
                      {areas.map((area) => (
                        <MenuItem key={area.id} value={area.id}>
                          {area.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.areaId && (
                      <Typography
                        variant="caption"
                        sx={{ color: "error.main", mt: 0.5 }}
                      >
                        {errors.areaId}
                      </Typography>
                    )}
                  </FormControl>
                )}
              </Box>

              {editBuilding && (
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
          onClick={handleModalClose}
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
          type="submit"
          disabled={isSubmitting || areasLoading}
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
          {isSubmitting ? "Đang Lưu..." : editBuilding ? "Cập Nhật Tòa Nhà" : "Thêm Tòa Nhà"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}