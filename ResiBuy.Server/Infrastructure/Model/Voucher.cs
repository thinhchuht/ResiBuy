namespace ResiBuy.Server.Infrastructure.Model
{

    public class Voucher
    {

        public Guid Id { get; set; }
        public decimal DiscountAmount { get; set; }
        public VoucherType Type { get; set; }
        public int Quantity { get; set; }
        public decimal MinOrderPrice { get; set; }
        public decimal MaxDiscountPrice { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public Guid StoreId { get; set; }
        public Store Store { get; set; }
        public IEnumerable<UserVoucher> UserVouchers { get; set; }
        public IEnumerable<Order> Orders { get; set; }

        public Voucher(decimal discountAmount, VoucherType type, int quantity, decimal minOrderPrice,
            decimal maxDiscountPrice, DateTime startDate, DateTime endDate, Guid storeId)
        {
            DiscountAmount = discountAmount;
            Type = type;
            Quantity = quantity;
            MinOrderPrice = minOrderPrice;
            MaxDiscountPrice = maxDiscountPrice;
            StartDate = startDate.Date;
            EndDate = endDate.Date;
            IsActive = true;
            StoreId = storeId;
        }

        public void Update(decimal discountAmount, VoucherType type, int quantity, decimal minOrderPrice,
            decimal maxDiscountPrice, DateTime startDate, DateTime endDate, bool isActive)
        {
            DiscountAmount = discountAmount;
            Type = type;
            Quantity = quantity;
            MinOrderPrice = minOrderPrice;
            MaxDiscountPrice = maxDiscountPrice;
            StartDate = startDate;
            EndDate = endDate;
            IsActive = isActive;
        }

        public void UpdateQuantity( int quantity)
        {
            Quantity = quantity;
            IsActive = quantity > 0;
        }
        public void Active()
        {
            IsActive = !IsActive;
        }
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum VoucherType
    {
        Amount = 1,
        Percentage = 2
    }

}
