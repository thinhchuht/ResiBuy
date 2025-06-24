namespace ResiBuy.Server.Infrastructure.Model.EventDataDto
{
    public class OrderStatusChangedDto
    {
        public Guid Id { get; set; }
        public OrderStatus OrderStatus { get; set; } 
        public OrderStatus OldOrderStatus { get; set; }
        public PaymentStatus PaymentStatus { get; set; }  
        public DateTime CreatedAt { get; set; }
        public OrderStatusChangedDto()
        {
            
        }

        public OrderStatusChangedDto(Guid orderId, OrderStatus orderStatus, OrderStatus oldOrderStatus, PaymentStatus paymentStatus, DateTime createdAt)
        {
            Id = orderId;
            OrderStatus = orderStatus;
            OldOrderStatus = oldOrderStatus;
            PaymentStatus = paymentStatus;
            CreatedAt = createdAt;
        }
    }
}
