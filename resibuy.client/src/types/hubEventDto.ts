// DTOs cho các event từ backend (ResiBuy.Server/Infrastructure/Model/EventDataDto)

export interface OrderStatusChangedDto {
  id: string;
  storeId: string;
  storeName: string;
  orderStatus: string;
  oldOrderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

export interface ReportCreatedDto {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  createdById: string;
  reportTarget: string;
  targetId: string;
  orderId: string;
}

export interface ReportResolvedDto {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  createdById: string;
  reportTarget: string;
  targetId: string;
  orderId: string;
}

export interface ProductOutOfStockDto {
  productDetailId: number;
  productName: string;
  storeName: string;
  storeId: string;
}

export interface OrderCreateFailedDto {
  orderIds: string[];
  errorMessage: string;
}

export interface OrderProcessFailedDto {
  orderId: string;
  errorMessage: string;
}

export interface ReceiveOrderNotificationDto {
  orderId: string;
  totalPrice : number;
  storeName : string
  note: string
  assignedTime: string
}

export interface CartAddedDto {
  cartId: string;
  productDetailId: number;
  quantity: number;
  userId: string;
}

export interface MonthlyPaymentSettledDto {
  storeId: string;
  storeName: string;
  revenue: number;
  paymentMonth: number;
}

export interface MonthlyPaymentSettlFailedDto {
  storeId: string;
  storeName: string;
}
