using ResiBuy.Server.Infrastructure.DbServices.VoucherDbServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.VoucherDtos;

namespace ResiBuy.Server.Application.Commands.VoucherCommands
{
    public record UpdateQuantityCommand(UpdateQuantityVoucherDto UpdateQuantityVoucherDto) : IRequest<ResponseModel>;
    public class UpdateQuantityCommandHandler(IVoucherDbService voucherDbService) : IRequestHandler<UpdateQuantityCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateQuantityCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var dto = command.UpdateQuantityVoucherDto;
                if (dto.Quantity <= 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số lượng voucher phải lớn hơn 0");
                var voucher = await voucherDbService.GetByIdBaseAsync(dto.Id) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tìm thấy voucher");
                if (voucher.StoreId != dto.StoreId) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Bạn không có quyền sửa đổi voucher này");
                voucher.UpdateQuantity(dto.Quantity);
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
