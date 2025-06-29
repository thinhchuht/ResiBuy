using ResiBuy.Server.Infrastructure.DbServices.VoucherDbServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.VoucherDtos;

namespace ResiBuy.Server.Application.Commands.VoucherCommands
{
    public record CreateVoucherCommand(CreateVoucherDto CreateVoucherDto) : IRequest<ResponseModel>;
    public class CreateVoucherCommandHandler(IVoucherDbService voucherDbService) : IRequestHandler<CreateVoucherCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateVoucherCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var dto = command.CreateVoucherDto;
                if (dto.Type == VoucherType.Percentage && (dto.DiscountAmount <= 0 || dto.DiscountAmount > 100))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Chỉ được giảm tối đa 100%");
                if (dto.DiscountAmount <= 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số tiền giảm phải lớn hơn 0");
                if (dto.Quantity <= 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số lượng voucher phải lớn hơn 0");
                if (dto.MinOrderPrice < 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Giá đơn tối thiểu không được nhỏ hơn 0");
                if (dto.MaxDiscountPrice < 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Giá giảm tối đa không được nhỏ hơn 0");
                if (dto.StartDate < DateTime.Now)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Ngày bắt đầu phải sau thời điểm hiện tại");
                if (dto.StartDate >= dto.EndDate)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Ngày bắt đầu phải trước ngày kết thúc");
                var voucher = new Voucher(dto.DiscountAmount, dto.Type, dto.Quantity, dto.MinOrderPrice, dto.MaxDiscountPrice, dto.StartDate, dto.EndDate, dto.StoreId);
                var createdVoucher = await voucherDbService.CreateAsync(voucher);
                return ResponseModel.SuccessResponse(createdVoucher);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }
        }
    }
}
