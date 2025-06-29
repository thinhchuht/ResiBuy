using ResiBuy.Server.Exceptions;
using ResiBuy.Server.Infrastructure.DbServices.StoreDbServices;

namespace ResiBuy.Server.Application.Queries.StoreQueries
{
    public record GetStoreByOwnerIdQuery(string OwnerId,int pageSize = 5, int pageNumber =1) : IRequest<ResponseModel>;

    public class GetStoreByOwnerIdQueryHandler : IRequestHandler<GetStoreByOwnerIdQuery, ResponseModel>
    {
        private readonly IStoreDbService _storeDbService;

        public GetStoreByOwnerIdQueryHandler(IStoreDbService storeDbService)
        {
            _storeDbService = storeDbService;
        }

        public async Task<ResponseModel> Handle(GetStoreByOwnerIdQuery query, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(query.OwnerId))
                throw new CustomException("OwnerId là bắt buộc");

            var stores = await _storeDbService.GetStoreByOwnerIdAsync(query.OwnerId, query.pageSize, query.pageNumber);
            if (stores == null)
                throw new CustomException("Cửa hàng không tồn tại");

            return ResponseModel.SuccessResponse(stores);
        }
    }
} 