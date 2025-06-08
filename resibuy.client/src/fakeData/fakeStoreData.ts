import type { Store } from "../types/models";
import { fakeProducts } from "./fakeProductData";

export const fakeStores: Store[] = [
  {
    id: "1",
    name: "Tech Haven",
    address: "123 Tech Street, Silicon Valley, CA",
    phoneNumber: "0123456789",
    email: "contact@techhaven.com",
    description: "Your one-stop shop for all tech needs",
    imageUrl: "https://example.com/techhaven.jpg",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    products: fakeProducts.filter((product) => product.storeId === "1"),
  },
  {
    id: "2",
    name: "Fashion Forward",
    address: "456 Style Avenue, New York, NY",
    phoneNumber: "0987654321",
    email: "info@fashionforward.com",
    description: "Trendy clothing and accessories",
    imageUrl: "https://example.com/fashionforward.jpg",
    isActive: true,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    products: fakeProducts.filter((product) => product.storeId === "2"),
  },
  {
    id: "3",
    name: "Home Essentials",
    address: "789 Home Road, Chicago, IL",
    phoneNumber: "0567891234",
    email: "support@homeessentials.com",
    description: "Everything you need for your home",
    imageUrl: "https://example.com/homeessentials.jpg",
    isActive: true,
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
    products: fakeProducts.filter((product) => product.storeId === "3"),
  },
];
