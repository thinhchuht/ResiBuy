using ResiBuy.Server.Infrastructure.DbServices.VoucherDbServices;

namespace ResiBuy.Server.Application.Queries.VoucherQueries
{
    public record GetVoucherByIdQuery(Guid Id) : IRequest<ResponseModel>;
    public class GetVoucherByIdQueryHandler(IVoucherDbService voucherDbService) : IRequestHandler<GetVoucherByIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetVoucherByIdQuery query, CancellationToken cancellationToken)
        {
            if (query.Id == Guid.Empty)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tồn tại voucher");
            return ResponseModel.SuccessResponse(await voucherDbService.GetByIdBaseAsync(query.Id));
        }
    }
}
