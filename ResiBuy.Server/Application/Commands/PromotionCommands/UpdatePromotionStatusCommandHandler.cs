using ResiBuy.Server.Infrastructure.DbServices.PromotionDbService;

namespace ResiBuy.Server.Application.Commands.PromotionCommands
{
    public record UpdatePromotionStatusCommand(int id, bool isActive) : IRequest<ResponseModel>;
    public class UpdatePromotionStatusCommandHandler(IPromotionDbService promotionDbService) : IRequestHandler<UpdatePromotionStatusCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdatePromotionStatusCommand request, CancellationToken cancellationToken)
        {
            if (request.id <= 0)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id khuyến mãi không hợp lệ");
            var promotion = promotionDbService.GetPromotionByIdAsync(request.id).Result ?? throw new CustomException(ExceptionErrorCode.NotFound, "Không tìm thấy khuyến mãi");
            promotion.IsActive = request.isActive;
            await promotionDbService.UpdateAsync(promotion);
            return ResponseModel.SuccessResponse(promotion);
        }
    }
}
