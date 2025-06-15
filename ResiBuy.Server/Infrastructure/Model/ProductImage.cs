namespace ResiBuy.Server.Infrastructure.Model
{
    public class ProductImage
    {
        public string Id { get; set; }
        public string ImgUrl { get; set; } = null!;
        public string ThumbUrl { get; set; }
        public string Name { get; set; }
        public Guid ProductId { get; set; }
        public Product Product { get; set; } = null!;
    }
}
