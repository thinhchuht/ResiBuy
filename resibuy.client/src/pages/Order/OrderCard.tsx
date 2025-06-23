import { Box, Paper, Typography, Chip, Button, Divider, Avatar, Dialog, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { formatPrice } from "../../utils/priceUtils";
import type { SelectChangeEvent } from "@mui/material/Select";

import { useNavigate } from "react-router-dom";
import { OrderStatus, PaymentStatus, type Store, type Voucher, type Area, type Building, type Room } from "../../types/models";
import React, { useState } from "react";
import orderApi from "../../api/order.api";
import { useAuth } from "../../contexts/AuthContext";
import areaApi from "../../api/area.api";
import buildingApi from "../../api/building.api";
import roomApi from "../../api/room.api";
import { useToastify } from "../../hooks/useToastify";

// Define types matching API result
interface RoomQueryResult {
  id: string;
  name: string;
  buildingName: string;
  areaName: string;
}
interface ImageResult {
  id: string;
  name: string;
  url: string;
  thumbUrl: string;
}
interface OrderItemQueryResult {
  id: string;
  productId: number;
  productDetailId: number;
  productName: string;
  quantity: number;
  price: number;
  image: ImageResult;
}
export interface OrderApiResult {
  id: string;
  userId: string;
  createAt: string;
  updateAt: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: number;
  totalPrice: number;
  note: string;
  roomQueryResult: RoomQueryResult;
  store: Store;
  voucher: Voucher;
  orderItems: OrderItemQueryResult[];
}

interface OrderCardProps {
  order: OrderApiResult;
  onUpdate?: () => void;
  onAddressChange?: (orderId: string, area: string, building: string, room: string, roomId: string) => void;
  onCancel?: (orderId: string) => void;
}

const OrderCard = ({ order, onUpdate, onAddressChange, onCancel }: OrderCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { error: showError } = useToastify();
  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [areasData, setAreasData] = useState<Area[]>([]);
  const [buildingsData, setBuildingsData] = useState<Building[]>([]);
  const [roomsData, setRoomsData] = useState<Room[]>([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return "#FFA500";
      case OrderStatus.Processing:
        return "#2196F3";
      case OrderStatus.Delivered:
        return "#4CAF50";
      case OrderStatus.Cancelled:
        return "#F44336";
      default:
        return "#666";
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return "Chờ xác nhận";
      case OrderStatus.Processing:
        return "Đang xử lý";
      case OrderStatus.Shipped:
        return "Đang giao";
      case OrderStatus.Delivered:
        return "Đã giao";
      case OrderStatus.Cancelled:
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.Paid:
        return "#4CAF50";
      case PaymentStatus.Pending:
        return "#FFA500";
      case PaymentStatus.Failed:
        return "#F44336";
      case PaymentStatus.Refunded:
        return "#2196F3";
      default:
        return "#666";
    }
  };

  const getPaymentStatusText = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.Paid:
        return "Đã thanh toán";
      case PaymentStatus.Pending:
        return "Chưa thanh toán";
      case PaymentStatus.Failed:
        return "Thanh toán thất bại";
      case PaymentStatus.Refunded:
        return "Đã hoàn tiền";
      default:
        return "Không xác định";
    }
  };

  const handleBuyAgain = () => {
    if (order.orderItems.length > 0) {
      navigate(`/product?id=${order.orderItems[0].productId}`);
    }
  };

  const handleCancelOrder = async () => {
    await orderApi.updateOrder({
      orderId: order.id,
      note: order.note,
      orderStatus: OrderStatus.Cancelled,
      userId: user?.id
    });
    if (onCancel) onCancel(order.id);
    if (onUpdate) onUpdate();
  };

  const handleOpenAddressModal = async () => {
    setOpenAddressModal(true);
    try {
      const areas = await areaApi.getAll();
      setAreasData(areas);
    } catch {
      showError("Không thể tải danh sách khu vực");
    }
  };

  const handleCloseAddressModal = () => setOpenAddressModal(false);

  const handleAreaChange = async (e: SelectChangeEvent) => {
    setSelectedArea(e.target.value as string);
    setSelectedBuilding("");
    setSelectedRoom("");
    try {
      const buildings = await buildingApi.getByBuilingId(e.target.value as string);
      setBuildingsData(buildings);
    } catch {
      showError("Không thể tải danh sách tòa nhà");
    }
  };

  const handleBuildingChange = async (e: SelectChangeEvent) => {
    setSelectedBuilding(e.target.value as string);
    setSelectedRoom("");
    try {
      const rooms = await roomApi.getByBuilingId(e.target.value as string);
      setRoomsData(rooms);
    } catch {
      showError("Không thể tải danh sách phòng");
    }
  };

  const handleRoomChange = (e: SelectChangeEvent) => {
    setSelectedRoom(e.target.value as string);
  };

  const handleChangeAddress = async () => {
    if (!selectedRoom) {
      showError("Vui lòng chọn phòng mới");
      return;
    }
    await orderApi.updateOrder({
      orderId: order.id,
      shippingAddressId: selectedRoom,
      note: order.note,
      userId: user?.id
    });
    setOpenAddressModal(false);
    if (onAddressChange) {
      const areaObj = areasData.find(a => a.id === selectedArea);
      const buildingObj = buildingsData.find(b => b.id === selectedBuilding);
      const roomObj = roomsData.find(r => r.id === selectedRoom);
      onAddressChange(
        order.id,
        areaObj?.name || "",
        buildingObj?.name || "",
        roomObj?.name || "",
        selectedRoom
      );
    }
    if (onUpdate) onUpdate();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 2,
        borderRadius: 2,
        border: "1px solid rgb(202, 176, 172)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          transform: "translateY(-2px)",
        },
      }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ color: "#666", mb: 0.5 }}>
            Mã đơn hàng: #{order.id}
          </Typography>
          <Typography variant="subtitle2" sx={{ color: "#666" }}>
            Ngày đặt: {`${new Date(order.createAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${new Date(order.createAt).toLocaleDateString("vi-VN")}`}
          </Typography>
          <Typography variant="subtitle2" sx={{ color: "#666" }}>
            Ngày cập nhật: {`${new Date(order.updateAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${new Date(order.updateAt).toLocaleDateString("vi-VN")}`}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip
            label={getStatusText(order.status)}
            sx={{
              backgroundColor: `${getStatusColor(order.status)}30`,
              color: getStatusColor(order.status),
              fontWeight: 600,
              height: 32,
              border: `1px solid ${getStatusColor(order.status)}50`,
            }}
          />
          <Chip
            label={getPaymentStatusText(order.paymentStatus)}
            sx={{
              backgroundColor: `${getPaymentStatusColor(order.paymentStatus)}30`,
              color: getPaymentStatusColor(order.paymentStatus),
              fontWeight: 600,
              height: 32,
              border: `1px solid ${getPaymentStatusColor(order.paymentStatus)}50`,
            }}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 2, borderColor: "rgb(202, 176, 172)" }} />

      {order.orderItems && order.orderItems.map((item, index) => (
        <React.Fragment key={item.id}>
          <Box
            onClick={() => navigate(`/products?id=${item.productId}`)}
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              cursor: "pointer",
              "&:hover": {
                "& .MuiTypography-root": {
                  color: "#FF385C",
                },
              },
            }}>
            <Avatar src={item.image?.thumbUrl} variant="rounded" sx={{ width: 80, height: 80, mr: 2 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, transition: "color 0.2s ease" }}>
                {item.productName}
              </Typography>
              <Typography variant="body2" sx={{ color: "#666", transition: "color 0.2s ease" }}>
                Số lượng: {item.quantity}
              </Typography>
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#FF385C", transition: "color 0.2s ease" }}>
              {formatPrice(item.price)}
            </Typography>
          </Box>
          {index < order.orderItems.length - 1 && (
            <Divider
              sx={{
                my: 2,
                borderColor: "rgb(202, 176, 172)",
                width: "80%",
                mx: "auto",
              }}
            />
          )}
        </React.Fragment>
      ))}

      <Divider sx={{ my: 2, borderColor: "rgb(202, 176, 172)" }} />

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ color: "#666", mb: 0.5 }}>
          Địa chỉ giao hàng:
        </Typography>
        {order.roomQueryResult && (
          <Typography variant="body2">
            {order.roomQueryResult.name}
            {order.roomQueryResult.buildingName ? `, ${order.roomQueryResult.buildingName}` : ""}
            {order.roomQueryResult.areaName ? `, ${order.roomQueryResult.areaName}` : ""}
          </Typography>
        )}
        {order.note && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" sx={{ color: "#1976d2", fontWeight: 600, mb: 0.5 }}>
              Lời nhắn:
            </Typography>
            <Typography variant="body2" sx={{ color: "#666", whiteSpace: "pre-wrap" }}>
              {order.note}
            </Typography>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <Box>
          <Typography variant="subtitle2" sx={{ color: "#666", mb: 0.5 }}>
            Tổng tiền:
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#FF385C" }}>
            {formatPrice(order.totalPrice)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          {order.status === OrderStatus.Pending && (
            <Button
              variant="outlined"
              color="error"
              sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
              onClick={handleCancelOrder}
            >
              Hủy đơn
            </Button>
          )}
          {order.status === OrderStatus.Pending && (
            <Button
              variant="outlined"
              sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
              onClick={handleOpenAddressModal}
            >
              Đổi địa chỉ
            </Button>
          )}
          {order.status === OrderStatus.Delivered && (
            <Button
              variant="outlined"
              onClick={handleBuyAgain}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                px: 3,
                borderColor: "#FF385C",
                color: "#FF385C",
                "&:hover": {
                  borderColor: "#FF385C",
                  backgroundColor: "#FF385C15",
                },
              }}>
              Mua lại
            </Button>
          )}
        </Box>
      </Box>

      <Dialog open={openAddressModal} onClose={handleCloseAddressModal} maxWidth="xs" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Chọn địa chỉ mới</Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Khu vực</InputLabel>
            <Select value={selectedArea} label="Khu vực" onChange={handleAreaChange}>
              {areasData.map((area) => (
                <MenuItem key={area.id} value={area.id}>{area.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedArea}>
            <InputLabel>Tòa nhà</InputLabel>
            <Select value={selectedBuilding} label="Tòa nhà" onChange={handleBuildingChange}>
              {buildingsData.map((building) => (
                <MenuItem key={building.id} value={building.id}>{building.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedBuilding}>
            <InputLabel>Phòng</InputLabel>
            <Select value={selectedRoom} label="Phòng" onChange={handleRoomChange}>
              {roomsData.map((room) => (
                <MenuItem key={room.id} value={room.id}>{room.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" fullWidth onClick={handleChangeAddress} disabled={!selectedRoom}>
            Xác nhận đổi địa chỉ
          </Button>
        </Box>
      </Dialog>
    </Paper>
  );
};

export default OrderCard;
