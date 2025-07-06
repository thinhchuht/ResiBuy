namespace ResiBuy.Server.Common
{
    public class CalculatePrice
    {
        public static decimal GetTotalPrice(decimal originalTotal, Voucher voucher)
        {
            if (voucher == null)
                return originalTotal;

            decimal discount = 0;
            if (voucher.Type == VoucherType.Amount)
            {
                discount = voucher.DiscountAmount;
            }
            else if (voucher.Type == VoucherType.Percentage)
            {
                discount = originalTotal * (voucher.DiscountAmount / 100);
                if (discount > voucher.MaxDiscountPrice)
                {
                    discount = voucher.MaxDiscountPrice;
                }
            }
            decimal finalTotal = originalTotal - discount;
            return finalTotal > 0 ? finalTotal : 0;
        }
    }
}
