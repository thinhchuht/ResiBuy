namespace ResiBuy.Server.Infrastructure.Model.DTOs
{
    public class CheckoutDto
    {
        public Guid CartId { get; set; }
        public Guid RoomId { get; set; }
        public string UserId { get; set; }
        public string Note { get; set; }
        public decimal TotalPrice { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public IEnumerable<Item> Items { get; set; }
    }

    public class Item
    {
        public int ProductDetailId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}
