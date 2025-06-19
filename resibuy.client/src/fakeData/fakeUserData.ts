import type { User, RefreshToken, Order, UserVoucher, UserRoom } from "../types/models";
import { fakeRefreshTokens } from "./fakeRefreshTokenData";
import { fakeOrders } from "./fakeOrderData";
import { fakeUserVouchers } from "./fakeUserVoucherData";
import { fakeUserRooms } from "./fakeUserRoomData";

export const fakeUsers: User[] = [
  {
    id: "1",
    email: "admin@resibuy.com",
    fullName: "Admin User",
    phoneNumber: "0123456789",
    dateOfBirth: "1990-01-01",
    identityNumber: "123456789",
    roles: ["ADMIN"],
    refreshTokens: fakeRefreshTokens.filter((rt: RefreshToken) => rt.userId === "1"),
    orders: fakeOrders.filter((order: Order) => order.userId === "1"),
    userVouchers: fakeUserVouchers.filter((uv: UserVoucher) => uv.userId === "1"),
    userRooms: fakeUserRooms.filter((ur: UserRoom) => ur.userId === "1"),
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01",
  },
  {
    id: "2",
    email: "user1@example.com",
    fullName: "John Doe",
    phoneNumber: "0987654321",
    dateOfBirth: "1995-05-15",
    identityNumber: "987654321",
    roles: ["USER"],
    refreshTokens: fakeRefreshTokens.filter((rt: RefreshToken) => rt.userId === "2"),
    orders: fakeOrders.filter((order: Order) => order.userId === "2"),
    userVouchers: fakeUserVouchers.filter((uv: UserVoucher) => uv.userId === "2"),
    userRooms: fakeUserRooms.filter((ur: UserRoom) => ur.userId === "2"),
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01",
  },
  {
    id: "3",
    email: "shipper1@example.com",
    fullName: "Mike Johnson",
    phoneNumber: "0123456788",
    dateOfBirth: "1992-08-20",
    identityNumber: "456789123",
    roles: ["SHIPPER"],
    refreshTokens: fakeRefreshTokens.filter((rt: RefreshToken) => rt.userId === "3"),
    orders: fakeOrders.filter((order: Order) => order.userId === "3"),
    userVouchers: fakeUserVouchers.filter((uv: UserVoucher) => uv.userId === "3"),
    userRooms: fakeUserRooms.filter((ur: UserRoom) => ur.userId === "3"),
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01",
  },
];
