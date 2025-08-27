namespace ResiBuy.BackgroundTask.Model
{
    public class UpdateOrderStatusDto
    {
        public string UserId { get; set; }
        public Guid OrderId { get; set; }
        public OrderStatus? OrderStatus { get; set; }
        public string Reason { get; set; }
        public Guid? ShipperId { get; set; }
    }
    public enum OrderStatus
    {
        None,
        Pending, // Chờ store xác nhận
        Processing, // Spore đã xác nhận, đang đợi ship
        Assigned, //Đơn hàng được bắn cho Shipper
        Shipped, //Shipper đang cầm hàng và đang giao
        Delivered, // Đã giao hàng
        CustomerNotAvailable, // Khách không có mặt để nhận hàng
        Cancelled, // Hủy đơn hàng
        Reported // Đơn hàng bị báo cáo
    }
}
