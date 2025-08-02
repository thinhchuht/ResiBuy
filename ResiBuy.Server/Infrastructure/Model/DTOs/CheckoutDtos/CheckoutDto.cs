namespace ResiBuy.Server.Infrastructure.Model.DTOs.CheckoutDtos
{
    public class CheckoutDto
    {
        public string UserId { get; set; }
        public decimal GrandTotal { get; set; }
        public Guid AddressId { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public List<OrderDto> Orders { get; set; }
        public bool IsInstance { get; set; }
    }

    public class TempCheckoutDto
    {
        public Guid Id { get; set; }
        public string UserId { get; set; }
        public Guid? AddressId { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public decimal GrandTotal { get; set; }
        public List<TempOrderDto> Orders { get; set; }
        public bool IsInstance { get; set; }
    }
}
