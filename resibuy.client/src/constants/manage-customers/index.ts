export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateJoined: string;
  status: "active" | "inactive" | "blocked";
  totalSpent: number;
  totalOrders: number;
  gameScore: number;
  lastLogin: string;
  avatar?: string;
  notes?: string;
  loyaltyTier: "bronze" | "silver" | "gold" | "platinum";
}

export interface GameScoreTransaction {
  id: string;
  customerId: string;
  type: "earned" | "redeemed" | "manual_add" | "manual_subtract";
  amount: number;
  description: string;
  date: string;
  orderId?: string;
}

export interface CustomerOrder {
  id: string;
  date: string;
  status: string;
  total: number;
  items: number;
}

export const sampleCustomers: Customer[] = [
  {
    id: "CUST-001",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, New York, NY 10001",
    dateJoined: "2023-06-15T10:30:00Z",
    status: "active",
    totalSpent: 1256.99,
    totalOrders: 8,
    gameScore: 2450,
    lastLogin: "2024-01-15T14:20:00Z",
    loyaltyTier: "gold",
    notes: "VIP customer, prefers premium products",
  },
  {
    id: "CUST-002",
    name: "Michael Chen",
    email: "michael.chen@email.com",
    phone: "+1 (555) 987-6543",
    address: "456 Oak Ave, Los Angeles, CA 90210",
    dateJoined: "2023-08-22T09:15:00Z",
    status: "active",
    totalSpent: 789.5,
    totalOrders: 5,
    gameScore: 1200,
    lastLogin: "2024-01-14T11:45:00Z",
    loyaltyTier: "silver",
  },
  {
    id: "CUST-003",
    name: "Emily Davis",
    email: "emily.davis@email.com",
    phone: "+1 (555) 456-7890",
    address: "789 Pine St, Chicago, IL 60601",
    dateJoined: "2023-04-10T16:20:00Z",
    status: "active",
    totalSpent: 2134.75,
    totalOrders: 12,
    gameScore: 3890,
    lastLogin: "2024-01-13T09:30:00Z",
    loyaltyTier: "platinum",
  },
  {
    id: "CUST-004",
    name: "David Wilson",
    email: "david.wilson@email.com",
    phone: "+1 (555) 321-0987",
    address: "321 Elm St, Miami, FL 33101",
    dateJoined: "2023-11-05T13:45:00Z",
    status: "inactive",
    totalSpent: 234.99,
    totalOrders: 2,
    gameScore: 450,
    lastLogin: "2023-12-20T15:10:00Z",
    loyaltyTier: "bronze",
  },
  {
    id: "CUST-005",
    name: "Lisa Anderson",
    email: "lisa.anderson@email.com",
    phone: "+1 (555) 654-3210",
    address: "654 Maple Dr, Seattle, WA 98101",
    dateJoined: "2023-09-18T08:30:00Z",
    status: "blocked",
    totalSpent: 567.25,
    totalOrders: 4,
    gameScore: 0,
    lastLogin: "2023-12-15T12:20:00Z",
    loyaltyTier: "bronze",
    notes: "Account blocked due to payment issues",
  },
  {
    id: "CUST-006",
    name: "Robert Taylor",
    email: "robert.taylor@email.com",
    phone: "+1 (555) 789-0123",
    address: "987 Cedar Ln, Boston, MA 02101",
    dateJoined: "2023-07-12T14:15:00Z",
    status: "active",
    totalSpent: 1456.8,
    totalOrders: 9,
    gameScore: 2100,
    lastLogin: "2024-01-12T16:45:00Z",
    loyaltyTier: "gold",
  },
];

export const sampleGameScoreTransactions: GameScoreTransaction[] = [
  {
    id: "GST-001",
    customerId: "CUST-001",
    type: "earned",
    amount: 150,
    description: "Order completion bonus",
    date: "2024-01-15T10:30:00Z",
    orderId: "ORD-001",
  },
  {
    id: "GST-002",
    customerId: "CUST-001",
    type: "redeemed",
    amount: -500,
    description: "Redeemed for 10% discount voucher",
    date: "2024-01-10T14:20:00Z",
  },
  {
    id: "GST-003",
    customerId: "CUST-002",
    type: "earned",
    amount: 200,
    description: "Daily login bonus",
    date: "2024-01-14T09:15:00Z",
  },
  {
    id: "GST-004",
    customerId: "CUST-001",
    type: "manual_add",
    amount: 1000,
    description: "Compensation for delayed delivery",
    date: "2024-01-08T11:30:00Z",
  },
];

export const customerStatusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Blocked", value: "blocked" },
];

export const loyaltyTierOptions = [
  { label: "Bronze", value: "bronze" },
  { label: "Silver", value: "silver" },
  { label: "Gold", value: "gold" },
  { label: "Platinum", value: "platinum" },
];

export const gameScoreTransactionTypes = [
  { label: "Earned", value: "earned" },
  { label: "Redeemed", value: "redeemed" },
  { label: "Manual Add", value: "manual_add" },
  { label: "Manual Subtract", value: "manual_subtract" },
];
