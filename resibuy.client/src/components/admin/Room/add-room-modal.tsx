import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
} from "@mui/material";
import { useRoomForm } from "./seg/utlis";
import buildingApi from "../../../api/building.api";
import type { RoomDto, BuildingDto } from "../../../types/dtoModels";
import { useToastify } from "../../../hooks/useToastify";
import { useParams } from "react-router-dom";

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoomDto) => void;
  editRoom: RoomDto | null;
}

export default function AddRoomModal({ isOpen, onClose, onSubmit, editRoom }: AddRoomModalProps) {
  const { buildingId } = useParams<{ buildingId: string }>();
  const { formData, errors, isSubmitting, handleInputChange, handleSubmit } = useRoomForm(editRoom);
  const [buildings, setBuildings] = useState<BuildingDto[]>([]);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const toast = useToastify();

  // Lấy danh sách tòa nhà ngay khi component mount
  useEffect(() => {
    const fetchBuildings = async () => {
      setLoadingBuildings(true);
      try {
        const response = await buildingApi.getAll();
        setBuildings(response || []);
      } catch (err: any) {
        toast.error(err.message || "Lỗi khi lấy danh sách tòa nhà");
      } finally {
        setLoadingBuildings(false);
      }
    };
    fetchBuildings();
  }, [isOpen]);

  // Đặt giá trị mặc định cho form khi thêm hoặc sửa phòng
  useEffect(() => {
    if (editRoom) {
      handleInputChange("name", editRoom.name || "");
      handleInputChange("isActive", editRoom.isActive ?? true);
      handleInputChange("buildingId", buildingId || "");
    } else {
      handleInputChange("name", "");
      handleInputChange("isActive", true);
      handleInputChange("buildingId", buildingId || "");
    }
  }, [editRoom, buildingId, buildings]);

  // Tìm tên tòa nhà dựa trên buildingId
  const selectedBuilding = buildings.find((building) => building.id === formData.buildingId);

  const handleFormSubmit = async (e: React.FormEvent) => {
    await handleSubmit(e, onSubmit);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editRoom ? "Sửa Phòng" : "Thêm Phòng Mới"}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleFormSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Tên Phòng"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            margin="normal"
            required
          />
          <Box margin="normal">
            <Typography
              variant="body2"
              sx={{
                color: "grey.700",
                fontWeight: "medium",
                mb: 1,
              }}
            >
              Tòa Nhà *
            </Typography>
            {editRoom ? (
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
                {selectedBuilding ? selectedBuilding.name : "Đang tải tòa nhà..."}
              </Typography>
            ) : (
              <FormControl fullWidth error={!!errors.buildingId}>
                <InputLabel id="building-select-label">Tòa Nhà</InputLabel>
                <Select
                  labelId="building-select-label"
                  label="Tòa Nhà"
                  value={formData.buildingId || ""}
                  onChange={(e) => handleInputChange("buildingId", e.target.value)}
                  disabled={loadingBuildings}
                >
                  {loadingBuildings && (
                    <MenuItem value="" disabled>
                      Đang tải...
                    </MenuItem>
                  )}
                  {buildings.length === 0 && !loadingBuildings && (
                    <MenuItem value="" disabled>
                      Không có tòa nhà
                    </MenuItem>
                  )}
                  {buildings.map((building) => (
                    <MenuItem key={building.id} value={building.id}>
                      {building.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.buildingId && (
                  <Typography color="error" variant="caption">
                    {errors.buildingId}
                  </Typography>
                )}
              </FormControl>
            )}
          </Box>
          {editRoom && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isActive ?? true}
                  onChange={(e) => handleInputChange("isActive", e.target.checked)}
                />
              }
              label="Hoạt động"
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Hủy
        </Button>
        <Button
          type="submit"
          onClick={handleFormSubmit}
          variant="contained"
          color="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang lưu..." : editRoom ? "Cập nhật" : "Thêm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}