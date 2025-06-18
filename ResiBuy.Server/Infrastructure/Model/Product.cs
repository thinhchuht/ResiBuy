namespace ResiBuy.Server.Infrastructure.Model
{
    public class Product
    {
        public int                   Id           { get; set; }
        public string                 Name         { get; set; }
        public string                 Describe     { get; set; }
        public float                  Weight       { get; set; }
        public bool                   IsOutOfStock { get; set; }
        public int                    Discount     { get; set; }
        public int                    Sold         { get; set; }
        public DateTime               CreatedAt    { get; set; }
        public DateTime               UpdatedAt    { get; set; }
        public Guid                   StoreId      { get; set; }
        public Guid                   CategoryId   { get; set; }
        public Store                  Store        { get; set; }
        public Category               Category     { get; set; }
        public IEnumerable<ProductDetail> ProductDetails { get; set; }
    }
}
