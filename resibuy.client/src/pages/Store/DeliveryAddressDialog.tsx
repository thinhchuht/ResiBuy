import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import areaApi from "../../api/area.api";
import buildingApi from "../../api/building.api";
import roomApi from "../../api/room.api";

export default function DeliveryAddressDialog({ open, onClose, onSave }) {
  const [areas, setAreas] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  const [selectedArea, setSelectedArea] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");

  // load area khi mở popup
  useEffect(() => {
    if (open) {
      areaApi.getAll().then(setAreas).catch(console.error);
    }
  }, [open]);

  const handleAreaChange = async (areaId: string) => {
    setSelectedArea(areaId);
    setSelectedBuilding("");
    setSelectedRoom("");
    try {
      const data = await buildingApi.getByAreaId(areaId);
      setBuildings(data);
      setRooms([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuildingChange = async (buildingId: string) => {
    setSelectedBuilding(buildingId);
    setSelectedRoom("");
    try {
      const res = await roomApi.getByBuildingId(buildingId, 1, 50, true);
      setRooms(res.items);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = () => {
    if (!selectedArea || !selectedBuilding || !selectedRoom) {
      alert("Vui lòng chọn đủ Area, Building và Room");
      return;
    }

    const area = areas.find((a) => a.id === selectedArea);
    const building = buildings.find((b) => b.id === selectedBuilding);
    const room = rooms.find((r) => r.id === selectedRoom);

    const deliveryAddress = {
      id: selectedRoom,
      areaId: selectedArea,
      areaName: area?.name,
      buildingId: selectedBuilding,
      buildingName: building?.name,
      roomId: selectedRoom,
      roomName: room?.name,
    };

    onSave(deliveryAddress);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chọn địa chỉ nhận hàng</DialogTitle>
      <DialogContent dividers>
        <FormControl fullWidth margin="dense">
          <InputLabel>Khu vực</InputLabel>
          <Select
            value={selectedArea}
            onChange={(e) => handleAreaChange(e.target.value)}
          >
            {areas.map((a) => (
              <MenuItem key={a.id} value={a.id}>
                {a.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense" disabled={!selectedArea}>
          <InputLabel>Tòa nhà</InputLabel>
          <Select
            value={selectedBuilding}
            onChange={(e) => handleBuildingChange(e.target.value)}
          >
            {buildings.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense" disabled={!selectedBuilding}>
          <InputLabel>Phòng</InputLabel>
          <Select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
          >
            {rooms.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSave} variant="contained">
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
}