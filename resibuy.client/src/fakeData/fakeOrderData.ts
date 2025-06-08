import type { Order, OrderItem } from "../types/models";
import { OrderStatus, PaymentMethod } from "../types/models";

export const fakeOrderItems: OrderItem[] = [
  {
    id: "1",
    orderId: "1",
    productId: "1",
    quantity: 1,
    price: 999.99,
  },
  {
    id: "2",
    orderId: "1",
    productId: "2",
    quantity: 1,
    price: 129.98,
  },
  {
    id: "3",
    orderId: "2",
    productId: "3",
    quantity: 1,
    price: 79.99,
  },
];

export const fakeOrders: Order[] = [
  {
    id: "1",
    userId: "2",
    shipperId: "3",
    status: OrderStatus.Delivered,
    totalAmount: 1129.97,
    paymentMethod: PaymentMethod.CreditCard,
    shippingAddress: "123 Main St, New York, NY 10001",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-02T15:00:00Z",
    orderItems: fakeOrderItems.filter((item) => item.orderId === "1"),
  },
  {
    id: "2",
    userId: "2",
    shipperId: "3",
    status: OrderStatus.Processing,
    totalAmount: 79.99,
    paymentMethod: PaymentMethod.BankTransfer,
    shippingAddress: "456 Oak Ave, Chicago, IL 60601",
    createdAt: "2024-01-03T14:00:00Z",
    updatedAt: "2024-01-03T14:00:00Z",
    orderItems: fakeOrderItems.filter((item) => item.orderId === "2"),
  },
];
