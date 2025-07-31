using ResiBuy.Server.Infrastructure.DbServices.ReviewDbServices;

namespace ResiBuy.Server.Application.Queries.ReviewQueries
{
    public record GetReviewByIdQuery(Guid Id) : IRequest<ResponseModel>;
    public class GetReviewByIdQueryHandler(IReviewDbService reviewDbService)
        : IRequestHandler<GetReviewByIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetReviewByIdQuery query, CancellationToken cancellationToken)
        {
            var review = await reviewDbService.GetReviewById(query.Id);
            var reviewRs = new ReviewQueryResult(
                review.Id,
                new
                {
                    Id = review.ProductDetail.Id,
                    Name = review.ProductDetail.Product.Name,
                    AdditionalData = review.ProductDetail.AdditionalData.Select(ad => new AddtionalDataQueryResult(ad.Id, ad.Key, ad.Value)),

                },
                review.Rate,
                review.Comment,
                review.IsAnonymous ? null :
                new
                {
                    Name = review.User.FullName,
                    Avatar = review.User.Avatar == null ? null : new AvatarQueryResult(review.User.Avatar.Id, review.User.Avatar.Name, review.User.Avatar.Url, review.User.Avatar.ThumbUrl),
                },
                review.IsAnonymous,
                review.CreatedAt,
                review.UpdatedAt);
            return ResponseModel.SuccessResponse(reviewRs);
        }
    }
}