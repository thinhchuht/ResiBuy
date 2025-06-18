import {
  Dashboard,
  Inventory2,
  Category,
  ShoppingCart,
  People,
  ConfirmationNumber,
  Chat,
  Store,
} from "@mui/icons-material";

export const menuItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: Dashboard },
  { title: "Products", url: "/products", icon: Inventory2 },
  { title: "Danh mục", url: "/admin/category", icon: Category },
  { title: "Orders", url: "/orders", icon: ShoppingCart },
  { title: "Users", url: "/users", icon: People },
  { title: "Vouchers", url: "/vouchers", icon: ConfirmationNumber },
  { title: "Messages", url: "/messages", icon: Chat },
  { title: "Cửa hàng", url: "/admin/store", icon: Store },
];
export const categoryData = [
  { name: "Skincare", value: 35, color: "#8884d8" },
  { name: "Makeup", value: 28, color: "#82ca9d" },
  { name: "Haircare", value: 18, color: "#ffc658" },
  { name: "Fragrance", value: 12, color: "#ff7300" },
  { name: "Supplements", value: 7, color: "#00ff88" },
];