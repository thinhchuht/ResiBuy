using ResiBuy.Server.Infrastructure.DbServices.ReviewDbServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.ReviewDtos;

namespace ResiBuy.Server.Application.Queries.ReviewQueries
{
    public record GetAllReviewsQuery(GetAllReviewDto Dto) : IRequest<ResponseModel>;
    public class GetAllReviewsQueryHandler(IReviewDbService reviewDbService)
        : IRequestHandler<GetAllReviewsQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAllReviewsQuery query, CancellationToken cancellationToken)
        {
            var dto = query.Dto;
            var pagedResults = await reviewDbService.GetAllReviewsAsync(dto.ProductId, dto.Rate, dto.PageNumber, dto.PageSize);
            var items = pagedResults.Items.Select(review =>
            new ReviewQueryResult(
                review.Id,
                new
                {
                    Id = review.ProductDetail.Id,
                    Name = review.ProductDetail.Product.Name,
                    AdditionalData = review.ProductDetail.AdditionalData.Select(ad => new AddtionalDataQueryResult(ad.Id, ad.Key, ad.Value)).ToList(),
                },
                review.Rate,
                review.Comment,
                review.IsAnonymous ? null :
                new
                {
                    Name = review.User.FullName,
                    Avatar = new AvatarQueryResult(review.User.Avatar.Id, review.User.Avatar.Name, review.User.Avatar.Url, review.User.Avatar.ThumbUrl),
                },
                review.IsAnonymous,
                review.CreatedAt)).ToList();
            return ResponseModel.SuccessResponse(new PagedResult<ReviewQueryResult>(items, pagedResults.TotalCount, pagedResults.PageNumber, pagedResults.PageSize));
        }
    }
}