namespace ResiBuy.Server.Infrastructure.Model.DTOs.OrderDtos
{
    public class UpdateOrderStatusDto
    {
        public string UserId { get; set; }
        public Guid OrderId { get; set; }
        public OrderStatus? OrderStatus { get; set; }
        public string Reason { get; set; }
    }
}
