import type { Cart, CartItem } from "../types/models";

export const fakeCartItems: CartItem[] = [
  {
    id: "1",
    cartId: "1",
    productId: "1",
    quantity: 1,
  },
  {
    id: "2",
    cartId: "1",
    productId: "2",
    quantity: 2,
  },
];

export const fakeCarts: Cart[] = [
  {
    id: "1",
    userId: "2",
    cartItems: fakeCartItems.filter((item) => item.cartId === "1"),
  },
];
