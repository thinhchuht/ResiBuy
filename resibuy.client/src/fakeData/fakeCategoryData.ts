import type { Category } from "../types/models";
import { fakeProducts } from "./fakeProductData";

export const fakeCategories: Category[] = [
  {
    id: "1",
    name: "Electronics",
    products: fakeProducts.filter((product) => product.categoryId === "1"),
  },
  {
    id: "2",
    name: "Clothing",
    products: fakeProducts.filter((product) => product.categoryId === "2"),
  },
  {
    id: "3",
    name: "Home & Kitchen",
    products: fakeProducts.filter((product) => product.categoryId === "3"),
  },
  {
    id: "4",
    name: "Books",
    products: fakeProducts.filter((product) => product.categoryId === "4"),
  },
  {
    id: "5",
    name: "Sports & Outdoors",
    products: fakeProducts.filter((product) => product.categoryId === "5"),
  },
];
