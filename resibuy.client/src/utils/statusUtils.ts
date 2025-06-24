import { OrderStatus } from "../types/models";

export const statusStringToEnum = (status: string): OrderStatus => {
  switch (status) {
    case "Pending":
      return OrderStatus.Pending;
    case "Processing":
      return OrderStatus.Processing;
    case "Shipped":
      return OrderStatus.Shipped;
    case "Delivered":
      return OrderStatus.Delivered;
    case "Cancelled":
      return OrderStatus.Cancelled;
    default:
      return OrderStatus.None;
  }
};
