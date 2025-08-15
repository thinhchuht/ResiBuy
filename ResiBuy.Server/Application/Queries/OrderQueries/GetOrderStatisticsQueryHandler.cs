using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;

namespace ResiBuy.Server.Application.Queries.OrderQueries
{
    public record GetOrderStatisticsQuery() : IRequest<ResponseModel>;

    public class GetOrderStatisticsQueryHandler(IOrderDbService orderDbService)
        : IRequestHandler<GetOrderStatisticsQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetOrderStatisticsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var stats = await orderDbService.GetOrderStatisticsAsync();

                return ResponseModel.SuccessResponse(stats);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}