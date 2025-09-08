namespace ResiBuy.Server.Infrastructure.DbServices.PromotionDbService
{
    public interface IPromotionDbService : IBaseDbService<Promotion>
    {
        Task<List<Promotion>> GetAllPromotionsAsync(string keyword, bool? isActive, DateTime? startDate, DateTime? endDate);
        Task<Promotion> GetPromotionByIdAsync(int id);
        Task<List<Product>> GetProductsByPromotionIdAsync(int promotionId);
    }
}
