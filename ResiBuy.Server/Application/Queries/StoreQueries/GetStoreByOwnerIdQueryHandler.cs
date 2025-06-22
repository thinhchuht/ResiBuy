using ResiBuy.Server.Exceptions;
using ResiBuy.Server.Infrastructure.DbServices.StoreDbServices;

namespace ResiBuy.Server.Application.Queries.StoreQueries
{
    public record GetStoreByOwnerIdQuery(string OwnerId) : IRequest<ResponseModel>;

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
                return ResponseModel.FailureResponse("OwnerId là bắt buộc");

            var store = await _storeDbService.GetStoreByOwnerIdAsync(query.OwnerId);
            if (store == null)
                return ResponseModel.FailureResponse("Store không tồn tại");

            return ResponseModel.SuccessResponse(store);
        }
    }
} 