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
import {
  Store as StoreIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  LocalOffer as VoucherIcon,
  ShoppingCart as OrdersIcon,
  BarChart as AnalyticsIcon,
  Refresh as RefreshIcon,
  CheckCircle as OpenIcon,
  Cancel as ClosedIcon,
  Campaign as PromotionIcon,
} from "@mui/icons-material";
export const menuItems = [
  { title: "Trang chính", url: "/admin/dashboard", icon: Dashboard },
  { title: "Danh mục", url: "/admin/category", icon: Category },
  { title: "Đơn hàng", url: "/admin/orders", icon: ShoppingCart },
   { title: "Nhân viên giao hàng", url: "/admin/shipper", icon: DeliveryDiningSharp  },
  { title: "Người dùng", url: "/admin/user", icon: People },
  { title: "Chung cư", url: "/admin/resi", icon: Apartment },
  { title: "Voucher", url: "/admin/voucher", icon: VoucherIcon },
  { title: "Khuyến mại", url: "/admin/promotion", icon: PromotionIcon },
  { title: "Trang bán hàng", url: "/store/44444444-4444-4444-4444-444444444444", icon: StoreIcon },
];
