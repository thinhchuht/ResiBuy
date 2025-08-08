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
  { title: "Bảng điều khiển", url: "/admin/dashboard", icon: Dashboard },
  { title: "Danh mục", url: "/admin/category", icon: Category },
  { title: "Orders", url: "/orders", icon: ShoppingCart },
   { title: "Shipper", url: "/admin/shipper", icon: DeliveryDiningSharp  },
  { title: "Người dùng", url: "/admin/user", icon: People },
  { title: "Quản lý chung cư", url: "/admin/resi", icon: Apartment },
  { title: "Cửa hàng", url: "/admin/store", icon: Store },
  { title: "Báo cáo", url: "/admin/reports", icon: Report },
];
export const categoryData = [
  { name: "Skincare", value: 35, color: "#8884d8" },
  { name: "Makeup", value: 28, color: "#82ca9d" },
  { name: "Haircare", value: 18, color: "#ffc658" },
  { name: "Fragrance", value: 12, color: "#ff7300" },
  { name: "Supplements", value: 7, color: "#00ff88" },
];