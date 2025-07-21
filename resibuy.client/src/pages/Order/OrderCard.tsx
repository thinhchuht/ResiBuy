import { Box, Paper, Typography, Chip, Button, Divider, Avatar, Dialog, FormControl, InputLabel, Select, MenuItem, Autocomplete } from "@mui/material";
import { formatPrice } from "../../utils/priceUtils";
import type { SelectChangeEvent } from "@mui/material/Select";

import { useNavigate } from "react-router-dom";
import { OrderStatus, PaymentStatus, type Store, type Voucher, type Area } from "../../types/models";
import React, { useState, useCallback, useMemo } from "react";
import orderApi from "../../api/order.api";
import { useAuth } from "../../contexts/AuthContext";
import areaApi from "../../api/area.api";
import buildingApi from "../../api/building.api";
import roomApi from "../../api/room.api";
import { useToastify } from "../../hooks/useToastify";
import EditIcon from "@mui/icons-material/Edit";
import AddCommentIcon from "@mui/icons-material/AddComment";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import ReportIcon from "@mui/icons-material/Report";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import cartApi from "../../api/cart.api";
import { debounce } from "lodash";
import type { BuildingDto, RoomDto } from "../../types/dtoModels";
import reportApi from "../../api/report.api";

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
  shippingFee: number
  note: string;
  cancelReason: string;
  roomQueryResult: RoomQueryResult;
  store: Store;
  voucher: Voucher;
  orderItems: OrderItemQueryResult[];
  shipperId?: string;
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
  const toast = useToastify();
  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [areasData, setAreasData] = useState<Area[]>([]);
  const [buildingsData, setBuildingsData] = useState<BuildingDto[]>([]);
  const [roomsData, setRoomsData] = useState<RoomDto[]>([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<RoomDto | null>(null);
  const [editNote, setEditNote] = useState(false);
  const [noteValue, setNoteValue] = useState(order.note || "");
  const [localNote, setLocalNote] = useState(order.note || "");
  const [noteLoading, setNoteLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportOtherReason, setReportOtherReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const reportReasons = ["Hàng không đúng mô tả", "Đơn hàng bị trễ", "Thái độ shipper không tốt", "Sản phẩm bị hỏng", "Khác"];
  const [roomPage, setRoomPage] = useState(1);
  const [roomHasMore, setRoomHasMore] = useState(true);
  const [roomLoadingMore, setRoomLoadingMore] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelOtherReason, setCancelOtherReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const cancelReasons = ["Đổi ý", "Tìm được giá tốt hơn", "Thời gian giao hàng lâu", "Lý do khác"];
  const [reportTargetType, setReportTargetType] = useState<"store" | "user" | "shipper">("store");

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

  const getPaymentStatusText = (status: PaymentStatus, paymentMethod: number) => {
    switch (status) {
      case PaymentStatus.Paid:
        return "Đã thanh toán";
      case PaymentStatus.Pending:
        return "Chưa thanh toán";
      case PaymentStatus.Failed:
        if (paymentMethod === 1) {
          return "Thanh toán thất bại";
        } else if (paymentMethod === 2) {
          return "Chờ hoàn tiền";
        }
        return "Thanh toán thất bại";
      case PaymentStatus.Refunded:
        return "Đã hoàn tiền";
      default:
        return "Không xác định";
    }
  };

  const handleBuyAgain = async () => {
    if (order.orderItems.length > 0 && user?.cartId) {
      try {
        for (const item of order.orderItems) {
          await cartApi.addToCart(user.cartId, item.productDetailId, item.quantity, false);
        }
        const selectedProductDetailIds = order.orderItems.map((item) => item.productDetailId);
        navigate("/cart", { state: { selectedProductDetailIds } });
      } catch (error) {
        console.error(error);
        toast.error("Không thể thêm lại sản phẩm vào giỏ hàng!");
      }
    }
  };

  const handleCancelOrder = async (reason: string) => {
    if (user) {
      await orderApi.updateOrderSatus(user?.id, order.id, OrderStatus.Cancelled, reason);
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
    setSelectedRoom(null);
    try {
      const buildings = await buildingApi.getByAreaId(e.target.value as string);
      setBuildingsData(buildings as BuildingDto[]);
    } catch {
      toast.error("Không thể tải danh sách tòa nhà");
    }
  };

  const handleBuildingChange = async (e: SelectChangeEvent) => {
    const buildingId = e.target.value as string;
    setSelectedBuilding(buildingId);
    setSelectedRoom(null);
    setRoomsData([]);

    if (buildingId) {
      setRoomLoadingMore(true);
      setRoomPage(1);
      try {
        const rooms = await roomApi.searchInBuilding({ buildingId, pageNumber: 1, pageSize: 6, keyword: "" });
        setRoomsData(rooms.items as RoomDto[]);
        setRoomHasMore(rooms.pageNumber < rooms.totalPages);
      } catch {
        toast.error("Không thể tải danh sách phòng");
        setRoomHasMore(false);
      } finally {
        setRoomLoadingMore(false);
      }
    } else {
      setRoomHasMore(false);
    }
  };

  const searchRooms = useCallback(
    async (text: string) => {
      if (!selectedBuilding) return;

      setRoomLoadingMore(true);
      setRoomPage(1);
      try {
        const rooms = await roomApi.searchInBuilding({ buildingId: selectedBuilding, pageNumber: 1, pageSize: 6, keyword: text });
        setRoomsData(rooms.items);
        setRoomHasMore(rooms.pageNumber < rooms.totalPages);
      } catch {
        toast.error("Không thể tải danh sách phòng");
        setRoomHasMore(false);
      } finally {
        setRoomLoadingMore(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedBuilding]
  );

  const debouncedSearchRooms = useMemo(() => debounce(searchRooms, 500), [searchRooms]);

  const handleRoomScroll = async (e: React.UIEvent<HTMLElement>) => {
    const target = e.currentTarget;
    if (roomLoadingMore || !roomHasMore) return;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 20) {
      setRoomLoadingMore(true);
      try {
        const nextPage = roomPage + 1;
        const rooms = await roomApi.searchInBuilding({ buildingId: selectedBuilding, pageNumber: nextPage, pageSize: 6, keyword: "" });
        setRoomsData((prev) => [...prev, ...rooms.items]);
        setRoomPage(nextPage);
        setRoomHasMore(rooms.pageNumber < rooms.totalPages);
      } catch {
        setRoomHasMore(false);
      } finally {
        setRoomLoadingMore(false);
      }
    }
  };

  const handleChangeAddress = async () => {
    if (!selectedRoom) {
      toast.error("Vui lòng chọn phòng mới");
      return;
    }
    if (!user?.id) return;
    await orderApi.updateOrder(user?.id, order.id, selectedRoom.id ?? "", noteValue);
    setOpenAddressModal(false);
    if (onAddressChange) {
      const areaObj = areasData.find((a) => a.id === selectedArea);
      const buildingObj = buildingsData.find((b) => b.id === selectedBuilding);
      onAddressChange(order.id, areaObj?.name ?? "", buildingObj?.name ?? "", selectedRoom.name ?? "", selectedRoom.id ?? "");
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
      await orderApi.updateOrder(user.id, order.id, order.roomQueryResult.id, noteValue);
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
    let targetId = "";
    if (reportTargetType === "store") targetId = order.store.id;
    else if (reportTargetType === "user") targetId = order.userId;
    else if (reportTargetType === "shipper") targetId = order.shipperId || "";
    if (!user) {
      setReportLoading(false);
      setReportOpen(false);
      toast.error("Bạn cần đăng nhập để gửi báo cáo!");
      return;
    }
    try {
      await reportApi.create({
        orderId: order.id,
        userId: user.id,
        targetId,
        title: reportTitle,
        description: reportReason === "Khác" ? reportOtherReason : reportReason,
      });
      setReportLoading(false);
      setReportOpen(false);
      toast.success("Đã gửi báo cáo thành công!");
    } catch {
      setReportLoading(false);
      setReportOpen(false);
      toast.error("Gửi báo cáo thất bại!");
    }
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
          {order.status === OrderStatus.Cancelled && order.cancelReason && (
            <Typography variant="body2" sx={{ color: 'red', fontWeight: 600, mt: 0.5 }}>
              Lý do hủy đơn: {order.cancelReason}
            </Typography>
          )}
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
            label={getPaymentStatusText(order.paymentStatus, order.paymentMethod)}
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
              }}>
              <Avatar src={item.image?.thumbUrl} variant="rounded" sx={{ width: 80, height: 80, mr: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                    transition: "color 0.2s ease",
                  }}>
                  {item.productName}
                </Typography>
                <Typography variant="body2" sx={{ color: "#666", transition: "color 0.2s ease" }}>
                  Số lượng: {item.quantity}
                </Typography>
              </Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: "#FF385C",
                  transition: "color 0.2s ease",
                }}>
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
        {!localNote && order.status === OrderStatus.Pending && !editNote && (
          <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1, background: "#f8f9fa", borderRadius: 2, p: 1 }}>
            <Typography variant="subtitle2" sx={{ color: "#1976d2", fontWeight: 600, mb: 0.5 }}>
              Lời nhắn:
            </Typography>
            <Button size="small" onClick={handleEditNote} startIcon={<AddCommentIcon />} sx={{ minWidth: 0, px: 1 }}>
              Thêm
            </Button>
          </Box>
        )}
        {localNote && !editNote && (
          <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1, background: "#f8f9fa", borderRadius: 2, p: 1, transition: "background 0.3s" }}>
            <Typography variant="subtitle2" sx={{ color: "#1976d2", fontWeight: 600, mb: 0.5 }}>
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
          <Paper elevation={2} sx={{ mt: 1, p: 2, borderRadius: 2, background: "#f8f9fa", transition: "all 0.3s" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <TextField
                value={noteValue}
                onChange={(e) => {
                  if (e.target.value.length <= 100) setNoteValue(e.target.value);
                }}
                multiline
                minRows={2}
                maxRows={6}
                fullWidth
                variant="outlined"
                placeholder="Nhập lời nhắn cho đơn hàng..."
                disabled={noteLoading}
                sx={{ background: "white", borderRadius: 1 }}
                inputProps={{ maxLength: 100 }}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}>
                <Typography variant="caption" color={noteValue.length === 100 ? "error" : "text.secondary"}>
                  {noteValue.length}/100 ký tự
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    onClick={handleSaveNote}
                    disabled={noteLoading || noteValue.length > 100}
                    startIcon={<SaveIcon />}
                    variant="contained"
                    color="primary"
                    sx={{ borderRadius: 2, px: 2 }}>
                    Lưu
                  </Button>
                  <Button
                    size="small"
                    onClick={handleCancelEditNote}
                    disabled={noteLoading}
                    startIcon={<CloseIcon />}
                    variant="outlined"
                    color="inherit"
                    sx={{ borderRadius: 2, px: 2 }}>
                    Hủy
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
        ) : (
          localNote &&
          !editNote && (
            <Typography variant="body2" sx={{ color: "#666", whiteSpace: "pre-wrap", background: "#f8f9fa", borderRadius: 2, p: 1, mt: 0.5, transition: "background 0.3s" }}>
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
        }}>
        <Box>
          <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
            Phí vận chuyển: <b>{formatPrice(order.shippingFee)}</b>
          </Typography>
          <Typography variant="subtitle2" sx={{ color: "#666", mb: 0.5 }}>
            Tổng tiền:
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#FF385C" }}>
            {formatPrice(order.totalPrice)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          {order.status === OrderStatus.Pending && (
            <Button variant="outlined" color="error" sx={{ borderRadius: 2, textTransform: "none", px: 3 }} onClick={() => setCancelOpen(true)}>
              Hủy đơn
            </Button>
          )}
          {order.status === OrderStatus.Pending && (
            <Button variant="outlined" sx={{ borderRadius: 2, textTransform: "none", px: 3 }} onClick={handleOpenAddressModal}>
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
          <Button variant="outlined" color="warning" startIcon={<ReportIcon />} onClick={handleOpenReport} sx={{ borderRadius: 2, textTransform: "none", px: 3 }}>
            Báo cáo
          </Button>
        </Box>
      </Box>

      <Dialog
        open={openAddressModal}
        onClose={handleCloseAddressModal}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, p: 0, background: "linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)", boxShadow: "0 8px 32px #90caf940" },
        }}>
        <Box sx={{ p: 3, pb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700, color: "#1976d2", display: "flex", alignItems: "center", gap: 1 }}>
            <EditIcon sx={{ color: "#1976d2", fontSize: 28 }} />
            Đổi địa chỉ giao hàng
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: "#666", fontStyle: "italic" }}>
            Vui lòng chọn khu vực, tòa nhà và phòng mới cho đơn hàng này.
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Khu vực</InputLabel>
            <Select value={selectedArea} label="Khu vực" onChange={handleAreaChange} sx={{ borderRadius: 3, background: "#fff", "&:hover": { background: "#e3f2fd" } }}>
              {areasData.map((area) => (
                <MenuItem key={area.id} value={area.id} sx={{ borderRadius: 2, my: 0.5, fontWeight: 500 }}>
                  {area.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedArea}>
            <InputLabel>Tòa nhà</InputLabel>
            <Select value={selectedBuilding} label="Tòa nhà" onChange={handleBuildingChange} sx={{ borderRadius: 3, background: "#fff", "&:hover": { background: "#e3f2fd" } }}>
              {buildingsData.map((building) => (
                <MenuItem key={building.id} value={building.id} sx={{ borderRadius: 2, my: 0.5, fontWeight: 500 }}>
                  {building.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedBuilding}>
            <Autocomplete
              disabled={!selectedBuilding}
              options={roomsData}
              getOptionLabel={(option) => option.name}
              value={selectedRoom}
              onChange={(_, newValue) => {
                setSelectedRoom(newValue);
              }}
              onInputChange={(_, newInputValue) => {
                debouncedSearchRooms(newInputValue);
              }}
              loading={roomLoadingMore}
              loadingText="Đang tải..."
              noOptionsText="Không tìm thấy phòng"
              renderInput={(params) => <TextField {...params} label="Phòng" sx={{ background: "#fff", borderRadius: 3, "&:hover": { background: "#e3f2fd" } }} />}
              ListboxProps={{
                onScroll: handleRoomScroll,
              }}
              renderOption={(props, option) => {
                return (
                  <li {...props} key={option.id}>
                    {option.name}
                  </li>
                );
              }}
            />
          </FormControl>
          <Button
            variant="contained"
            fullWidth
            onClick={handleChangeAddress}
            disabled={!selectedRoom}
            sx={{
              mt: 1,
              borderRadius: 99,
              fontWeight: 700,
              fontSize: "1.1rem",
              background: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
              color: "#fff",
              boxShadow: "0 2px 8px #1976d233",
              py: 1.2,
              transition: "all 0.2s",
              "&:hover": {
                background: "linear-gradient(90deg, #1565c0 0%, #64b5f6 100%)",
                boxShadow: "0 4px 16px #1976d244",
              },
              "&.Mui-disabled": {
                background: "#bdbdbd",
                color: "#fff",
              },
            }}>
            Xác nhận đổi địa chỉ
          </Button>
        </Box>
      </Dialog>

      <Dialog
        open={reportOpen}
        onClose={handleCloseReport}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 },
        }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 700, color: "#ff9800", pb: 0 }}>
          <WarningAmberIcon color="warning" sx={{ fontSize: 28 }} />
          Báo cáo đơn hàng
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1, pb: 0 }}>
          <Typography variant="body2" sx={{ color: "#666", mb: 1, fontStyle: "italic" }}>
            Nếu bạn gặp vấn đề với đơn hàng, hãy gửi báo cáo để chúng tôi hỗ trợ nhanh nhất.
          </Typography>
          <TextField
            select
            label="Đối tượng báo cáo"
            value={reportTargetType}
            onChange={e => setReportTargetType(e.target.value as "store" | "user" | "shipper")}
            fullWidth
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2, background: "#fafafa" }}
          >
            <MenuItem value="store">Cửa hàng</MenuItem>
            <MenuItem value="user">Người dùng</MenuItem>
            <MenuItem value="shipper" disabled={!order.shipperId}>Shipper</MenuItem>
          </TextField>
          <TextField
            label="Tiêu đề báo cáo"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            fullWidth
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2, background: "#fafafa" }}
            inputProps={{ maxLength: 100 }}
            helperText={reportTitle.length === 0 ? "Vui lòng nhập tiêu đề" : `${reportTitle.length}/100 ký tự`}
            error={reportTitle.length === 0}
          />
          <TextField
            select
            label="Lý do báo cáo"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            fullWidth
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2, background: "#fafafa" }}
            helperText={reportReason.length === 0 ? "Vui lòng chọn lý do" : ""}
            error={reportReason.length === 0}>
            {reportReasons.map((reason) => (
              <MenuItem key={reason} value={reason}>
                {reason}
              </MenuItem>
            ))}
          </TextField>
          {reportReason === "Khác" && (
            <Box>
              <TextField
                label="Lý do khác"
                value={reportOtherReason}
                onChange={(e) => {
                  if (e.target.value.length <= 200) setReportOtherReason(e.target.value);
                }}
                fullWidth
                variant="outlined"
                size="small"
                multiline
                minRows={3}
                maxRows={6}
                inputProps={{ maxLength: 200 }}
                sx={{ borderRadius: 2, background: "#fafafa" }}
                helperText={reportOtherReason.length === 0 ? "Vui lòng nhập lý do khác" : `${reportOtherReason.length}/200 ký tự`}
                error={reportOtherReason.length === 0}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5 }}>
                <Typography variant="caption" color={reportOtherReason.length === 200 ? "error" : "text.secondary"}>
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
            disabled={reportLoading || !reportTitle || !reportReason || (reportReason === "Khác" && !reportOtherReason)}
            sx={{ borderRadius: 2, fontWeight: 700, boxShadow: "0 2px 8px #ff980033" }}>
            Gửi báo cáo
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 },
        }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 700, color: "#f44336", pb: 0 }}>
          <ReportIcon color="error" sx={{ fontSize: 28 }} />
          Lý do hủy đơn
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1, pb: 0 }}>
          <Typography variant="body2" sx={{ color: "#666", mb: 1, fontStyle: "italic" }}>
            Vui lòng chọn lý do hủy đơn để chúng tôi phục vụ tốt hơn.
          </Typography>
          <TextField
            select
            label="Lý do hủy"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            fullWidth
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2, background: "#fafafa" }}
            helperText={cancelReason.length === 0 ? "Vui lòng chọn lý do" : ""}
            error={cancelReason.length === 0}>
            {cancelReasons.map((reason) => (
              <MenuItem key={reason} value={reason}>
                {reason}
              </MenuItem>
            ))}
          </TextField>
          {cancelReason === "Lý do khác" && (
            <TextField
              label="Lý do khác"
              value={cancelOtherReason}
              onChange={(e) => {
                if (e.target.value.length <= 200) setCancelOtherReason(e.target.value);
              }}
              fullWidth
              variant="outlined"
              size="small"
              multiline
              minRows={3}
              maxRows={6}
              inputProps={{ maxLength: 200 }}
              sx={{ borderRadius: 2, background: "#fafafa" }}
              helperText={cancelOtherReason.length === 0 ? "Vui lòng nhập lý do khác" : `${cancelOtherReason.length}/200 ký tự`}
              error={cancelOtherReason.length === 0}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button onClick={() => setCancelOpen(false)} color="inherit" disabled={cancelLoading} sx={{ borderRadius: 2 }}>
            Hủy
          </Button>
          <Button
            onClick={async () => {
              setCancelLoading(true);
              await handleCancelOrder(cancelReason === "Lý do khác" ? cancelOtherReason : cancelReason);
              setCancelOpen(false);
              setCancelReason("");
              setCancelOtherReason("");
              setCancelLoading(false);
            }}
            color="error"
            variant="contained"
            disabled={cancelLoading || !cancelReason || (cancelReason === "Lý do khác" && !cancelOtherReason)}
            sx={{ borderRadius: 2, fontWeight: 700, boxShadow: "0 2px 8px #f4433333" }}>
            Xác nhận hủy
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default OrderCard;
