using ResiBuy.Server.Infrastructure.DbServices.VoucherDbServices;

namespace ResiBuy.Server.Application.Commands.VoucherCommands
{

    public record DeactivateBatchVoucherCommand : IRequest<ResponseModel>;
    public class DeactivateBatchVoucherCommandHandler(IVoucherDbService voucherDbService) : IRequestHandler<DeactivateBatchVoucherCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(DeactivateBatchVoucherCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var vouchers = await voucherDbService.GetAllActiveVouchersAsync();
                foreach (var voucher in vouchers)
                {
                    voucher.Deactivate();
                }
                var updatedVoucher = await voucherDbService.UpdateBatch(vouchers);
                return ResponseModel.SuccessResponse(updatedVoucher);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }
        }
    }
}
