namespace ResiBuy.Server.Infrastructure.Model.DTOs.ReviewDtos
{
    public class GetAllReviewDto
    {
        public int ProductId { get; set; }
        public int Rate { get; set; } = 0;
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
