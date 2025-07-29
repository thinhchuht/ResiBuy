import { useState } from "react";
import { useEventHub, HubEventType } from "../../hooks/useEventHub";
import orderApi from "../../api/order.api";
import { useAuth } from "../../contexts/AuthContext";
import { useToastify } from "../../hooks/useToastify"; // ✅ dùng custom toast
// Đảm bảo bạn có file useToastify như bạn đưa ở trên

interface ReceiveOrderNotificationData {
  OrderId: string;
  TotalPrice: number;
  Note: string;
  StoreName: string;
  AssignedTime: string;
}

export default function OrderAlertPopup() {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<ReceiveOrderNotificationData | null>(null);
  const { user } = useAuth();
  const toast = useToastify(); // ✅ dùng toast success/error

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
        data.OrderId, // orderId
        "ShippedAccepted", // trạng thái mới
        user.id // shipperId
      );

      toast.success("Đã xác nhận đơn hàng thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật trạng thái đơn:", err);
      toast.error("Không thể xác nhận đơn hàng!");
    }

    setVisible(false);
  };

  if (!visible || !data) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl w-[400px] max-w-full p-6 animate-fade-in">
        <h2 className="text-xl font-bold text-green-700 mb-4 text-center">
          🚚 Đơn hàng mới được gán!
        </h2>
        <div className="text-gray-800 space-y-2">
          <p>
            <strong>Cửa hàng:</strong> {data.StoreName}
          </p>
          <p>
            <strong>Ghi chú:</strong> {data.Note || "Không có ghi chú"}
          </p>
          <p>
            <strong>Tổng tiền:</strong> {data.TotalPrice.toLocaleString()} đ
          </p>
        </div>
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
