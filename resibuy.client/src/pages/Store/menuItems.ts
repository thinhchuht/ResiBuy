export interface MenuItem {
  label: string;
  path: string;
}

export const menuItems = (storeId: string) => [
  { label: "Dashboard", path: `/store/${storeId}` },
  { label: "Product Page", path: `/store/${storeId}/productPage` },
  { label: "Orders", path: `/store/${storeId}/orders` },
  { label: "Create Product", path: `/store/${storeId}/product-create` },
  { label: "Voucher Page", path: `/store/${storeId}/vouchers` },
  { label: "Create Voucher", path: `/store/${storeId}/voucher-create` },
];
