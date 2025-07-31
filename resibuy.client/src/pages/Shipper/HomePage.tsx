// components/shipper/OrderAlertPopup.tsx
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  order: {
    id: string;
    customerName: string;
    address: string;
    storeAddress: string;
  } | null;
};

const OrderAlertPopup = ({ open, onClose, order }: Props) => {
  const [countdown, setCountdown] = useState(40);

  useEffect(() => {
    if (!open || !order) return;

    // Reset countdown mỗi lần mở popup
    setCountdown(40);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, order]);

  // Phát âm thanh và rung
  useEffect(() => {
    if (open && order) {
      const audio = new Audio("/sounds/notification.mp3");
      audio.play().catch(() => {});
      if ("vibrate" in navigator) navigator.vibrate(300);
    }
  }, [open, order]);

  if (!open || !order) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 shadow-xl border rounded-lg w-80 z-50 animate-bounce-in">
      <h4 className="text-lg font-semibold mb-2">📦 Đơn hàng mới được gán</h4>
      <p><strong>Đơn:</strong> #{order.id}</p>
      <p><strong>Khách:</strong> {order.customerName}</p>
      <p><strong>Địa chỉ:</strong> {order.address}</p>
      <p><strong>Cửa hàng:</strong> {order.storeAddress}</p>
      <p className="text-sm text-gray-500 mt-1">Tự đóng sau {countdown} giây</p>
      <button
        onClick={onClose}
        className="mt-3 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        ❌ Đóng
      </button>
    </div>
  );
};

export default OrderAlertPopup;
