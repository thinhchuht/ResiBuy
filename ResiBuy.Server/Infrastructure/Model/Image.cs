namespace ResiBuy.Server.Infrastructure.Model
{
    public class Image
    {
        public string Id { get; set; }
        public string ImgUrl { get; set; } = null!;
        public string ThumbUrl { get; set; }
        public string Name { get; set; }
        public Guid? ProductId { get; set; }
        public string? UserId { get; set; }
        public Product? Product { get; set; } = null!;
        public User User { get; set; }

        public void UpdateImage(Image src)
        { 
            ImgUrl = src.ImgUrl;
            ThumbUrl = src.ThumbUrl;
            Name = src.Name;
            UserId = src.UserId;
        }
    }
}
