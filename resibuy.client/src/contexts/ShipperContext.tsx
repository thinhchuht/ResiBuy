import React, { createContext, useContext, useState } from "react";

interface User {
  id: string;
  fullName: string;
  avatar?: { url: string };
}

interface ShipperInfo {
  id: string;
  isOnline: boolean;
  user: User;
}

interface ShipperContextType {
  shipperInfo: ShipperInfo | null;
  setShipperInfo: React.Dispatch<React.SetStateAction<ShipperInfo | null>>;
}

const ShipperContext = createContext<ShipperContextType | undefined>(undefined);

export const ShipperProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shipperInfo, setShipperInfo] = useState<ShipperInfo | null>(null);

  return (
    <ShipperContext.Provider value={{ shipperInfo, setShipperInfo }}>
      {children}
    </ShipperContext.Provider>
  );
};

export const useShipper = () => {
  const context = useContext(ShipperContext);
  if (!context) throw new Error("useShipper must be used within ShipperProvider");
  return context;
};
