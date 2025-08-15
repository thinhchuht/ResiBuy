import {
  Dashboard,
  Category,
  ShoppingCart,
  People,
  Store,
  DeliveryDiningSharp,
  Apartment,
  Report,
} from "@mui/icons-material";

export const menuItems = [
  { title: "Trang chính", url: "/admin/dashboard", icon: Dashboard },
  { title: "Danh mục", url: "/admin/category", icon: Category },
  { title: "Đơn hàng", url: "/admin/orders", icon: ShoppingCart },
   { title: "Nhân viên giao hàng", url: "/admin/shipper", icon: DeliveryDiningSharp  },
  { title: "Người dùng", url: "/admin/user", icon: People },
  { title: "Chung cư", url: "/admin/resi", icon: Apartment },
  { title: "Cửa hàng", url: "/admin/store", icon: Store },
  { title: "Báo cáo", url: "/admin/reports", icon: Report },
];
