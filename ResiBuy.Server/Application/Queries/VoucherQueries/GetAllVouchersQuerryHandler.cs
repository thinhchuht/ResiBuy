namespace ResiBuy.Server.Application.Queries.VoucherQueries
{
    using ResiBuy.Server.Infrastructure.DbServices.VoucherDbServices;
    using ResiBuy.Server.Infrastructure.Model.DTOs.VoucherDtos;

    public record GetAllVouchersQuery(GetAllVouchersDto VoucherDto) : IRequest<ResponseModel>;
    public class GetAllVouchersQueryHandler(IVoucherDbService voucherDbService) : IRequestHandler<GetAllVouchersQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAllVouchersQuery query, CancellationToken cancellationToken)
        {
            if (query.VoucherDto.PageNumber < 1 || query.VoucherDto.PageSize < 1)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số trang và số phần tử phải lớn hơn 0");
            var pagedResult = await voucherDbService.GetAllVouchersAsync(query.VoucherDto.StoreId, query.VoucherDto.IsActive, query.VoucherDto.StartDate, query.VoucherDto.EndDate, query.VoucherDto.PageNumber, query.VoucherDto.PageSize, query.VoucherDto.UserId);
            var items = pagedResult.Items.Select(v => new VoucherQueryResult(v.Id, v.DiscountAmount, v.Type.ToString(), v.Quantity, v.MinOrderPrice, v.MaxDiscountPrice,
                v.StartDate, v.EndDate, v.IsActive, v.StoreId)).ToList();
            var result = new PagedResult<VoucherQueryResult>(items, pagedResult.TotalCount, pagedResult.PageNumber, pagedResult.PageSize);
            return ResponseModel.SuccessResponse(result);
        }
    }
}
