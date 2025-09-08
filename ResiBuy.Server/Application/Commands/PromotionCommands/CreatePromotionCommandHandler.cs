using ResiBuy.Server.Application.Commands.PromotionCommands.DTOs;
using ResiBuy.Server.Infrastructure.DbServices.PromotionDbService;
namespace ResiBuy.Server.Application.Commands.PromotionCommands
{
    public record CreatePromotionCommand(CreatePromotionDto Promotion) : IRequest<ResponseModel>;
    public class CreatePromotionCommandHandler(IPromotionDbService promotionDbService) : IRequestHandler<CreatePromotionCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreatePromotionCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Promotion;
            if (string.IsNullOrEmpty(dto.Name))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tên khuyến mãi là bắt buộc");
            if (dto.Discount <= 0 || dto.Discount > 100)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Giá trị khuyến mãi phải lớn hơn 0 và nhỏ hơn hoặc bằng 100");
            if (dto.StartDate >= dto.EndDate)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Ngày bắt đầu phải trước ngày kết thúc");
            if (dto.StartDate < DateTime.UtcNow)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Ngày bắt đầu phải sau ngày hiện tại");
            if (dto.EndDate < DateTime.UtcNow)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Ngày kết thúc phải sau ngày hiện tại");
            var promotion = new Promotion(dto.Name, dto.Discount, dto.StartDate, dto.EndDate, dto.IsActive);
            await promotionDbService.CreateAsync(promotion);
            return ResponseModel.SuccessResponse(promotion);
        }
    }
}
