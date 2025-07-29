// src/hooks/useOrderAlert.ts
import { useState, useEffect } from "react";
import { useEventHub, HubEventType } from "./useEventHub";

type OrderPopupData = {
  id: string;
  customerName: string;
  address: string;
  storeAddress: string;
};

type OrderAssignedData = {
  ShipperId: string;
  OrderId: string;
  CustomerName: string;
  Address: string;
  StoreName: string;
};

export const useOrderAlert = (shipperId: string) => {
  const [showPopup, setShowPopup] = useState(false);
  const [order, setOrder] = useState<OrderPopupData | null>(null);

  useEventHub({
    [HubEventType.ReceiveOrderNotification]: (data) => {
      if (
        typeof data === "object" &&
        data !== null &&
        "ShipperId" in data &&
        "OrderId" in data &&
        "CustomerName" in data &&
        "Address" in data &&
        "StoreName" in data
      ) {
        const orderData = data as OrderAssignedData;
        if (orderData.ShipperId === shipperId) {
          const newOrder: OrderPopupData = {
            id: orderData.OrderId,
            customerName: orderData.CustomerName || "Không rõ",
            address: orderData.Address || "Không có địa chỉ",
            storeAddress: orderData.StoreName || "Không rõ cửa hàng",
          };
          setOrder(newOrder);
          setShowPopup(true);
          console.log("✅ Hiển thị popup đơn hàng:", newOrder);
        }
      }
    },
  });

  // Tự động đóng popup sau 40s
  useEffect(() => {
    if (showPopup) {
      const timeout = setTimeout(() => setShowPopup(false), 40000);
      return () => clearTimeout(timeout);
    }
  }, [showPopup]);

  return {
    order,
    showPopup,
    closePopup: () => setShowPopup(false),
  };
};
