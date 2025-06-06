namespace ResiBuy.Server.Infrastructure.Model
{
    public class Voucher
    {
        public Guid                     Id               { get; set; }
        public decimal                  DiscountAmount   { get; set; }
        public string                   Type             { get; set; }
        public int                      Quantity         { get; set; }
        public decimal                  MinOrderPrice    { get; set; }
        public decimal                  MaxDiscountPrice { get; set; }
        public DateTime                 StartDate        { get; set; }
        public DateTime                 EndDate          { get; set; }
        public bool                     IsActive         { get; set; }
        public Guid                     StoreId          { get; set; }
        public Store                    Store            { get; set; }
        public IEnumerable<UserVoucher> UserVouchers     { get; set; }
        public IEnumerable<Order>       Orders           { get; set; }
    }
}
