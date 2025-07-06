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
  {
  id: "6",
  name: "Category 6",
  products: fakeProducts.filter((product) => product.categoryId === "6"),
},
{
  id: "7",
  name: "Category 7",
  products: fakeProducts.filter((product) => product.categoryId === "7"),
},
{
  id: "8",
  name: "Category 8",
  products: fakeProducts.filter((product) => product.categoryId === "8"),
},
{
  id: "9",
  name: "Category 9",
  products: fakeProducts.filter((product) => product.categoryId === "9"),
},
{
  id: "10",
  name: "Category 10",
  products: fakeProducts.filter((product) => product.categoryId === "10"),
},
{
  id: "11",
  name: "Category 11",
  products: fakeProducts.filter((product) => product.categoryId === "11"),
},
{
  id: "12",
  name: "Category 12",
  products: fakeProducts.filter((product) => product.categoryId === "12"),
},
{
  id: "13",
  name: "Category 13",
  products: fakeProducts.filter((product) => product.categoryId === "13"),
},
{
  id: "14",
  name: "Category 14",
  products: fakeProducts.filter((product) => product.categoryId === "14"),
},
{
  id: "15",
  name: "Category 15",
  products: fakeProducts.filter((product) => product.categoryId === "15"),
},
{
  id: "16",
  name: "Category 16",
  products: fakeProducts.filter((product) => product.categoryId === "16"),
},
{
  id: "17",
  name: "Category 17",
  products: fakeProducts.filter((product) => product.categoryId === "17"),
},
{
  id: "18",
  name: "Category 18",
  products: fakeProducts.filter((product) => product.categoryId === "18"),
},
{
  id: "19",
  name: "Category 19",
  products: fakeProducts.filter((product) => product.categoryId === "19"),
},
{
  id: "20",
  name: "Category 20",
  products: fakeProducts.filter((product) => product.categoryId === "20"),
},

];
