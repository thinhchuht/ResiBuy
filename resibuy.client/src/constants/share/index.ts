import {
  Dashboard,
  Inventory2,
  Category,
  ShoppingCart,
  People,
  ConfirmationNumber,
  Store,
  DeliveryDiningSharp,
  Apartment,
  Report,
} from "@mui/icons-material";

export const menuItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: Dashboard },
  { title: "Danh mục", url: "/admin/category", icon: Category },
  { title: "Đơn hnagf", url: "/admin/order", icon: ShoppingCart },
   { title: "Shipper", url: "/admin/shipper", icon: DeliveryDiningSharp  },
  { title: "Người dùng", url: "/admin/user", icon: People },
  { title: "Quản lý chung cư", url: "/admin/resi", icon: Apartment },
  { title: "Cửa hàng", url: "/admin/store", icon: Store },
  { title: "Báo cáo", url: "/admin/reports", icon: Report },
];
