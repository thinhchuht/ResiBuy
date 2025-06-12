import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useHub } from "../../contexts/HubContext";
import { useEventHub, HubEventType } from "../../hooks/useEventHub";
import type { UserCreatedData, OrderData, PaymentData } from "../../hooks/useEventHub";
import axios from "axios";

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
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    orderId: "",
    orderInfo: "",
  });

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

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/vnpay/create-payment", {
        amount: parseFloat(paymentForm.amount),
        orderId: paymentForm.orderId,
        orderInfo: paymentForm.orderInfo,
      });
      setPaymentUrl(response.data.paymentUrl);
    } catch (error) {
      console.error("Error creating payment:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test Hub Events</h1>

      {/* VNPay Test Form */}
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-4">Test VNPay Payment</h2>
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount (VND)</label>
            <input
              type="number"
              name="amount"
              value={paymentForm.amount}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Order ID</label>
            <input
              type="text"
              name="orderId"
              value={paymentForm.orderId}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Order Info</label>
            <input
              type="text"
              name="orderInfo"
              value={paymentForm.orderInfo}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Create Payment
          </button>
        </form>

        {paymentUrl && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700">Payment URL:</h3>
            <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="mt-1 block text-indigo-600 hover:text-indigo-500 break-all">
              {paymentUrl}
            </a>
          </div>
        )}
      </div>

      {/* Existing components */}
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Connection Status:</h2>
        <p className={isConnected ? "text-green-600" : "text-red-600"}>{isConnected ? "Connected" : "Disconnected"}</p>
      </div>

      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Current User:</h2>
        <pre className="bg-white p-2 rounded">{JSON.stringify(user, null, 2)}</pre>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Events:</h2>
        {events.map((event, index) => (
          <div key={index} className="p-4 bg-white border rounded shadow">
            <p className="font-semibold">Event Type: {event.type}</p>
            <p className="text-sm text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
            <pre className="mt-2 bg-gray-50 p-2 rounded">{JSON.stringify(event.data, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestHub;
