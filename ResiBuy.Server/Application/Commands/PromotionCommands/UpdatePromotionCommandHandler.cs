using ResiBuy.Server.Application.Commands.PromotionCommands.DTOs;
using ResiBuy.Server.Infrastructure.DbServices.PromotionDbService;
namespace ResiBuy.Server.Application.Commands.PromotionCommands
{
    public record UpdatePromotionCommand(UpdatePromotionDto Promotion) : IRequest<ResponseModel>;
    public class UpdatePromotionCommandHandler(IPromotionDbService promotionDbService) : IRequestHandler<UpdatePromotionCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdatePromotionCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Promotion;
            if (string.IsNullOrEmpty(dto.Name))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tên khuyến mãi là bắt buộc");
            if (dto.Discount <= 0 || dto.Discount > 100)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Giá trị khuyến mãi phải lớn hơn 0 và nhỏ hơn hoặc bằng 100");
            if (dto.StartDate >= dto.EndDate)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Ngày bắt đầu phải trước ngày kết thúc");
            if (dto.EndDate < DateTime.UtcNow)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Ngày kết thúc phải sau ngày hiện tại");
            if (dto.Id <= 0)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id khuyến mãi không hợp lệ");
            var promotion = promotionDbService.GetPromotionByIdAsync(dto.Id).Result ?? throw new CustomException(ExceptionErrorCode.NotFound, "Khuyến mãi không tồn tại");
            promotion.UpdatePromotion(dto.Name, dto.Discount, dto.StartDate, dto.EndDate, dto.IsActive);
            await promotionDbService.UpdateAsync(promotion);
            return ResponseModel.SuccessResponse(promotion);
        }
    }
}
