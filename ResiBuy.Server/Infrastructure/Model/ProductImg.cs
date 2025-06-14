namespace ResiBuy.Server.Infrastructure.Model
{
    public class ProductImg
    {
        public int Id { get; set; }
        public string ImgUrl { get; set; } = null!;
        public Guid ProductId { get; set; }
        public Product Product { get; set; } = null!;
    }
}
