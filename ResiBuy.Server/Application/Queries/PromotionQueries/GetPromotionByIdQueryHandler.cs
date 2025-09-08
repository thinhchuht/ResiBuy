using ResiBuy.Server.Application.Queries.PromotionQueries.DTOs;
using ResiBuy.Server.Infrastructure.DbServices.PromotionDbService;

namespace ResiBuy.Server.Application.Queries.PromotionQueries
{
    public record GetPromotionByIdQuery(int Id) : IRequest<ResponseModel>;
    public class GetPromotionByIdQueryHandler
        : IRequestHandler<GetPromotionByIdQuery, ResponseModel>
    {
        private readonly IPromotionDbService _promotionDbService;

        public GetPromotionByIdQueryHandler(IPromotionDbService promotionDbService)
        {
            _promotionDbService = promotionDbService;
        }

        public async Task<ResponseModel> Handle(GetPromotionByIdQuery request, CancellationToken cancellationToken)
        {
            if (request.Id <= 0)
            {
                throw new CustomException(ExceptionErrorCode.InvalidInput, "Id không phù hợp");
            }

            var promotion = await _promotionDbService.GetPromotionByIdAsync(request.Id);

            if (promotion == null)
            {
                throw new CustomException(ExceptionErrorCode.NotFound, "Khuyến mãi không tồn tại.");
            }

            var result = new ResultPromotionDto
            {
                Id = promotion.Id,
                Name = promotion.Name,
                Discount = promotion.Discount,
                StartDate = promotion.StartDate,
                EndDate = promotion.EndDate,
                IsActive = promotion.IsActive
            };

            return ResponseModel.SuccessResponse(result);
        }
    }
}
