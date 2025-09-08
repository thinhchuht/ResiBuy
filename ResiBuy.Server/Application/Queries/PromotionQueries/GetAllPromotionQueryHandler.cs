using ResiBuy.Server.Application.Queries.PromotionQueries.DTOs;
using ResiBuy.Server.Infrastructure.DbServices.PromotionDbService;

namespace ResiBuy.Server.Application.Queries.PromotionQueries
{
    public record GetAllPromotionQuery(GetPromotionDto Request) : IRequest<ResponseModel>;

    public class GetAllPromotionQueryHandler(IPromotionDbService promotionDbService)
        : IRequestHandler<GetAllPromotionQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAllPromotionQuery request, CancellationToken cancellationToken)
        {
            var dto = request.Request;

            var promotions = await promotionDbService.GetAllPromotionsAsync(
                dto.Keyword,
                dto.IsActive,
                dto.StartDate,
                dto.EndDate
            );

            var result = promotions.Select(p => new ResultPromotionDto
            {
                Id = p.Id,
                Name = p.Name,
                Discount = p.Discount,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                IsActive = p.IsActive
            }).ToList();

            return ResponseModel.SuccessResponse(result);
        }
    }
}
