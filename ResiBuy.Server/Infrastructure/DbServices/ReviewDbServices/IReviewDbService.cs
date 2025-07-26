namespace ResiBuy.Server.Infrastructure.DbServices.ReviewDbServices
{
    public interface IReviewDbService : IBaseDbService<Review>
    {
        Task<PagedResult<Review>> GetAllReviewsAsync(int productId, int rate = 0, int pageNumber = 1, int pageSize = 10);
        Task<bool> CheckIfUserReviewed(string userId, int productDetailId);
        Task<Review> GetReviewById(Guid id);
    }
}