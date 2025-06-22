using ResiBuy.Server.Infrastructure.DbServices.StoreDbServices;

namespace ResiBuy.Server.Application.Queries.StoreQueries
{
    public record GetAllStoresQuery() : IRequest<ResponseModel>;

    public class GetAllStoresQueryHandler : IRequestHandler<GetAllStoresQuery, ResponseModel>
    {
        private readonly IStoreDbService _storeDbService;

        public GetAllStoresQueryHandler(IStoreDbService storeDbService)
        {
            _storeDbService = storeDbService;
        }

        public async Task<ResponseModel> Handle(GetAllStoresQuery query, CancellationToken cancellationToken)
        {
            var stores = await _storeDbService.GetAllStoresAsync();
            return ResponseModel.SuccessResponse(stores);
        }
    }
} 