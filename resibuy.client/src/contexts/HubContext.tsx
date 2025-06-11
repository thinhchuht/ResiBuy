import React, { createContext, useContext, useEffect, useState } from 'react';
import { HubConnection, HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
import { useAuth } from './AuthContext';
import type { OrderData, PaymentData, UserCreatedData } from '../types/hubData';



// Define event names
export const HubEvents = {
  USER_CREATED: 'UserCreated',
  NEW_ORDER: 'NewOrder',
  ORDER_STATUS_CHANGED: 'OrderStatusChanged',
  PAYMENT_RECEIVED: 'PaymentReceived',
} as const;

type EventData = {
  [HubEvents.USER_CREATED]: UserCreatedData;
  [HubEvents.NEW_ORDER]: { data: OrderData };
  [HubEvents.ORDER_STATUS_CHANGED]: { data: OrderData };
  [HubEvents.PAYMENT_RECEIVED]: { data: PaymentData };
};

interface HubContextType {
  connection: HubConnection | null;
  isConnected: boolean;
  subscribeToEvent: (
    eventName: string,
    callback: (data: EventData[]) => void
  ) => void;
  unsubscribeFromEvent: (eventName: keyof typeof HubEvents) => void;
}

const HubContext = createContext<HubContextType | undefined>(undefined);

export const HubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    console.log('Creating new hub connection...');
    const newConnection = new HubConnectionBuilder()
      .withUrl(`http://localhost:5000/hubs/notification?userId=${user.id}`, {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, [user?.id]);

  useEffect(() => {
    if (connection) {
      console.log('Starting hub connection...');
      connection.start()
        .then(() => {
          console.log('Connected to hub successfully');
          setIsConnected(true);
        })
        .catch(err => {
          console.error('Error connecting to hub:', err);
          setIsConnected(false);
        });

      return () => {
        console.log('Stopping hub connection...');
        connection.stop();
        setIsConnected(false);
      };
    }
  }, [connection]);

  const subscribeToEvent = (
    eventName: string,
    callback: (data: EventData[]) => void
  ) => {
    if (connection) {
      connection.on(eventName, callback);
    }
  };

  const unsubscribeFromEvent = (eventName: keyof typeof HubEvents) => {
    if (connection) {
      connection.off(eventName);
    }
  };

  return (
    <HubContext.Provider
      value={{
        connection,
        isConnected,
        subscribeToEvent,
        unsubscribeFromEvent
      }}
    >
      {children}
    </HubContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHub = () => {
  const context = useContext(HubContext);
  if (context === undefined) {
    throw new Error('useHub must be used within a HubProvider');
  }
  return context;
}; 