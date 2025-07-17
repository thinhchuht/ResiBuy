// components/OrderNotifier.tsx
import { toast } from "react-toastify";
import { useEventHub, HubEventType } from "../../hooks/useEventHub";
import type { OrderData } from "../../types/hubData";

const OrderNotifier = () => {
  useEventHub({
    [HubEventType.OrderCreated]: (data) => {
      const orderData = data as OrderData;
      toast.success(`🛒 Đơn hàng mới từ cửa hàng ${orderData.storeName}!`, {
        position: "top-right",
        autoClose: 5000,
      });
    },
  });

  return null;
};

export default OrderNotifier;
