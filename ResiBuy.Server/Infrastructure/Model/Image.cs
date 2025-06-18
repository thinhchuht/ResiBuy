namespace ResiBuy.Server.Infrastructure.Model
{
    public class Image
    {
        public string Id { get; set; }
        public string Url { get; set; } = null!;
        public string ThumbUrl { get; set; }
        public string Name { get; set; }
        public int? ProductDetailId { get; set; }
        public string? UserId { get; set; }
        public ProductDetail? ProductDetail { get; set; } = null!;
        public User? User { get; set; }
        public Guid? CategoryId { get; set; }
        public Category? Category { get; set; } = null!;
        public void UpdateImage(Image src)
        {
            Url = src.Url;
            ThumbUrl = src.ThumbUrl;
            Name = src.Name;
            UserId = src.UserId;
        }
    }
}
