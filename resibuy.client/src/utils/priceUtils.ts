export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getMinPrice(product: { costData: { price: number }[] }): number {
  return Math.min(...product.costData.map((cost) => cost.price));
}
