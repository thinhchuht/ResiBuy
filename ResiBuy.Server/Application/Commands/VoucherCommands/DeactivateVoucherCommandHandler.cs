using ResiBuy.Server.Infrastructure.DbServices.VoucherDbServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.VoucherDtos;

namespace ResiBuy.Server.Application.Commands.VoucherCommands
{
    public record DeactivateVoucherCommand(DeactivateVoucherDto DeactivateVoucherDto) : IRequest<ResponseModel>;
    public class DeactivateVoucherCommandHandler(IVoucherDbService voucherDbService) : IRequestHandler<DeactivateVoucherCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(DeactivateVoucherCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var dto = command.DeactivateVoucherDto;
                var voucher = await voucherDbService.GetByIdBaseAsync(dto.Id) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tìm thấy voucher");
                if (voucher.StoreId != dto.StoreId) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Bạn không có quyền sửa đổi voucher này");
                if (voucher.Quantity <= 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Voucher đã được sử dụng hết.");
                if (voucher.EndDate < DateTime.Now)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Voucher đã hết hạn sử dụng.");
                voucher.Deactivate();
                var updatedVoucher = await voucherDbService.UpdateAsync(voucher);
                return ResponseModel.SuccessResponse(updatedVoucher);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }
        }
    }
}
