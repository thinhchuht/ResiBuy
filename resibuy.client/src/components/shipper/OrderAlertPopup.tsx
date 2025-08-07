import { useEventHub, HubEventType } from "../../hooks/useEventHub";
import { useToastify } from "../../hooks/useToastify";
import { useOrderEvent } from "../../contexts/OrderEventContext";
import { useRef } from "react";

interface OrderNotification {
  OrderId: string;
  TotalPrice: number;
  Note: string;
  StoreName: string;
  AssignedTime: string;
}

export default function OrderAlertToast() {
  const toast = useToastify();
  const { setLastNewOrderId } = useOrderEvent();

  // ✅ Dùng ref để tránh toast lặp lại đơn hàng cũ
  const lastToastOrderId = useRef<string | null>(null);

  useEventHub({
    [HubEventType.ReceiveOrderNotification]: (payload: unknown) => {
      if (typeof payload === "object" && payload !== null) {
        const p = payload as Record<string, unknown>;

        const parsed: OrderNotification = {
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
          // ✅ Ngăn toast nếu đã show cùng OrderId
          if (parsed.OrderId !== lastToastOrderId.current) {
            toast.info(
              `📦 Đơn hàng mới từ ${parsed.StoreName} - ${parsed.TotalPrice.toLocaleString()} đ`,
              { autoClose: 5000 }
            );
            console.log("📦 Nhận đơn hàng:", parsed);

            lastToastOrderId.current = parsed.OrderId;
            setLastNewOrderId(parsed.OrderId);
          } else {
            console.log("⏩ Đã hiện toast cho đơn hàng này:", parsed.OrderId);
          }
        } else {
          console.warn("❌ Payload thiếu thông tin cần thiết:", payload);
        }
      } else {
        console.warn("❌ Payload không hợp lệ:", payload);
      }
    },
  });

  return null;
}
