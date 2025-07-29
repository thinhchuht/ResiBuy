using ResiBuy.Server.Infrastructure.DbServices.ReviewDbServices;

namespace ResiBuy.Server.Application.Queries.ReviewQueries
{
    public record GetAverageRateQuery(int ProductId) : IRequest<ResponseModel>;
    public class GetAverageRateQueryHandler(IReviewDbService reviewDbService)
        : IRequestHandler<GetAverageRateQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAverageRateQuery query, CancellationToken cancellationToken)
        {
            var reviews = await reviewDbService.GetReviewsByProductIdAsync(query.ProductId);

            if (!reviews.Any())
            {
                return ResponseModel.SuccessResponse(new AverageRateQueryResult(query.ProductId, 0, 0, new List<RatingDistributionQueryResult>()));
            }

            var averageRating = (float)reviews.Average(r => r.Rate);

            var totalReviews = reviews.Count;
            var distribution = new List<RatingDistributionQueryResult>();
            for (int stars = 1; stars <= 5; stars++)
            {
                var count = reviews.Count(r => r.Rate == stars);
                var percentage = totalReviews > 0 ? (double)count / totalReviews * 100 : 0;
                distribution.Add(new RatingDistributionQueryResult(stars, count, Math.Round(percentage, 2)));
            }

            return ResponseModel.SuccessResponse(new AverageRateQueryResult(query.ProductId, averageRating, totalReviews, distribution));
        }
    }
}