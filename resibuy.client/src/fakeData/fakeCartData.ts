import type { Cart, CartItem } from "../types/models";
import { fakeProducts } from "./fakeProductData";

export const fakeCartItems: CartItem[] = [
  {
    id: "1",
    cartId: "1",
    productId: "1",
    quantity: 1,
    product: fakeProducts[0], // iPhone 13 Pro
  },
  {
    id: "2",
    cartId: "1",
    productId: "2",
    quantity: 2,
    product: fakeProducts[1], // Samsung Galaxy S21
  },
  {
    id: "3",
    cartId: "1",
    productId: "3",
    quantity: 1,
    product: fakeProducts[2], // MacBook Pro M1
  },
  {
    id: "4",
    cartId: "1",
    productId: "4",
    quantity: 3,
    product: fakeProducts[3], // Nike Air Max
  },
  {
    id: "5",
    cartId: "1",
    productId: "7",
    quantity: 1,
    product: fakeProducts[6], // Smart Coffee Maker
  },
  {
    id: "6",
    cartId: "1",
    productId: "10",
    quantity: 2,
    product: fakeProducts[9], // The Great Gatsby
  },
];

export const fakeCarts: Cart[] = [
  {
    id: "1",
    userId: "2",
    cartItems: fakeCartItems.filter((item) => item.cartId === "1"),
  },
];
