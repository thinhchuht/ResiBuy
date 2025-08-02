import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useEventHub, HubEventType } from "../../hooks/useEventHub";
import type { OrderData } from "../../types/hubData";

const OrderNotifier = () => {
  const location = useLocation();

  const isInStorePage = location.pathname.startsWith("/store/");

  useEventHub({
    [HubEventType.OrderCreated]: (data) => {
      const orderData = data as OrderData;

      if (!isInStorePage) return; // ❌ Không phải trang store thì không toast

      toast.success(`🛒 Đơn hàng mới từ cửa hàng ${orderData.storeName}!`, {
        position: "top-right",
        autoClose: 5000,
        style: {
          top: "90px",
          right: "10px",
          position: "fixed",
        },
        onClick: () => {
          window.location.href = `http://localhost:5001/store/${orderData.storeId}/orders`;
        },
      });
    },
  });

  return null;
};

export default OrderNotifier;
