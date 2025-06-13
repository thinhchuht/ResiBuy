export const formatPrice = (price: number | null | undefined) => {
  const safePrice = price ?? 0;
  return `${safePrice.toLocaleString('vi-VN')} VND`;
};
