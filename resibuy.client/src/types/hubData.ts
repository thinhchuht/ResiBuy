// Define event data types
export interface ReviewAddedData {
  id: string;
  productDetail: {
    id: number;
    name: string;
    additionalData: Array<{
      id: string;
      key: string;
      value: string;
    }>;
  };
  rate: number;
  comment: string;
  user: {
    id: string;
    name: string;
    avatar?: {
      id: string;
      name: string;
      url: string;
      thumbUrl: string;
    };
  } | null;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreatedData {
  userId: string;
  data: {
    email: string;
    username: string;
  };
  timestamp: string;
}

export interface OrderData {
  id: string;
  storeId: string;
  storeName: string;
  orderStatus: string;
  oldOrderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

export interface PaymentData {
  paymentId: string;
  amount: number;
  status: string;
}

export interface OrderStatusChangedData {
  id: string;
  storeId: string;
  storeName: string;
  orderStatus: string;
  oldOrderStatus: string;
  paymentStatus: string;
  createdAt: string;
}
