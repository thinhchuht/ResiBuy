import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Stack,
  Button,
  Slide,
  Box,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import { useEventHub, HubEventType } from "../../hooks/useEventHub";
import orderApi from "../../api/order.api";
import { useAuth } from "../../contexts/AuthContext";
import { useToastify } from "../../hooks/useToastify";
import { useOrderEvent } from "../../contexts/OrderEventContext";

interface ReceiveOrderNotificationData {
  OrderId: string;
  TotalPrice: number;
  Note: string;
  StoreName: string;
  AssignedTime: string;
}

const Transition = Slide as React.ComponentType<
  TransitionProps & { children: React.ReactElement }
>;

export default function OrderAlertPopup() {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<ReceiveOrderNotificationData | null>(null);
  const { user } = useAuth();
  const { confirmOrder } = useOrderEvent(); // ✅ Đặt ở đây
  const toast = useToastify();

  useEventHub({
    [HubEventType.ReceiveOrderNotification]: (payload: unknown) => {
      if (typeof payload === "object" && payload !== null) {
        const p = payload as Record<string, unknown>;

        const parsed: ReceiveOrderNotificationData = {
          OrderId: (p.OrderId ?? p.orderId) as string,
          TotalPrice: (p.TotalPrice ?? p.totalPrice) as number,
          Note: (p.Note ?? p.note) as string,
          StoreName: (p.StoreName ?? p.storeName) as string,
          AssignedTime: (p.AssignedTime ?? p.assignedTime) as string,
        };

        if (
          parsed.OrderId &&
          parsed.TotalPrice !== undefined &&
          parsed.StoreName &&
          parsed.AssignedTime
        ) {
          setData(parsed);
          setVisible(true);
          console.log("📦 Nhận đơn hàng:", parsed);
        } else {
          console.warn("❌ Payload thiếu thông tin cần thiết:", payload);
        }
      } else {
        console.warn("❌ Payload không hợp lệ:", payload);
      }
    },
  });

  const handleConfirm = async () => {
    if (!user?.id || !data?.OrderId) {
      toast.error("Thiếu thông tin người dùng hoặc đơn hàng");
      return;
    }

    try {
      await orderApi.updateOrderStatusShip(
        data.OrderId,
        "ShippedAccepted",
        user.id
      );
      confirmOrder(data.OrderId);
      toast.success("Đã xác nhận đơn hàng thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật trạng thái đơn:", err);
      toast.error("Không thể xác nhận đơn hàng!");
    }

    setVisible(false);
  };

  const handleClose = () => setVisible(false);

  if (!data) return null;

  return (
    <Dialog
      open={visible}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle
        sx={{ textAlign: "center", fontWeight: "bold", color: "green" }}
      >
        🚚 Bạn có đơn hàng mới!
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={1}>
          <Box>
            <Typography variant="body1">
              <strong>Mã đơn hàng:</strong> {data.OrderId}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body1">
              <strong>Cửa hàng:</strong> {data.StoreName}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body1">
              <strong>Ghi chú:</strong> {data.Note || "Không có ghi chú"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body1">
              <strong>Tổng tiền:</strong> {data.TotalPrice.toLocaleString()} đ
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button
          variant="contained"
          color="success"
          onClick={handleConfirm}
          size="large"
        >
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
}
