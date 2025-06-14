// Enums
export enum OrderStatus {
  Pending = 0,
  Processing = 1,
  Shipped = 2,
  Delivered = 3,
  Cancelled = 4,
}

export enum PaymentMethod {
  Cash = 0,
  CreditCard = 1,
  BankTransfer = 2,
}

export enum UserRole {
  Admin = 0,
  User = 1,
  Shipper = 2,
}

// Base Models
export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  identityNumber: string;
  roles: UserRole[];
  refreshTokens: RefreshToken[];
  orders: Order[];
  userVouchers: UserVoucher[];
  userRooms: UserRoom[];
}

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  quantity: number;
  sold: number;
  describe: string;
  price: number;
  weight: number;
  isOutOfStock: boolean;
  discount: number;
  createdAt: string;
  updatedAt: string;
  storeId: string;
  categoryId: string;
  cartItems: CartItem[];
  orderItems: OrderItem[];
}

export interface Store {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  products: Product[];
}

export interface Category {
  id: string;
  name: string;
  products: Product[];
}

export interface Cart {
  id: string;
  userId: string;
  cartItems: CartItem[];
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Order {
  id: string;
  userId: string;
  shipperId: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Shipper {
  id: string;
  userId: string;
  isAvailable: boolean;
  orders: Order[];
}

export interface Voucher {
  id: string;
  discountAmount: number;
  type: string;
  quantity: number;
  minOrderPrice: number;
  maxDiscountPrice: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  storeId: string;
  store?: Store;
  userVouchers: UserVoucher[];
  orders?: Order[];
}

export interface UserVoucher {
  id: string;
  userId: string;
  voucherId: string;
}

export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
}

export interface Room {
  id: string;
  name: string;
  buildingId: string;
  floor: number;
  area: number;
  price: number;
  status: boolean;
  userRooms: UserRoom[];
}

export interface Building {
  id: string;
  name: string;
  address: string;
  areaId: string;
  totalFloors: number;
  description: string;
  imageUrl: string;
  rooms: Room[];
}

export interface Area {
  id: string;
  name: string;
  description: string;
  buildings: Building[];
}

export interface UserRoom {
  id: string;
  userId: string;
  roomId: string;
  startDate: string;
  endDate: string;
}

export interface Report {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  userId: string;
}

export interface EventItem {
  id: string | number;
  image: string;
  title?: string;
  description?: string;
  storeId: string;
}
export interface TooltipProps {
  active?: boolean;
  payload?: {
    payload: {
      name: string;
      revenue: number;
      hasData: boolean;
    };
  }[];
  label?: string;
}

export interface StatisticsSectionProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}
