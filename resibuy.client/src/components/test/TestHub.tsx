import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useHub } from "../../contexts/HubContext";
import { useEventHub, HubEventType } from "../../hooks/useEventHub";
import type {
  UserCreatedData,
  OrderData,
  PaymentData,
} from "../../hooks/useEventHub";

type EventData = UserCreatedData | OrderData | PaymentData;

interface EventWithType {
  data: EventData;
  type: HubEventType;
  timestamp: string;
}

const TestHub: React.FC = () => {
  const { user } = useAuth();
  const { isConnected } = useHub();
  const [events, setEvents] = useState<EventWithType[]>([]);

  // Đăng ký lắng nghe tất cả các events
  useEventHub({
    [HubEventType.UserCreated]: (data) => {
      console.log("UserCreated event received:", data);
      setEvents((prev) => [
        {
          data,
          type: HubEventType.UserCreated,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    [HubEventType.OrderStatusChanged]: (data) => {
      console.log("OrderStatusChanged event received:", data);
      setEvents((prev) => [
        {
          data,
          type: HubEventType.OrderStatusChanged,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    [HubEventType.PaymentReceived]: (data) => {
      console.log("PaymentReceived event received:", data);
      setEvents((prev) => [
        {
          data,
          type: HubEventType.PaymentReceived,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test Hub Events</h1>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <div className="border-4 border-indigo-500 ...">hi</div>
      {/* Connection Status */}
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Connection Status:</h2>
        <p className={isConnected ? "text-green-600" : "text-red-600"}>
          {isConnected ? "Connected" : "Disconnected"}
        </p>
      </div>

      {/* Current User Info */}
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Current User:</h2>
        <pre className="bg-white p-2 rounded">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      {/* Events */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Events:</h2>
        {events.map((event, index) => (
          <div key={index} className="p-4 bg-white border rounded shadow">
            <p className="font-semibold">Event Type: {event.type}</p>
            <p className="text-sm text-gray-500">
              {new Date(event.timestamp).toLocaleString()}
            </p>
            <pre className="mt-2 bg-gray-50 p-2 rounded">
              {JSON.stringify(event.data, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestHub;
