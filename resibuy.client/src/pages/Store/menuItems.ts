export interface MenuItem {
  label: string;
  path: string;
}

export const menuItems = (storeId: string) => [
  { label: "Dashboard", path: `/store/${storeId}` },
  { label: "ProductPage", path: `/store/${storeId}/productPage` },
  { label: "Orders", path: `/store/${storeId}/orders` },
  { label: "Create Product", path: `/store/${storeId}/create` },
];
