import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Divider,
  Avatar,
  Dialog,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { formatPrice } from "../../utils/priceUtils";
import type { SelectChangeEvent } from "@mui/material/Select";

import { useNavigate } from "react-router-dom";
import {
  OrderStatus,
  PaymentStatus,
  type Store,
  type Voucher,
  type Area,
  type Building,
  type Room,
} from "../../types/models";
import React, { useState } from "react";
import orderApi from "../../api/order.api";
import { useAuth } from "../../contexts/AuthContext";
import areaApi from "../../api/area.api";
import buildingApi from "../../api/building.api";
import roomApi from "../../api/room.api";
import { useToastify } from "../../hooks/useToastify";
import EditIcon from '@mui/icons-material/Edit';
import AddCommentIcon from '@mui/icons-material/AddComment';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import ReportIcon from '@mui/icons-material/Report';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

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
  onAddressChange?: (
    orderId: string,
    area: string,
    building: string,
    room: string,
    roomId: string
  ) => void;
  onCancel?: (orderId: string) => void;
}

const OrderCard = ({
  order,
  onUpdate,
  onAddressChange,
  onCancel,
}: OrderCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToastify();
  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [areasData, setAreasData] = useState<Area[]>([]);
  const [buildingsData, setBuildingsData] = useState<Building[]>([]);
  const [roomsData, setRoomsData] = useState<Room[]>([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [editNote, setEditNote] = useState(false);
  const [noteValue, setNoteValue] = useState(order.note || "");
  const [localNote, setLocalNote] = useState(order.note || "");
  const [noteLoading, setNoteLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportOtherReason, setReportOtherReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const reportReasons = [
    "Hàng không đúng mô tả",
    "Đơn hàng bị trễ",
    "Thái độ shipper không tốt",
    "Sản phẩm bị hỏng",
    "Khác"
  ];

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
    if (user) {
      await orderApi.updateOrderSatus(
        user?.id,
        order.id,
        OrderStatus.Cancelled
      );
      if (onCancel) onCancel(order.id);
      if (onUpdate) onUpdate();
    }
  };

  const handleOpenAddressModal = async () => {
    setOpenAddressModal(true);
    try {
      const areas = await areaApi.getAll();
      setAreasData(areas);
    } catch {
      toast.error("Không thể tải danh sách khu vực");
    }
  };

  const handleCloseAddressModal = () => setOpenAddressModal(false);

  const handleAreaChange = async (e: SelectChangeEvent) => {
    setSelectedArea(e.target.value as string);
    setSelectedBuilding("");
    setSelectedRoom("");
    try {
      const buildings = await buildingApi.getByBuilingId(
        e.target.value as string
      );
      setBuildingsData(buildings);
    } catch {
      toast.error("Không thể tải danh sách tòa nhà");
    }
  };

  const handleBuildingChange = async (e: SelectChangeEvent) => {
    setSelectedBuilding(e.target.value as string);
    setSelectedRoom("");
    try {
      const rooms = await roomApi.getByBuilingId(e.target.value as string);
      setRoomsData(rooms);
    } catch {
      toast.error("Không thể tải danh sách phòng");
    }
  };

  const handleRoomChange = (e: SelectChangeEvent) => {
    setSelectedRoom(e.target.value as string);
  };

  const handleChangeAddress = async () => {
    if (!selectedRoom) {
      toast.error("Vui lòng chọn phòng mới");
      return;
    }
    if (!user?.id) return;
    await orderApi.updateOrder(
      user?.id,
      order.id,
      order.roomQueryResult.id,
      noteValue
    );
    setOpenAddressModal(false);
    if (onAddressChange) {
      const areaObj = areasData.find((a) => a.id === selectedArea);
      const buildingObj = buildingsData.find((b) => b.id === selectedBuilding);
      const roomObj = roomsData.find((r) => r.id === selectedRoom);
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

  const handleEditNote = () => setEditNote(true);
  const handleCancelEditNote = () => {
    setEditNote(false);
    setNoteValue(order.note || "");
  };
  const handleSaveNote = async () => {
    if (!user?.id) return;
    setNoteLoading(true);
    try {
      await orderApi.updateOrder(
        user.id,
        order.id,
        order.roomQueryResult.id,
        noteValue
      );
      setEditNote(false);
      setLocalNote(noteValue);
      if (onUpdate) onUpdate();
    } catch {
      toast.error("Không thể cập nhật ghi chú");
    } finally {
      setNoteLoading(false);
    }
  };

  const handleOpenReport = () => {
    setReportOpen(true);
    setReportTitle("");
    setReportReason("");
    setReportOtherReason("");
  };
  const handleCloseReport = () => setReportOpen(false);
  const handleSubmitReport = async () => {
    setReportLoading(true);
    setTimeout(() => {
      setReportLoading(false);
      setReportOpen(false);
      toast.error("Đã gửi báo cáo (demo)");
    }, 1000);
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
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ color: "#666", mb: 0.5 }}>
            Mã đơn hàng: #{order.id}
          </Typography>
          <Typography variant="subtitle2" sx={{ color: "#666" }}>
            Ngày đặt:{" "}
            {`${new Date(order.createAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })} - ${new Date(order.createAt).toLocaleDateString("vi-VN")}`}
          </Typography>
          <Typography variant="subtitle2" sx={{ color: "#666" }}>
            Ngày cập nhật:{" "}
            {`${new Date(order.updateAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })} - ${new Date(order.updateAt).toLocaleDateString("vi-VN")}`}
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
              backgroundColor: `${getPaymentStatusColor(
                order.paymentStatus
              )}30`,
              color: getPaymentStatusColor(order.paymentStatus),
              fontWeight: 600,
              height: 32,
              border: `1px solid ${getPaymentStatusColor(
                order.paymentStatus
              )}50`,
            }}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 2, borderColor: "rgb(202, 176, 172)" }} />

      {order.orderItems &&
        order.orderItems.map((item, index) => (
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
              }}
            >
              <Avatar
                src={item.image?.thumbUrl}
                variant="rounded"
                sx={{ width: 80, height: 80, mr: 2 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                    transition: "color 0.2s ease",
                  }}
                >
                  {item.productName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#666", transition: "color 0.2s ease" }}
                >
                  Số lượng: {item.quantity}
                </Typography>
              </Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: "#FF385C",
                  transition: "color 0.2s ease",
                }}
              >
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
            {order.roomQueryResult.buildingName
              ? `, ${order.roomQueryResult.buildingName}`
              : ""}
            {order.roomQueryResult.areaName
              ? `, ${order.roomQueryResult.areaName}`
              : ""}
          </Typography>
        )}
        {(!localNote && order.status === OrderStatus.Pending && !editNote) && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, background: '#f8f9fa', borderRadius: 2, p: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{ color: "#1976d2", fontWeight: 600, mb: 0.5 }}
            >
              Lời nhắn:
            </Typography>
            <Button size="small" onClick={handleEditNote} startIcon={<AddCommentIcon />} sx={{ minWidth: 0, px: 1 }}>
              Thêm
            </Button>
          </Box>
        )}
        {localNote && !editNote && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, background: '#f8f9fa', borderRadius: 2, p: 1, transition: 'background 0.3s' }}>
            <Typography
              variant="subtitle2"
              sx={{ color: "#1976d2", fontWeight: 600, mb: 0.5 }}
            >
              Lời nhắn:
            </Typography>
            {order.status === OrderStatus.Pending && (
              <Button size="small" onClick={handleEditNote} startIcon={<EditIcon />} sx={{ minWidth: 0, px: 1 }}>
                Sửa
              </Button>
            )}
          </Box>
        )}
        {editNote ? (
          <Paper elevation={2} sx={{ mt: 1, p: 2, borderRadius: 2, background: '#f8f9fa', transition: 'all 0.3s' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TextField
                value={noteValue}
                onChange={e => {
                  if (e.target.value.length <= 100) setNoteValue(e.target.value);
                }}
                multiline
                minRows={2}
                maxRows={6}
                fullWidth
                variant="outlined"
                placeholder="Nhập lời nhắn cho đơn hàng..."
                disabled={noteLoading}
                sx={{ background: 'white', borderRadius: 1 }}
                inputProps={{ maxLength: 100 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                <Typography variant="caption" color={noteValue.length === 100 ? 'error' : 'text.secondary'}>
                  {noteValue.length}/100 ký tự
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" onClick={handleSaveNote} disabled={noteLoading || noteValue.length > 100} startIcon={<SaveIcon />} variant="contained" color="primary" sx={{ borderRadius: 2, px: 2 }}>
                    Lưu
                  </Button>
                  <Button size="small" onClick={handleCancelEditNote} disabled={noteLoading} startIcon={<CloseIcon />} variant="outlined" color="inherit" sx={{ borderRadius: 2, px: 2 }}>
                    Hủy
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
        ) : (
          localNote && !editNote && (
            <Typography
              variant="body2"
              sx={{ color: "#666", whiteSpace: "pre-wrap", background: '#f8f9fa', borderRadius: 2, p: 1, mt: 0.5, transition: 'background 0.3s' }}
            >
              {localNote}
            </Typography>
          )
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
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
              }}
            >
              Mua lại
            </Button>
          )}
          <Button
            variant="outlined"
            color="warning"
            startIcon={<ReportIcon />}
            onClick={handleOpenReport}
            sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
          >
            Báo cáo
          </Button>
        </Box>
      </Box>

      <Dialog
        open={openAddressModal}
        onClose={handleCloseAddressModal}
        maxWidth="xs"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Chọn địa chỉ mới
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Khu vực</InputLabel>
            <Select
              value={selectedArea}
              label="Khu vực"
              onChange={handleAreaChange}
            >
              {areasData.map((area) => (
                <MenuItem key={area.id} value={area.id}>
                  {area.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedArea}>
            <InputLabel>Tòa nhà</InputLabel>
            <Select
              value={selectedBuilding}
              label="Tòa nhà"
              onChange={handleBuildingChange}
            >
              {buildingsData.map((building) => (
                <MenuItem key={building.id} value={building.id}>
                  {building.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedBuilding}>
            <InputLabel>Phòng</InputLabel>
            <Select
              value={selectedRoom}
              label="Phòng"
              onChange={handleRoomChange}
            >
              {roomsData.map((room) => (
                <MenuItem key={room.id} value={room.id}>
                  {room.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            fullWidth
            onClick={handleChangeAddress}
            disabled={!selectedRoom}
          >
            Xác nhận đổi địa chỉ
          </Button>
        </Box>
      </Dialog>

      <Dialog open={reportOpen} onClose={handleCloseReport} maxWidth="xs" fullWidth PaperProps={{
        sx: { borderRadius: 3, p: 1 }
      }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700, color: '#ff9800', pb: 0 }}>
          <WarningAmberIcon color="warning" sx={{ fontSize: 28 }} />
          Báo cáo đơn hàng
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, pb: 0 }}>
          <Typography variant="body2" sx={{ color: '#666', mb: 1, fontStyle: 'italic' }}>
            Nếu bạn gặp vấn đề với đơn hàng, hãy gửi báo cáo để chúng tôi hỗ trợ nhanh nhất.
          </Typography>
          <TextField
            label="Tiêu đề báo cáo"
            value={reportTitle}
            onChange={e => setReportTitle(e.target.value)}
            fullWidth
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2, background: '#fafafa' }}
            inputProps={{ maxLength: 100 }}
            helperText={reportTitle.length === 0 ? 'Vui lòng nhập tiêu đề' : `${reportTitle.length}/100 ký tự`}
            error={reportTitle.length === 0}
          />
          <TextField
            select
            label="Lý do báo cáo"
            value={reportReason}
            onChange={e => setReportReason(e.target.value)}
            fullWidth
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2, background: '#fafafa' }}
            helperText={reportReason.length === 0 ? 'Vui lòng chọn lý do' : ''}
            error={reportReason.length === 0}
          >
            {reportReasons.map(reason => (
              <MenuItem key={reason} value={reason}>{reason}</MenuItem>
            ))}
          </TextField>
          {reportReason === 'Khác' && (
            <Box>
              <TextField
                label="Lý do khác"
                value={reportOtherReason}
                onChange={e => {
                  if (e.target.value.length <= 200) setReportOtherReason(e.target.value);
                }}
                fullWidth
                variant="outlined"
                size="small"
                multiline
                minRows={3}
                maxRows={6}
                inputProps={{ maxLength: 200 }}
                sx={{ borderRadius: 2, background: '#fafafa' }}
                helperText={reportOtherReason.length === 0 ? 'Vui lòng nhập lý do khác' : `${reportOtherReason.length}/200 ký tự`}
                error={reportOtherReason.length === 0}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                <Typography variant="caption" color={reportOtherReason.length === 200 ? 'error' : 'text.secondary'}>
                  {reportOtherReason.length}/200 ký tự
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button onClick={handleCloseReport} color="inherit" disabled={reportLoading} sx={{ borderRadius: 2 }}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmitReport}
            color="warning"
            variant="contained"
            disabled={reportLoading || !reportTitle || !reportReason || (reportReason === 'Khác' && !reportOtherReason)}
            sx={{ borderRadius: 2, fontWeight: 700, boxShadow: '0 2px 8px #ff980033' }}
          >
            Gửi báo cáo
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default OrderCard;
