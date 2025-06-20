namespace ResiBuy.Server.Infrastructure.Model.DTOs.OrderDtos
{
    public class UpdateOrderDto
    {
        public string UserId { get; set; }
        public Guid OrderId { get; set; }
        public OrderStatus? OrderStatus { get; set; }
        public PaymentStatus? PaymentStatus { get; set; }
        public Guid ShippingAddressId { get; set; }
        public string Note { get; set; }
    }
}
