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
            var startDate = dto.StartDate.Date.AddDays(1).AddTicks(-1); // đầu ngày
            var endDate = dto.EndDate.Date.AddDays(1).AddTicks(-1); // cuối ngày (23:59:59.9999999)

            if (string.IsNullOrEmpty(dto.Name))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tên khuyến mãi là bắt buộc");

            if (dto.Discount <= 0 || dto.Discount > 100)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Giá trị khuyến mãi phải lớn hơn 0 và nhỏ hơn hoặc bằng 100");

            if (startDate >= endDate)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Ngày bắt đầu phải trước ngày kết thúc");

            if (startDate < DateTime.UtcNow.Date)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Ngày bắt đầu phải sau ngày hiện tại");

            if (endDate < DateTime.UtcNow)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Ngày kết thúc phải sau ngày hiện tại");

            var promotion = new Promotion(dto.Name, dto.Discount, startDate, endDate, dto.IsActive);
            await promotionDbService.CreateAsync(promotion);

            return ResponseModel.SuccessResponse(promotion);
        }
    }
}
