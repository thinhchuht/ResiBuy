namespace ResiBuy.Server.Infrastructure.Model.DTOs.CheckoutDtos
{
    public class ApplyVoucherDto
    {
        public Guid OrderId { get; set; }
        public Guid VoucherId { get; set; }
    }
}
