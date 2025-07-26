namespace ResiBuy.Server.Infrastructure.Model.DTOs.ReviewDtos
{
    public class CreateReviewDto
    {
        public string UserId { get; set; }
        public int ProductDetailId { get; set; }
        public int Rate { get; set; }
        public string Comment { get; set; }
        public bool IsAnonymous { get; set; }
    }
}
