import { useEffect, useRef } from "react";
import { useHub } from "../contexts/HubContext";
import type {
  OrderData,
  OrderStatusChangedData,
  PaymentData,
  UserCreatedData,
} from "../types/hubData";

// Define event types
export enum HubEventType {
  UserCreated = "UserCreated",
  OrderStatusChanged = "OrderStatusChanged",
  PaymentReceived = "PaymentReceived",
  CartItemAdded = "CartItemAdded",
  CartItemDeleted = "CartItemDeleted",
  OrderCreated = "OrderCreated",
  OrderCreatedFailed = "OrderCreatedFailed",
  OrderReported = "OrderReported",
  ReportResolved = "ReportResolved",
  Refunded = "Refunded",
  RefundFailed = "RefundFailed",
  MonthlyPaymentSettled = "MonthlyPaymentSettled",
  MonthlyPaymentSettlFailed = "MonthlyPaymentSettlFailed",
  ProductOutOfStock = "ProductOutOfStock",
  ReceiveOrderNotification = "ReceiveOrderNotification",
}

export type HubEventData =
  | UserCreatedData
  | OrderData
  | PaymentData
  | OrderStatusChangedData;
export type HubEventHandler = (data: HubEventData) => void;
export type HubEventHandlers = Partial<Record<HubEventType, HubEventHandler>>;

interface IHub {
  subscribe: (event: string, handler: (data: HubEventData) => void) => void;
  unsubscribe: (event: string) => void;
}

class HubEventsManager {
  private static instance: HubEventsManager;
  private hub: IHub | null = null;
  private eventHandlers: Record<HubEventType, (data: HubEventData) => void>;
  private handlers: Record<HubEventType, Set<HubEventHandler>>;
  private lastEventData: Record<HubEventType, HubEventData | null>;

  private constructor() {
    // Initialize handlers for each event type
    this.handlers = Object.values(HubEventType).reduce((acc, eventType) => {
      acc[eventType] = new Set();
      return acc;
    }, {} as Record<HubEventType, Set<HubEventHandler>>);

    // Initialize last event data
    this.lastEventData = Object.values(HubEventType).reduce(
      (acc, eventType) => {
        acc[eventType] = null;
        return acc;
      },
      {} as Record<HubEventType, HubEventData | null>
    );

    // Create event handlers
    this.eventHandlers = {
      [HubEventType.UserCreated]: (data: HubEventData) => {
        console.log("UserCreated event received:", data);
        this.lastEventData[HubEventType.UserCreated] = data;
        this.notifyHandlers(HubEventType.UserCreated, data);
      },
      [HubEventType.OrderStatusChanged]: (data: HubEventData) => {
        console.log("OrderStatusChanged event received:", data);
        this.lastEventData[HubEventType.OrderStatusChanged] = data;
        this.notifyHandlers(HubEventType.OrderStatusChanged, data);
      },
      [HubEventType.PaymentReceived]: (data: HubEventData) => {
        console.log("PaymentReceived event received:", data);
        this.lastEventData[HubEventType.PaymentReceived] = data;
        this.notifyHandlers(HubEventType.PaymentReceived, data);
      },
      [HubEventType.CartItemAdded]: (data: HubEventData) => {
        console.log("CartItemAdded event received:", data);
        this.lastEventData[HubEventType.CartItemAdded] = data;
        this.notifyHandlers(HubEventType.CartItemAdded, data);
      },
      [HubEventType.CartItemDeleted]: (data: HubEventData) => {
        console.log("CartItemDeleted event received:", data);
        this.lastEventData[HubEventType.CartItemDeleted] = data;
        this.notifyHandlers(HubEventType.CartItemDeleted, data);
      },
      [HubEventType.OrderCreated]: (data: HubEventData) => {
        console.log("OrderCreated event received:", data);
        this.lastEventData[HubEventType.OrderCreated] = data;
        this.notifyHandlers(HubEventType.OrderCreated, data);
      },
      [HubEventType.OrderCreatedFailed]: (data: HubEventData) => {
        console.log("OrderCreatedFailed event received:", data);
        this.lastEventData[HubEventType.OrderCreatedFailed] = data;
        this.notifyHandlers(HubEventType.OrderCreatedFailed, data);
      },
      [HubEventType.OrderReported]: (data: HubEventData) => {
        console.log("OrderReported event received:", data);
        this.lastEventData[HubEventType.OrderReported] = data;
        this.notifyHandlers(HubEventType.OrderReported, data);
      },
      [HubEventType.ReportResolved]: (data: HubEventData) => {
        console.log("ReportResolved event received:", data);
        this.lastEventData[HubEventType.ReportResolved] = data;
        this.notifyHandlers(HubEventType.ReportResolved, data);
      },
      [HubEventType.Refunded]: (data: HubEventData) => {
        console.log("Refunded event received:", data);
        this.lastEventData[HubEventType.Refunded] = data;
        this.notifyHandlers(HubEventType.Refunded, data);
      },
      [HubEventType.RefundFailed]: (data: HubEventData) => {
        console.log("RefundFailed event received:", data);
        this.lastEventData[HubEventType.RefundFailed] = data;
        this.notifyHandlers(HubEventType.RefundFailed, data);
      },
      [HubEventType.MonthlyPaymentSettled]: (data: HubEventData) => {
        console.log("MonthlyPaymentSettled event received:", data);
        this.lastEventData[HubEventType.MonthlyPaymentSettled] = data;
        this.notifyHandlers(HubEventType.MonthlyPaymentSettled, data);
      },
      [HubEventType.MonthlyPaymentSettlFailed]: (data: HubEventData) => {
        console.log("MonthlyPaymentSettlFailed event received:", data);
        this.lastEventData[HubEventType.MonthlyPaymentSettlFailed] = data;
        this.notifyHandlers(HubEventType.MonthlyPaymentSettlFailed, data);
      },
      [HubEventType.ProductOutOfStock]: (data: HubEventData) => {
        console.log("ProductOutOfStock event received:", data);
        this.lastEventData[HubEventType.ProductOutOfStock] = data;
        this.notifyHandlers(HubEventType.ProductOutOfStock, data);
      },
      [HubEventType.ReceiveOrderNotification]: (data: HubEventData) => {
        console.log("OrderAssignedToShipper event received:", data);
        this.lastEventData[HubEventType.ReceiveOrderNotification] = data;
        this.notifyHandlers(HubEventType.ReceiveOrderNotification, data);
      },
    };
  }

  private notifyHandlers(eventType: HubEventType, data: HubEventData) {
    this.handlers[eventType].forEach((handler) => handler(data));
  }

  static getInstance(): HubEventsManager {
    if (!HubEventsManager.instance) {
      HubEventsManager.instance = new HubEventsManager();
    }
    return HubEventsManager.instance;
  }

  setHub(hub: IHub) {
    if (this.hub === null) {
      console.log(
        "Setting up hub connection and subscriptions for the first time..."
      );
      this.hub = hub;
      this.setupSubscriptions();
    }
  }

  private setupSubscriptions() {
    if (!this.hub) return;

    console.log("Setting up event subscriptions...");
    // Lấy tất cả event từ this.hub nếu có (giả sử hub có thuộc tính eventNames hoặc connection có thể lấy được)
    // Nếu không, vẫn subscribe các event mặc định như cũ
    const knownEvents = Object.keys(this.eventHandlers);
    knownEvents.forEach((event) => {
      // Đăng ký event gốc
      console.log(`Subscribing to ${event} event...`);
      this.hub?.subscribe(event, this.eventHandlers[event as HubEventType]);
      // Đăng ký các event bắt đầu bằng OrderStatusChanged-
      if (event === "OrderStatusChanged") {
        // Đăng ký wildcard cho các event bắt đầu bằng OrderStatusChanged-
        // Giả sử backend sẽ gửi event dạng OrderStatusChanged-status
        // Đăng ký handler cho các event này
        const subscribeWildcard = (evt: string) => {
          if (evt.startsWith("OrderStatusChanged-")) {
            this.hub?.subscribe(
              evt,
              this.eventHandlers[HubEventType.OrderStatusChanged]
            );
            console.log(`Subscribing to ${evt} event as OrderStatusChanged`);
          }
        };
        // Nếu hub có danh sách eventNames thì lặp qua, nếu không thì cứ đăng ký một số event phổ biến
        // (hoặc backend có thể gửi danh sách eventNames khi connect)
        // Ví dụ đăng ký sẵn các trạng thái phổ biến
        [
          "OrderStatusChanged-Processing",
          "OrderStatusChanged-Shipped",
          "OrderStatusChanged-Delivered",
          "OrderStatusChanged-CustomerNotAvailable",
          "OrderStatusChanged-Cancelled",
        ].forEach(subscribeWildcard);
      }
    });
    console.log("Event subscriptions setup complete");
  }

  addHandlers(handlers: HubEventHandlers) {
    console.log("Adding event handlers...");
    Object.entries(handlers).forEach(([event, handler]) => {
      if (handler) {
        this.handlers[event as HubEventType].add(handler);
        console.log(`Added handler for ${event} event`);
      }
    });
  }

  removeHandlers(handlers: HubEventHandlers) {
    console.log("Removing event handlers...");
    Object.entries(handlers).forEach(([event, handler]) => {
      if (handler) {
        this.handlers[event as HubEventType].delete(handler);
        console.log(`Removed handler for ${event} event`);
      }
    });
  }

  getLastEventData(eventType: HubEventType): HubEventData | null {
    return this.lastEventData[eventType];
  }
}

/**
 * Hook to handle hub events
 * @example
 * ```tsx
 * // Basic usage with handlers
 * useEventHub({
 *   [HubEventType.UserCreated]: (data) => console.log(data)
 * })
 *
 * // Get last event data
 * const lastUserCreated = useEventHub(HubEventType.UserCreated)
 * ```
 */
export const useEventHub = (
  eventTypeOrHandlers: HubEventType | HubEventHandlers
) => {
  const { connection } = useHub();
  const manager = HubEventsManager.getInstance();
  const handlersRef = useRef(eventTypeOrHandlers);
  const isHandlers = typeof eventTypeOrHandlers !== "string";

  // Keep handlersRef updated with the latest handlers without causing re-renders
  if (isHandlers) {
    handlersRef.current = eventTypeOrHandlers;
  }

  useEffect(() => {
    if (!connection || !isHandlers) {
      return;
    }

    // Setup the hub connection manager once
    manager.setHub({
      subscribe: (event, handler) => connection.on(event, handler),
      unsubscribe: (event) => connection.off(event),
    });

    const currentHandlers = handlersRef.current as HubEventHandlers;
    manager.addHandlers(currentHandlers);

    return () => {
      // On cleanup, remove the exact handlers this hook instance added
      manager.removeHandlers(currentHandlers);
    };
  }, [connection, isHandlers, manager]);

  if (!isHandlers) {
    return manager.getLastEventData(eventTypeOrHandlers as HubEventType);
  }

  return null;
};
