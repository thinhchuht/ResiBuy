namespace ResiBuy.Server.Infrastructure.Model
{
    public class Product
    {
        public Guid                   Id           { get; set; }
        public string                 Name         { get; set; }
        public string                 ImageUrl     { get; set; }
        public int                    Quantity     { get; set; }
        public string                 Describe     { get; set; }
        public decimal                Price        { get; set; }
        public float                  Weight       { get; set; }
        public bool                   IsOutOfStock { get; set; }
        public int                    Discount     { get; set; }
        public DateTime               CreatedAt    { get; set; }
        public DateTime               UpdatedAt    { get; set; }
        public Guid                   StoreId      { get; set; }
        public Guid                   CategoryId   { get; set; }
        public Store                  Store        { get; set; }
        public Category               Category     { get; set; }
        public IEnumerable<CartItem>  CartItems    { get; set; }
        public IEnumerable<OrderItem> OrderItems   { get; set; }
    }
}
