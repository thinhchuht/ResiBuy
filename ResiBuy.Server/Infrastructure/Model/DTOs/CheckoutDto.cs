namespace ResiBuy.Server.Infrastructure.Model.DTOs
{
    public class CheckoutDto
    {
        public string      UserId     { get; set; }
        public decimal     GrandTotal { get; set; }
        public Guid        AddressId { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public List<OrderDto> Orders     { get; set; }
        public bool IsInstance { get; set; }
    }
}
