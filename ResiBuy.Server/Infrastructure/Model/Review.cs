namespace ResiBuy.Server.Infrastructure.Model
{
    public class Review
    {
        public Review(int rate, string comment, bool isAnonymous, string userId, int productDetailId)
        {
            Rate = rate;
            Comment = comment;
            IsAnonymous = isAnonymous;
            UserId = userId;
            ProductDetailId = productDetailId;
            CreatedAt = DateTime.Now;
        }

        public Guid Id { get; set; }
        public int Rate { get; set; }
        public string Comment { get; set; }
        public bool IsAnonymous { get; set; }
        public string UserId { get; set; }
        public int ProductDetailId { get; set; }
        public DateTime CreatedAt { get; set; }
        public User User { get; set; }
        public ProductDetail ProductDetail { get; set; }
    }
}
