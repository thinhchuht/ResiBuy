using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;

namespace ResiBuy.Server.Application.Queries.OrderQueries
{
    public record CountOrdersQuery(Guid? ShipperId, Guid? StoreId, string? UserId, OrderStatus? Status) : IRequest<ResponseModel>;

    public class CountOrdersQueryHandler(IOrderDbService orderDbService)
     : IRequestHandler<CountOrdersQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CountOrdersQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var count = await orderDbService.CountOrdersAsync(
                    query.ShipperId, query.StoreId, query.UserId, query.Status
                );

                return ResponseModel.SuccessResponse(count);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
