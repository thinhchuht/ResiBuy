namespace ResiBuy.Server.Infrastructure.Model
{
    public class AdditionalData
    {
        public int Id { get; set; }
        public string Key { get; set; }
        public string Value { get; set; }
        public int ProductDetailId { get; set; }
        public ProductDetail ProductDetail { get; set; } = null!;
    }
}
