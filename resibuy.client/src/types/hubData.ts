// Define event data types
export interface UserCreatedData {
    userId: string;
    data: {
      email: string;
      username: string;
    };
    timestamp: string;
  }
  
  export interface OrderData {
    orderId: string;
    status: string;
    total: number;
  }
  
  export interface PaymentData {
    paymentId: string;
    amount: number;
    status: string;
  }

  export interface OrderStatusChangedData {
    id: string
    storeId: string
    storeName: string
    orderStatus : string
    oldOrderStatus : string
    paymentStatus : string
    createdAt : string
  }

