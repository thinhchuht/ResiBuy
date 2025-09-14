namespace ResiBuy.Server.Infrastructure.Model
{
    public class Barcode
    {
        public int Id        { get; set; }
        public string Code   { get; set; }
        public int ProductDetailId { get; set; }
        public ProductDetail ProductDetail { get; set; }
    }
}
