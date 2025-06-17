// Enums
export enum OrderStatus {
  Pending = 0,
  Processing = 1,
  Shipped = 2,
  Delivered = 3,
  Cancelled = 4,
}

export enum PaymentStatus {
  Pending = 0,
  Paid = 1,
  Failed = 2,
  Refunded = 3,
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
  avatar: Image;
  phoneNumber: string;
  dateOfBirth: string;
  identityNumber: string;
  cartId: string;
  roles: string[];
  rooms: [{
    id : string;
    name : string;
    buildingName : string;
    areaName : string;
  }]
  refreshTokens: RefreshToken[];
  orders: Order[];
  userVouchers: UserVoucher[];
  userRooms: UserRoom[];
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  describe: string;
  weight: number;
  isOutOfStock: boolean;
  discount: number;
  sold: number;
  createdAt: string;
  updatedAt: string;
  storeId: string;
  categoryId: string;
  productImgs: Image[];
  costData: CostData[];
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
  totalPrice: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createAt: string;
  updateAt: string;
  shipAddressId: string;
  shipAddress: Room;
  userId: string;
  storeId: string;
  shipperId?: string;
  voucherId?: string;
  user?: User;
  store?: Store;
  shipper?: Shipper;
  voucher?: Voucher;
  reports?: Report[];
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  orderId: string;
  productId: string;
  order?: Order;
  product?: Product;
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

export interface Image {
  id: string;
  imgUrl : string;
  thumbUrl: string;
  name: string;
  productId?: string;
  userId?: string;
}

export interface UncostData {
  id: string;
  key: string;
  value: string;
  costDataId: string;
}

export interface CostData {
  id: string;
  key: string;
  value: string;
  price: number;
  productId: string;
  uncostData?: UncostData[];
}

export interface ProductDto {
  id?: string; // Optional for creation
  name: string;
  imageUrl?: string; // This seems to be removed in later migrations based on codebase search, but keeping for now as per DTO.cs
  quantity?: number;
  describe: string;
  price?: number; // This seems to be handled by CostData in later migrations, but keeping for now as per DTO.cs
  weight: number;
  isOutOfStock: boolean;
  discount: number;
  createdAt?: string;
  updatedAt?: string;
  storeId: string;
  categoryId: string;
}
