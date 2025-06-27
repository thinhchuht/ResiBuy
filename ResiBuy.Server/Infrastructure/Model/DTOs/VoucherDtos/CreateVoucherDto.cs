namespace ResiBuy.Server.Infrastructure.Model.DTOs.VoucherDtos
{
    public class CreateVoucherDto
    {
        public decimal DiscountAmount { get; set; }
        public VoucherType Type { get; set; } 
        public int Quantity { get; set; }
        public decimal MinOrderPrice { get; set; }
        public decimal MaxDiscountPrice { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public Guid StoreId { get; set; }
    }
}
