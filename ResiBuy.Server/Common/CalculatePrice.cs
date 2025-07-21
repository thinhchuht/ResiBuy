namespace ResiBuy.Server.Common
{
    public class CalculatePrice
    {
        public static decimal GetDiscountAmount(decimal originalTotal, Voucher voucher)
        {
            if (voucher == null)
                return 0;

            if (voucher.Type == VoucherType.Amount)
            {
                return voucher.DiscountAmount;
            }

            if (voucher.Type == VoucherType.Percentage)
            {
                var percentageDiscount = originalTotal * (voucher.DiscountAmount / 100);
                return Math.Min(percentageDiscount, voucher.MaxDiscountPrice);
            }

            return 0;
        }
        public static decimal GetFinalTotal(decimal originalTotal, Voucher voucher)
        {
            var discount = GetDiscountAmount(originalTotal, voucher);
            var finalTotal = Math.Round(originalTotal - discount, MidpointRounding.AwayFromZero);
            return finalTotal > 0 ? finalTotal : 0;
        }
    }
}
