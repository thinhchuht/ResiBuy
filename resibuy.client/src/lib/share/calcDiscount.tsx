import { isNumber, round } from "lodash";

/**
 * Calculates discount percentage between original price and sale price.
 * @param {number} salePrice - The discounted price.
 * @param {number} price - The original price.
 * @returns {number} - Discount percentage rounded to nearest integer.
 */
export const calculateDiscount = (salePrice: number, price: number) => {
  if (!isNumber(salePrice) || !isNumber(price) || price <= 0) return 0;

  const discount = ((price - salePrice) / price) * 100;
  return round(discount);
};
