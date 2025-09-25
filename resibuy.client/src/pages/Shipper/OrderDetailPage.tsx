import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tooltip,
  IconButton,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useParams } from "react-router-dom";
import orderApi from "../../api/order.api";
import shipperApi from "../../api/ship.api";
import reportApi from "../../api/report.api";
import { useAuth } from "../../contexts/AuthContext";
import { useToastify } from "../../hooks/useToastify";

import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import PersonIcon from "@mui/icons-material/Person";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentIcon from "@mui/icons-material/Payment";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import NoteAltIcon from "@mui/icons-material/NoteAlt";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import PhoneMissedIcon from "@mui/icons-material/PhoneMissed";
import CancelIcon from "@mui/icons-material/Cancel";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  image?: {
    id: string;
    url: string;
    thumbUrl: string;
    name: string;
  };
  addtionalData: {
    id: number;
    key: string;
    value: string;
  }[];
}

interface Order {
  id: string;
  totalPrice: number;
  shippingFee: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  note: string;
  user: {
    id: string;
    fullName: string;
    phoneNumber: string;
  };
  store: {
    id: string;
    name: string;
    phoneNumber: string;
  };
  shipper?: {
    id: string;
    phoneNumber: string;
  };
  roomQueryResult: {
    name: string;
    buildingName: string;
    areaName: string;
    areaId: string;
  };
  orderItems: OrderItem[];
}

function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToastify();
  const [order, setOrder] = useState<Order | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTargetType, setReportTargetType] = useState<
    "store" | "user" | "shipper"
  >("store");
  const [reportTitle, setReportTitle] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportOtherReason, setReportOtherReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const reportReasons = [
    "Hàng không đúng mô tả",
    "Khách hàng không nhận hàng",
    "Khách hàng xúc phạm",
    "Khách hàng không liên lạc được",
    "Sản phẩm bị hỏng",
    "Khác",
  ];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderApi.getById(id as string);
        setOrder(res);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết đơn hàng:", error);
      }
    };
    fetchOrder();
  }, [id]);

  const handleOpenReport = () => {
    setReportOpen(true);
    setReportTitle("");
    setReportReason("");
    setReportOtherReason("");
  };

  const handleCloseReport = () => {
    setReportOpen(false);
  };

  const handleSubmitReport = async () => {
    setReportLoading(true);
    let targetId = "";
    let reportTarget = 2; // 2: store, 1: user, 3: shipper
    if (reportTargetType === "store") {
      targetId = order?.store.id || "";
      reportTarget = 2;
    } else if (reportTargetType === "user") {
      targetId = order?.user.id || "";
      reportTarget = 1;
    } else if (reportTargetType === "shipper") {
      targetId = order?.shipper?.id || "";
      reportTarget = 3;
    }

    if (!user?.id || !order?.id) {
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
        reportTarget,
      });
      setReportLoading(false);
      setReportOpen(false);
      toast.success("Đã gửi báo cáo thành công!");
      setOrder((prev) => prev && { ...prev, status: "Reported" });
    } catch {
      setReportLoading(false);
      setReportOpen(false);
    }
  };

  const handlePickedUp = async () => {
    if (!user?.id || !order?.id) {
      toast.error("Thiếu thông tin người dùng hoặc đơn hàng");
      return;
    }
    try {
      await orderApi.updateOrderStatusShip(order.id, "Shipped", user.id);
      toast.success("Đã xác nhận lấy hàng");
      setOrder((prev) => prev && { ...prev, status: "Shipped" });
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", err);
      toast.error("Không thể cập nhật trạng thái!");
    }
  };

  const handleDelivered = async () => {
    if (!user?.id || !order?.id) {
      toast.error("Thiếu thông tin");
      return;
    }

    try {
      await orderApi.updateOrderStatusShip(order.id, "Delivered", user.id);

      if (order.roomQueryResult?.areaId) {
        await shipperApi.updateLocation({
          shipperId: user.id, // id của shipper (user.id ở đây)
          locationId: order.roomQueryResult.areaId, // areaId từ roomQueryResult
        });
      }

      toast.success("Giao hàng thành công");
      setOrder(
        (prev) =>
          prev && { ...prev, status: "Delivered", paymentStatus: "Paid" }
      );
    } catch (err) {
      console.error(err);
      toast.error("Không thể cập nhật trạng thái!");
    }
  };

  const handleCustomerNotAvailable = async () => {
    if (!user?.id || !order?.id) {
      toast.error("Thiếu thông tin");
      return;
    }

    try {
      await orderApi.updateOrderStatusShip(
        order.id,
        "CustomerNotAvailable",
        user.id
      );
      toast.success("Xác nhận không liên lạc được với khách hàng thành công");
      setOrder((prev) => prev && { ...prev, status: "CustomerNotAvailable" });
    } catch (err) {
      console.error(err);
      toast.error("Không thể cập nhật trạng thái!");
    }
  };

  const handleCancelled = async () => {
    if (!user?.id || !order?.id) {
      toast.error("Thiếu thông tin");
      return;
    }

    try {
      await orderApi.updateOrderSatus(
        user.id,
        order.id,
        "Cancelled",
        "Không liên lạc được với khách hàng"
      );
      toast.success("Xác nhận hủy đơn thành công");
      setOrder(
        (prev) =>
          prev && { ...prev, status: "Cancelled", paymentStatus: "Failed" }
      );
    } catch (err) {
      console.error(err);
      toast.error("Không thể cập nhật trạng thái!");
    }
  };

  const getOrderStatusLabel = (status: string): string => {
    switch (status) {
      case "Pending":
        return "🕒 Chờ cửa hàng xác nhận";
      case "Processing":
        return "🔄 Cửa hàng đã xác nhận";
      case "Assigned":
        return "📦 Đã gán cho người giao hàng";
      case "Shipped":
        return "🚚 Đang giao hàng";
      case "Delivered":
        return "✅ Đã giao hàng";
      case "CustomerNotAvailable":
        return "📞 Không liên lạc được với khách";
      case "Cancelled":
        return "❌ Đã hủy";
      case "Reported":
        return "⚠️ Đã báo cáo";
      case "None":
      default:
        return "Không xác định";
    }
  };

  const getPaymentMethodLabel = (method: string): string => {
    switch (method) {
      case "COD":
        return "💵 Thanh toán khi nhận hàng";
      case "BankTransfer":
        return "🏦 Chuyển khoản ngân hàng";
      default:
        return "Không xác định";
    }
  };

  const getPaymentStatusLabel = (status: string): string => {
    switch (status) {
      case "Pending":
        return "⏳ Chưa thanh toán";
      case "Paid":
        return "✅ Đã thanh toán";
      case "Failed":
        return "❌ Thanh toán thất bại";
      case "Refunded":
        return "↩️ Đã hoàn tiền";
      default:
        return "Không xác định";
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép số điện thoại!");
  };

  if (!order) return <Typography>Đang tải...</Typography>;

  const deliveryAddress = `${order.roomQueryResult.areaName}, ${order.roomQueryResult.buildingName}, ${order.roomQueryResult.name}`;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        📦 Chi tiết đơn hàng
      </Typography>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography>
              <ConfirmationNumberIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              <strong>Mã đơn:</strong> {order.id}
            </Typography>

            {/* Người đặt */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <PersonIcon />
              <Typography variant="subtitle1" fontWeight="bold">
                Người đặt:
              </Typography>
              <Typography variant="body1">
                {order.user.fullName} ({order.user.phoneNumber})
              </Typography>
              <Tooltip title="Sao chép số điện thoại">
                <IconButton
                  onClick={() => handleCopy(order.user.phoneNumber)}
                  size="small"
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>

            {/* Cửa hàng */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <StorefrontIcon />
              <Typography variant="subtitle1" fontWeight="bold">
                Cửa hàng:
              </Typography>
              <Typography variant="body1">
                {order.store.name} ({order.store.phoneNumber})
              </Typography>
              <Tooltip title="Sao chép số điện thoại">
                <IconButton
                  onClick={() => handleCopy(order.store.phoneNumber)}
                  size="small"
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>

            <Typography>
              <LocationOnIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              <strong>Địa chỉ giao hàng:</strong> {deliveryAddress}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <LocalShippingIcon sx={{ verticalAlign: "middle" }} />
              <Typography variant="body2">
                <strong>Trạng thái:</strong>
              </Typography>
              <Chip
                label={getOrderStatusLabel(order.status)}
                color={
                  order.status === "Shipped"
                    ? "success"
                    : order.status === "Assigned"
                    ? "info"
                    : order.status === "Delivered"
                    ? "default"
                    : order.status === "Cancelled"
                    ? "error"
                    : order.status === "Reported"
                    ? "warning"
                    : "default"
                }
                size="small"
              />
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <PaymentIcon sx={{ verticalAlign: "middle" }} />
              <Typography variant="body2">
                <strong>Thanh toán:</strong>{" "}
                {getPaymentMethodLabel(order.paymentMethod)}
              </Typography>
              <Chip
                label={getPaymentStatusLabel(order.paymentStatus)}
                color={
                  order.paymentStatus === "Paid"
                    ? "success"
                    : order.paymentStatus === "Failed"
                    ? "error"
                    : order.paymentStatus === "Refunded"
                    ? "default"
                    : "warning"
                }
                size="small"
              />
            </Stack>

            <Typography>
              <AttachMoneyIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              <strong>Tổng tiền hàng:</strong>{" "}
              {(order.totalPrice - order.shippingFee).toLocaleString()} đ
            </Typography>

            <Typography>
              <LocalMallIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              <strong>
                Phí ship:
              </strong> {order.shippingFee?.toLocaleString()} đ
            </Typography>

            {order.paymentMethod === "COD" ? (
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{
                  color: "error.main",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <MonetizationOnIcon sx={{ mr: 1 }} />
                Tổng tiền thu: {order.totalPrice.toLocaleString()} đ
              </Typography>
            ) : order.paymentMethod === "BankTransfer" &&
              order.paymentStatus === "Paid" ? (
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{
                  color: "error.main",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <MonetizationOnIcon sx={{ mr: 1 }} />
                Tổng tiền thu: 0 đ
              </Typography>
            ) : null}

            {order.note && (
              <Typography>
                <NoteAltIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                <strong>Ghi chú:</strong> {order.note}
              </Typography>
            )}

            <Typography variant="subtitle1" fontWeight={600}>
              <ReceiptLongIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Danh sách sản phẩm:
            </Typography>

            {order.orderItems.map((item) => (
              <Card
                key={item.id}
                variant="outlined"
                sx={{ mb: 2, p: 1.5, display: "flex", alignItems: "center" }}
              >
                {item.image?.thumbUrl && (
                  <Box
                    component="img"
                    src={item.image.url}
                    alt={item.productName}
                    sx={{
                      width: 72,
                      height: 72,
                      objectFit: "cover",
                      borderRadius: 1,
                      mr: 2,
                    }}
                  />
                )}

                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600}>{item.productName}</Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    sx={{ mt: 0.5, mb: 1 }}
                  >
                    {item.addtionalData.map((ad) => (
                      <Chip
                        key={ad.id}
                        label={`${ad.key}: ${ad.value}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Số lượng: <strong>{item.quantity}</strong> | Giá:{" "}
                    <strong>{item.price.toLocaleString()} đ</strong>
                  </Typography>
                </Box>
              </Card>
            ))}

            <Divider sx={{ my: 2 }} />

            <Stack
              direction="row"
              spacing={2}
              justifyContent="space-between"
              flexWrap="wrap"
            >
              {order.status === "Assigned" && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<LocalShippingIcon />}
                  onClick={handlePickedUp}
                >
                  Đã lấy hàng
                </Button>
              )}

              {order.status === "Shipped" && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DoneAllIcon />}
                  onClick={handleDelivered}
                >
                  Đã giao hàng
                </Button>
              )}

              {order.status === "CustomerNotAvailable" && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DoneAllIcon />}
                  onClick={handleDelivered}
                >
                  Đã giao hàng
                </Button>
              )}

              {order.status === "Shipped" && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<PhoneMissedIcon />}
                  onClick={handleCustomerNotAvailable}
                >
                  Không liên lạc được với khách
                </Button>
              )}

              {order.status === "CustomerNotAvailable" && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={handleCancelled}
                >
                  Hủy đơn hàng
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Dialog
        open={reportOpen}
        onClose={handleCloseReport}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontWeight: 700,
            color: "#ff9800",
            pb: 0,
          }}
        >
          <WarningAmberIcon color="warning" sx={{ fontSize: 28 }} />
          Báo cáo đơn hàng
        </DialogTitle>

        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 1,
            pb: 0,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "#666", mb: 1, fontStyle: "italic" }}
          >
            Nếu bạn gặp vấn đề với đơn hàng, hãy gửi báo cáo để chúng tôi hỗ trợ
            nhanh nhất.
          </Typography>

          <TextField
            select
            label="Đối tượng báo cáo"
            value={reportTargetType}
            onChange={(e) =>
              setReportTargetType(e.target.value as "store" | "user")
            }
            fullWidth
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2, background: "#fafafa" }}
          >
            <MenuItem value="store">Cửa hàng</MenuItem>
            <MenuItem value="user" disabled={user?.id === order?.user.id}>
              Người dùng
            </MenuItem>
            {/* XÓA MenuItem của shipper */}
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
            helperText={
              reportTitle.length === 0
                ? "Vui lòng nhập tiêu đề"
                : `${reportTitle.length}/100 ký tự`
            }
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
            error={reportReason.length === 0}
          >
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
                  if (e.target.value.length <= 200)
                    setReportOtherReason(e.target.value);
                }}
                fullWidth
                variant="outlined"
                size="small"
                multiline
                minRows={3}
                maxRows={6}
                inputProps={{ maxLength: 200 }}
                sx={{ borderRadius: 2, background: "#fafafa" }}
                helperText={
                  reportOtherReason.length === 0
                    ? "Vui lòng nhập lý do khác"
                    : `${reportOtherReason.length}/200 ký tự`
                }
                error={reportOtherReason.length === 0}
              />
              <Box
                sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5 }}
              >
                <Typography
                  variant="caption"
                  color={
                    reportOtherReason.length === 200
                      ? "error"
                      : "text.secondary"
                  }
                >
                  {reportOtherReason.length}/200 ký tự
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button
            onClick={handleCloseReport}
            color="inherit"
            disabled={reportLoading}
            sx={{ borderRadius: 2 }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmitReport}
            color="warning"
            variant="contained"
            disabled={
              reportLoading ||
              !reportTitle ||
              !reportReason ||
              (reportReason === "Khác" && !reportOtherReason)
            }
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              boxShadow: "0 2px 8px #ff980033",
            }}
          >
            Gửi báo cáo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default OrderDetail;
