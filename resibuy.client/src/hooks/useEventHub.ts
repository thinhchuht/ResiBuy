import { useCallback, useEffect, useRef } from 'react';
import { useHub } from '../contexts/HubContext';
import type { OrderData, PaymentData, UserCreatedData } from '../types/hubData';

// Define event types
export enum HubEventType {
  UserCreated = 'UserCreated',
  OrderStatusChanged = 'OrderStatusChanged',
  PaymentReceived = 'PaymentReceived',
}



export type HubEventData = UserCreatedData | OrderData | PaymentData;
export type HubEventHandler = (data: HubEventData) => void;
export type HubEventHandlers = Partial<Record<HubEventType, HubEventHandler>>;

interface IHub {
  subscribe: (event: string, handler: (data: HubEventData) => void) => void;
  unsubscribe: (event: string) => void;
}

class HubEventsManager {
  private static instance: HubEventsManager;
  private hub: IHub | null = null;
  private isSubscribed: boolean = false;
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
    this.lastEventData = Object.values(HubEventType).reduce((acc, eventType) => {
      acc[eventType] = null;
      return acc;
    }, {} as Record<HubEventType, HubEventData | null>);

    // Create event handlers
    this.eventHandlers = {
      [HubEventType.UserCreated]: (data: HubEventData) => {
        console.log('UserCreated event received:', data);
        this.lastEventData[HubEventType.UserCreated] = data;
        this.notifyHandlers(HubEventType.UserCreated, data);
      },
      [HubEventType.OrderStatusChanged]: (data: HubEventData) => {
        console.log('OrderStatusChanged event received:', data);
        this.lastEventData[HubEventType.OrderStatusChanged] = data;
        this.notifyHandlers(HubEventType.OrderStatusChanged, data);
      },
      [HubEventType.PaymentReceived]: (data: HubEventData) => {
        console.log('PaymentReceived event received:', data);
        this.lastEventData[HubEventType.PaymentReceived] = data;
        this.notifyHandlers(HubEventType.PaymentReceived, data);
      }
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
    if (this.hub !== hub) {
      console.log('Setting up hub connection...');
      this.hub = hub;
      this.setupSubscriptions();
    }
  }

  private setupSubscriptions() {
    if (!this.hub || this.isSubscribed) return;

    console.log('Setting up event subscriptions...');
    Object.entries(this.eventHandlers).forEach(([event, handler]) => {
      console.log(`Subscribing to ${event} event...`);
      this.hub?.subscribe(event, handler);
    });

    this.isSubscribed = true;
    console.log('Event subscriptions setup complete');
  }

  addHandlers(handlers: HubEventHandlers) {
    console.log('Adding event handlers...');
    Object.entries(handlers).forEach(([event, handler]) => {
      if (handler) {
        this.handlers[event as HubEventType].add(handler);
        console.log(`Added handler for ${event} event`);
      }
    });
  }

  removeHandlers(handlers: HubEventHandlers) {
    console.log('Removing event handlers...');
    Object.entries(handlers).forEach(([event, handler]) => {
      if (handler) {
        this.handlers[event as HubEventType].delete(handler);
        console.log(`Removed handler for ${event} event`);
      }
    });

    this.cleanupIfNeeded();
  }

  getLastEventData(eventType: HubEventType): HubEventData | null {
    return this.lastEventData[eventType];
  }

  getIsSubscribed(): boolean {
    return this.isSubscribed;
  }

  private cleanupIfNeeded() {
    const hasNoHandlers = Object.values(this.handlers).every((set) => set.size === 0);

    if (hasNoHandlers && this.isSubscribed && this.hub) {
      console.log('No handlers left, cleaning up event subscriptions...');
      Object.values(HubEventType).forEach((event) => {
        console.log(`Unsubscribing from ${event} event...`);
        this.hub?.unsubscribe(event);
      });
      this.isSubscribed = false;
      console.log('Event subscriptions cleanup complete');
    }
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
export const useEventHub = (eventTypeOrHandlers: HubEventType | HubEventHandlers) => {
  const { connection } = useHub();
  const manager = HubEventsManager.getInstance();
  const handlersRef = useRef<HubEventHandlers | null>(null);
  const isHandlers = typeof eventTypeOrHandlers !== 'string';

  const setupHub = useCallback(() => {
    if (!connection || !isHandlers) {
      return;
    }

    // Only set up hub if it hasn't been set up yet
    if (!manager.getIsSubscribed()) {
      console.log('Setting up hub in useEventHub...');
      manager.setHub({
        subscribe: (event, handler) => connection.on(event, handler),
        unsubscribe: (event) => connection.off(event)
      });
    }

    manager.addHandlers(handlersRef.current!);

    return () => {
      manager.removeHandlers(handlersRef.current!);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, isHandlers]);

  useEffect(() => {
    if (isHandlers) {
      handlersRef.current = eventTypeOrHandlers as HubEventHandlers;
      return setupHub();
    }
  }, [setupHub, eventTypeOrHandlers, isHandlers]);

  if (!isHandlers) {
    return manager.getLastEventData(eventTypeOrHandlers as HubEventType);
  }

  return null;
}; 