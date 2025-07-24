using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;

namespace ResiBuy.Server.Application.Queries.OrderQueries
{
    public record GetTotalShippingFeeQuery(Guid ShipperId, DateTime? StartDate, DateTime? EndDate) : IRequest<ResponseModel>;

    public class GetTotalShippingFeeByShipeerQueryHandler(IOrderDbService orderDbService)
    : IRequestHandler<GetTotalShippingFeeQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetTotalShippingFeeQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var totalFee = await orderDbService.GetTotalShippingFeeByshipperAsync(
                    query.ShipperId, query.StartDate, query.EndDate
                );

                return ResponseModel.SuccessResponse(totalFee);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}