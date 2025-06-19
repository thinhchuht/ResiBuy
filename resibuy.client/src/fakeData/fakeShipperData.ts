import type { Shipper } from "../types/models";

export const fakeShippers: Shipper[] = [
  {
    id: "3",
    userId: "3",
    isAvailable: true,
    startWorkTime: "2025-06-19T08:00:00Z",
    endWorkTime: "2025-06-19T17:00:00Z",
    reportCount: 2,
    orders: [],
  },
];
