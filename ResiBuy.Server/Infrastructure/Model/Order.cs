namespace ResiBuy.Server.Infrastructure.Model
{
    public class Order
    {
        public Guid                   Id                { get; set; }
        public decimal                TotalPrice        { get; set; }
        public OrderStatus            Status            { get; set; }
        public PaymentStatus          PaymentStatus     { get; set; }
        public DateTime               CreateAt          { get; set; }
        public DateTime               UpdateAt          { get; set; }
        public string                 UserId            { get; set; }
        public Guid                   StoreId           { get; set; }
        public Guid?                  ShipperId         { get; set; }
        public Guid?                  VoucherId         { get; set; }
        public User                   User              { get; set; }
        public Store                  Store             { get; set; }
        public Shipper                Shipper           { get; set; }
        public Voucher                Voucher           { get; set; }
        public IEnumerable<Report>    Reports           { get; set; } 
        public IEnumerable<OrderItem> Items             { get; set; }
    }
}
