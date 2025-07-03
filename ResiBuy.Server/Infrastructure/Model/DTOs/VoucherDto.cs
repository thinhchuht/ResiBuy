namespace ResiBuy.Server.Infrastructure.Model.DTOs
{
    public class VoucherDto
    {
        public VoucherDto(Guid id, decimal discountAmount, VoucherType type, int quantity, decimal minOrderPrice, decimal maxDiscountPrice, DateTime startDate, DateTime endDate, bool isActive)
        {
            Id = id;
            DiscountAmount = discountAmount;
            Type = type;
            Quantity = quantity;
            MinOrderPrice = minOrderPrice;
            MaxDiscountPrice = maxDiscountPrice;
            StartDate = startDate;
            EndDate = endDate;
            IsActive = isActive;
        }

        public Guid                     Id               { get; set; }
        public decimal                  DiscountAmount   { get; set; }
        public VoucherType              Type             { get; set; }
        public int                      Quantity         { get; set; }
        public decimal                  MinOrderPrice    { get; set; }
        public decimal                  MaxDiscountPrice { get; set; }
        public DateTime                 StartDate        { get; set; }
        public DateTime                 EndDate          { get; set; }
        public bool                     IsActive         { get; set; }
    }
}
