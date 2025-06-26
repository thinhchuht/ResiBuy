export interface MenuItem {
  name: string;
  path: string;
}

export const menuItems: MenuItem[] = [
  { name: "Dashboard", path: "/store" },
  { name: "Products", path: "/store/products" },
  { name: "Orders", path: "/store/orders" },
  { name: "CreateProduct", path: "/store/create" },
];
