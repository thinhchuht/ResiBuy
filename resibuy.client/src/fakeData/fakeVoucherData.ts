import type { Voucher } from "../types/models";
import { fakeUserVouchers } from "./fakeUserVoucherData";

export const fakeVouchers: Voucher[] = [
  {
    id: "1",
    code: "WELCOME10",
    discountAmount: 10,
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2024-12-31T23:59:59Z",
    isActive: true,
    userVouchers: fakeUserVouchers.filter((uv) => uv.voucherId === "1"),
  },
  {
    id: "2",
    code: "SUMMER20",
    discountAmount: 20,
    startDate: "2024-06-01T00:00:00Z",
    endDate: "2024-08-31T23:59:59Z",
    isActive: true,
    userVouchers: fakeUserVouchers.filter((uv) => uv.voucherId === "2"),
  },
  {
    id: "voucher3",
    code: "FLASH50",
    discountAmount: 50,
    startDate: "2024-03-01T00:00:00Z",
    endDate: "2024-03-07T23:59:59Z",
    isActive: true,
    userVouchers: [],
  },
  {
    id: "voucher4",
    code: "EXPIRED15",
    discountAmount: 15,
    startDate: "2023-01-01T00:00:00Z",
    endDate: "2023-12-31T23:59:59Z",
    isActive: false,
    userVouchers: [],
  },
];
