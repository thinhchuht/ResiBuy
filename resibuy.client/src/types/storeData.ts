
export interface Product {
  id: number;
  name: string;
  describe: string;
  weight: number;
  isOutOfStock: boolean;
  discount: number;
  sold: number;
  createdAt: Date;
  updatedAt: Date;
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
  product: Product;             // tham chiếu lại interface Product đã khai báo trước
  sold: number;
  price: number;      
  weight: number;
  image: Image;
  cartItems: CartItem[];
  orderItems: OrderItem[];
  additionalData: AdditionalData[];
}

export interface Image {
  id: string;
  url: string;
  thumbUrl: string;
  name: string;
  productDetailId?: number; // int? => number | undefined
  userId?: string;          // string? => string | undefined
  productDetail?: ProductDetail; // tham chiếu ProductDetail đã khai báo trước
  user: User;
  categoryId: string;
  category?: Category;      // Category? => Category | undefined
}

export interface User {
  id: string;
  email: string;
  phoneNumber: string;
  passwordHash: string;
  identityNumber: string;
  dateOfBirth: Date;
  isLocked: boolean;
  roles: string[];
  fullName: string;
  avatarId: string;
  createdAt: Date;
  updatedAt: Date;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  cart: Cart;
  avatar: Image;
  userRooms: UserRoom[];
  userVouchers: UserVoucher[];
  reports: Report[];
}

export interface Store {
  id: string;           // Guid → string
  name: string;
  description: string;
  isLocked: boolean;
  isOpen: boolean;
  reportCount: number;
  createdAt: Date;
  ownerId: string;
  roomId: string;
  owner: User;
  room: Room;
  products: Product[];
  vouchers: Voucher[];
  orders: Order[];
}

export interface Category {
  id: string;             // Guid → string
  name: string;
  status?: string;
  image?: Image;
  products?: Product[];
}

export interface CartItem {
  id: string;             // Guid → string
  quantity: number;
  cartId: string;
  productDetailId: number;
  cart: Cart;
  productDetail: ProductDetail;
}

export interface OrderItem {
  id: string;             // Guid → string
  quantity: number;
  price: number;
  orderId: string;
  productDetailId: number;
  order: Order;
  productDetail: ProductDetail;
}

export interface AdditionalData {
  id: number;
  key: string;
  value: string;
  productDetailId: number;
  productDetail: ProductDetail;
}

export interface Cart {
  id: string;            // Guid → string
  userId: string;
  user: User;
  cartItems: CartItem[];
}

export interface UserRoom {
  userId: string;
  roomId: string;   // Guid → string
  user: User;
  room: Room;
}

export interface UserVoucher {
  userId: string;
  voucherId: string;  // Guid → string
  user: User;
  voucher: Voucher;
}

export interface Room {
  id: string;           // Guid → string
  name: string;
  isActive: boolean;
  buildingId: string;   // Guid → string
  building: Building;
  orders: Order[];
  userRooms: UserRoom[];
}

export interface Voucher {
  id: string;               // Guid → string
  discountAmount: number;
  type: string;             // bạn có thể thay string bằng enum nếu cần
  quantity: number;
  minOrderPrice: number;
  maxDiscountPrice: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  storeId: string;          // Guid → string
  store: Store;
  userVouchers: UserVoucher[];
  orders: Order[];
}

export interface Order {
  id: string;
  totalPrice: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  createAt: Date;
  updateAt: Date;
  note: string;
  shippingAddressId: string;
  userId: string;
  storeId: string;
  shipperId?: string;
  voucherId?: string;
  shippingAddress: Room;
  user: User;
  store: Store;
  shipper?: Shipper;
  voucher?: Voucher;
  reports: Report[];
  items: OrderItem[];
}

export interface Building {
  id: string;           // Guid → string
  name: string;
  isActive: boolean;
  areaId: string;       // Guid → string
  area: Area;
  rooms: Room[];
}

export interface Shipper {
  id: string;            // Guid → string
  userId: string;
  isOnline: boolean;
  reportCount: number;
  startWorkTime: Date;
  endWorkTime: Date;
  lastLocationId: string; // Guid → string
  user: User;
  lastLocation: Area;
  orders: Order[];
}

export interface Area {
  id: string;             // Guid → string
  name: string;
  isActive: boolean;
  buildings: Building[];
  shippers: Shipper[];
}


export enum OrderStatus {
  Pending = "Pending",
  Processing = "Processing",
  Shipped = "Shipped",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
}

export enum PaymentMethod {
  COD = "COD",
  BankTransfer = "BankTransfer",
}

export enum PaymentStatus {
  Success = "Success",
  Fail = "Fail",
  UnPaid = "UnPaid",
}


