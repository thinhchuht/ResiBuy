// Enums
export enum OrderStatus {
  None = "None",
  Pending = "Pending",
  Processing = "Processing",
  Shipped = "Shipped",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
}

export enum PaymentStatus {
  None = "None",
  Pending = "Pending",
  Paid = "Paid",
  Failed = "Failed",
  Refunded = "Refunded",
}

export enum PaymentMethod {
  COD = "COD",
  BankTransfer = "BankTransfer",
}

export enum UserRole {
  Admin = 0,
  User = 1,
  Shipper = 2,
}

export enum VoucherType {
  Amount = "Amount",
  Percentage = "Percentage",
}

export enum DeliveryType {
  MyRoom = "my-room",
  Other = "other",
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
  rooms: RoomResult[];
  stores: Store
  refreshTokens: RefreshToken[];
  orders: Order[];
  userVouchers: UserVoucher[];
  userRooms: UserRoom[];
  createdAt: string;
  updatedAt: string;
}

export interface RoomResult {
  id: string;
  name: string;
  buildingName: string;
  areaName: string;
}

export interface Product {
  id: number;
  name: string;
  describe: string;
  sold: number;
  isOutOfStock: boolean;
  discount: number;
  createdAt: string;
  updatedAt: string;
  storeId: string;
  categoryId: string;
  store: Store;
  category: Category;
  productDetails: ProductDetail[];
}

export interface ProductDetail {
  id: number;
  isOutOfStock: boolean;
  productId: number;
  product: Product;
  weight: number;
  sold: number;
  price: number;
  image: Image;
  cartItems: CartItem[];
  orderItems: OrderItem[];
  additionalData: AdditionalData[];
}

export interface Store {
  id: string;
  name: string;
  address: RoomResult;
  description: string;
  isLocked: boolean;
  isOpen : boolean
  createdAt: string;
  updatedAt: string;
  products: Product[];
}

export interface Category {
  id: string;
  name: string;
  status: string;
  image: Image;
}

export interface Cart {
  id: string;
  userId: string;
  cartItems: CartItem[];
}

export interface CartItem {
  id: string;
  cartId: string;
  productDetailId: number;
  quantity: number;
  cart: Cart;
  productDetail: ProductDetail;
}

export interface Order {
  id: string;
  totalPrice: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  createAt: string;
  updateAt: string;
  note: string;
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
  productDetailId: number;
  order?: Order;
  product?: ProductDetail;
}

export interface Shipper {
  id: string;
  userId: string;
  isOnline: boolean;
  isShipping: boolean
  orders: Order[];
  startWorkTime: number;
  endWorkTime: number;
  reportCount: number;
  lastLocationId : string
  lastLocation : Area
}

export interface Voucher {
  id: string;
  discountAmount: number;
  type: VoucherType;
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

export interface Image {
  id: string;
  url: string;
  thumbUrl: string;
  name: string;
  productDetailId?: number;
  userId?: string;
  categoryId?: string;
}

export interface AdditionalData {
  id: string;
  key: string;
  value: string;
  productDetailId: string;
  productDetail: ProductDetail;
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

export interface ProductFilter {
  search?: string;
  storeId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string; // "price", "sold", "name", "createdAt"
  sortDirection?: string; // "asc" or "desc"
  pageNumber?: number;
  pageSize?: number;
}

// Temp checkout DTOs for checkout process
export interface TempProductDetailDto {
  id: number;
  name: string;
  isOutOfStock: boolean;
  weight: number;
  price: number;
  quantity: number;
  image: Image;
  additionalDatas: AdditionalData[];
}

export interface TempOrderDto {
  id: string;
  storeId: string;
  voucherId?: string;
  note: string;
  totalPrice: number;
  productDetails: TempProductDetailDto[];
  voucher?: Voucher;
  DiscountAmount?: number;
}

export interface TempCheckoutDto {
  id: string;
  addressId?: string;
  paymentMethod: PaymentMethod;
  grandTotal: number;
  orders: TempOrderDto[];
  isInstance: boolean;
}

// Update DTOs for temp order
export interface UpdateTempOrderDto {
  id: string;
  addressId?: string;
  paymentMethod?: PaymentMethod;
  orders: UpdateOrderDto[];
}

export interface UpdateOrderDto {
  id: string;
  voucherId?: string;
  note?: string;
}
