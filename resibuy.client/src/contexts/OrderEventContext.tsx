import React, { createContext, useContext, useState } from "react";

interface OrderEventContextValue {
  lastConfirmedOrderId: string | null;
  setLastConfirmedOrderId: (id: string) => void;

  lastNewOrderId: string | null; // ✅ Thêm dòng này
  setLastNewOrderId: (id: string) => void; // ✅ Và dòng này
}

const OrderEventContext = createContext<OrderEventContextValue | undefined>(undefined);

export const OrderEventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastConfirmedOrderId, setLastConfirmedOrderId] = useState<string | null>(null);
  const [lastNewOrderId, setLastNewOrderId] = useState<string | null>(null); // ✅ thêm

  return (
    <OrderEventContext.Provider
      value={{ lastConfirmedOrderId, setLastConfirmedOrderId, lastNewOrderId, setLastNewOrderId }}
    >
      {children}
    </OrderEventContext.Provider>
  );
};

export const useOrderEvent = () => {
  const context = useContext(OrderEventContext);
  if (!context) throw new Error("useOrderEvent must be used within OrderEventProvider");
  return context;
};
