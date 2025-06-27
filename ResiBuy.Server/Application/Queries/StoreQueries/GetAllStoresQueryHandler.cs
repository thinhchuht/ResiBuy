using ResiBuy.Server.Infrastructure.DbServices.StoreDbServices;

namespace ResiBuy.Server.Application.Queries.StoreQueries
{
    public record GetAllStoresQuery(int pageSize=5,int pageNumber=1) : IRequest<ResponseModel>;

    public class GetAllStoresQueryHandler : IRequestHandler<GetAllStoresQuery, ResponseModel>
    {
        private readonly IStoreDbService _storeDbService;

        public GetAllStoresQueryHandler(IStoreDbService storeDbService)
        {
            _storeDbService = storeDbService;
        }

        public async Task<ResponseModel> Handle(GetAllStoresQuery query, CancellationToken cancellationToken)
        {
            var stores = await _storeDbService.GetAllStoresAsync(query.pageSize,query.pageNumber);
            return ResponseModel.SuccessResponse(stores);
        }
    }
} 