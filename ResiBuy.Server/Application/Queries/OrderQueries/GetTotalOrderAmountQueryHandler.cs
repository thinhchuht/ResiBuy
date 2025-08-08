using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;

namespace ResiBuy.Server.Application.Queries.OrderQueries
{
    public record GetTotalOrderAmountQuery(string UserId, Guid StoreId) : IRequest<ResponseModel>;

    public class GetTotalOrderAmountQueryHandler(IOrderDbService orderDbService)
        : IRequestHandler<GetTotalOrderAmountQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetTotalOrderAmountQuery request, CancellationToken cancellationToken)
        {
            var total = await orderDbService.GetTotalOrderAmountByUserAndStoreAsync(request.UserId, request.StoreId);
            return ResponseModel.SuccessResponse(new { TotalOrderAmount = total });
        }
    }
}