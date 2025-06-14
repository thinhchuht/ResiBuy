export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderDate: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod:
    | "credit_card"
    | "paypal"
    | "bank_transfer"
    | "cash_on_delivery";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  trackingNumber?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
}

export const sampleOrders: Order[] = [
  {
    id: "ORD-001",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.johnson@email.com",
    customerPhone: "+1 (555) 123-4567",
    orderDate: "2024-01-15T10:30:00Z",
    status: "delivered",
    total: 156.99,
    paymentMethod: "credit_card",
    paymentStatus: "paid",
    trackingNumber: "TRK123456789",
    shippingAddress: "123 Main St, New York, NY 10001",
    items: [
      {
        id: "1",
        productName: "Hydrating Serum",
        productImage: "/placeholder.svg?height=50&width=50",
        quantity: 2,
        price: 89.99,
        total: 179.98,
      },
      {
        id: "2",
        productName: "Matte Lipstick",
        productImage: "/placeholder.svg?height=50&width=50",
        quantity: 1,
        price: 24.99,
        total: 24.99,
      },
    ],
    notes: "Please deliver after 6 PM",
  },
  {
    id: "ORD-002",
    customerName: "Michael Chen",
    customerEmail: "michael.chen@email.com",
    customerPhone: "+1 (555) 987-6543",
    orderDate: "2024-01-14T14:20:00Z",
    status: "processing",
    total: 89.99,
    paymentMethod: "paypal",
    paymentStatus: "paid",
    shippingAddress: "456 Oak Ave, Los Angeles, CA 90210",
    items: [
      {
        id: "3",
        productName: "Anti-Aging Cream",
        productImage: "/placeholder.svg?height=50&width=50",
        quantity: 1,
        price: 129.99,
        total: 129.99,
      },
    ],
  },
  {
    id: "ORD-003",
    customerName: "Emily Davis",
    customerEmail: "emily.davis@email.com",
    customerPhone: "+1 (555) 456-7890",
    orderDate: "2024-01-13T09:15:00Z",
    status: "shipped",
    total: 67.98,
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    trackingNumber: "TRK987654321",
    shippingAddress: "789 Pine St, Chicago, IL 60601",
    items: [
      {
        id: "4",
        productName: "Volumizing Shampoo",
        productImage: "/placeholder.svg?height=50&width=50",
        quantity: 2,
        price: 34.99,
        total: 69.98,
      },
    ],
  },
  {
    id: "ORD-004",
    customerName: "David Wilson",
    customerEmail: "david.wilson@email.com",
    customerPhone: "+1 (555) 321-0987",
    orderDate: "2024-01-12T16:45:00Z",
    status: "pending",
    total: 89.99,
    paymentMethod: "cash_on_delivery",
    paymentStatus: "pending",
    shippingAddress: "321 Elm St, Miami, FL 33101",
    items: [
      {
        id: "5",
        productName: "Eau de Parfum",
        productImage: "/placeholder.svg?height=50&width=50",
        quantity: 1,
        price: 89.99,
        total: 89.99,
      },
    ],
  },
  {
    id: "ORD-005",
    customerName: "Lisa Anderson",
    customerEmail: "lisa.anderson@email.com",
    customerPhone: "+1 (555) 654-3210",
    orderDate: "2024-01-11T11:30:00Z",
    status: "cancelled",
    total: 54.98,
    paymentMethod: "credit_card",
    paymentStatus: "refunded",
    shippingAddress: "654 Maple Dr, Seattle, WA 98101",
    items: [
      {
        id: "6",
        productName: "Matte Lipstick",
        productImage: "/placeholder.svg?height=50&width=50",
        quantity: 2,
        price: 24.99,
        total: 49.98,
      },
    ],
    notes: "Customer requested cancellation",
  },
];

export const orderStatusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export const paymentMethodOptions = [
  { label: "Credit Card", value: "credit_card" },
  { label: "PayPal", value: "paypal" },
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "Cash on Delivery", value: "cash_on_delivery" },
];

export const paymentStatusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
];
