import React, { createContext, useContext, useState } from "react";

type OrderEventContextType = {
  lastConfirmedOrderId: string | null;
  confirmOrder: (orderId: string) => void;
};

const OrderEventContext = createContext<OrderEventContextType | undefined>(undefined);

export const OrderEventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastConfirmedOrderId, setLastConfirmedOrderId] = useState<string | null>(null);

  const confirmOrder = (orderId: string) => {
    setLastConfirmedOrderId(orderId); // Cập nhật trạng thái mới
  };

  return (
    <OrderEventContext.Provider value={{ lastConfirmedOrderId, confirmOrder }}>
      {children}
    </OrderEventContext.Provider>
  );
};

export const useOrderEvent = () => {
  const context = useContext(OrderEventContext);
  if (!context) throw new Error("useOrderEvent must be used within OrderEventProvider");
  return context;
};
