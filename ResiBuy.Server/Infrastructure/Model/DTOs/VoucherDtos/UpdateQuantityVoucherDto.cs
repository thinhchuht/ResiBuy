namespace ResiBuy.Server.Infrastructure.Model.DTOs.VoucherDtos
{
    public class UpdateQuantityVoucherDto
    {
        public Guid Id { get; set; }
        public int Quantity { get; set; }
        public Guid StoreId { get; set; }
    }
}
