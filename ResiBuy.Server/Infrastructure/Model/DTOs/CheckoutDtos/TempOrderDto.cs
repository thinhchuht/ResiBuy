namespace ResiBuy.Server.Infrastructure.Model.DTOs.CheckoutDtos
{
    public class TempOrderDto
    {
        public Guid Id { get; set; }
        public Guid StoreId { get; set; }
        public Guid? VoucherId { get; set; }
        public string Note { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal DiscountAmount { get; set; }
        public VoucherDto? Voucher { get; set; }
        public IEnumerable<TempProductDetailDto> ProductDetails { get; set; }
    }


}
