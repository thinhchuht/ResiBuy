namespace ResiBuy.BackgroundTask.Model
{
    public class UpdateOrderStatusDto
    {
        public string UserId { get; set; }
        public string OrderId { get; set; }

        public string? OrderStatus { get; set; }

        public string Reason { get; set; }
        public string? ShipperId { get; set; }
    }
}
