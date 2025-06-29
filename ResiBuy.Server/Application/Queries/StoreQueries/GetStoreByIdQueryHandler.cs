using ResiBuy.Server.Exceptions;
using ResiBuy.Server.Infrastructure.DbServices.StoreDbServices;

namespace ResiBuy.Server.Application.Queries.StoreQueries
{
    public record GetStoreByIdQuery(Guid Id) : IRequest<ResponseModel>;

    public class GetStoreByIdQueryHandler : IRequestHandler<GetStoreByIdQuery, ResponseModel>
    {
        private readonly IStoreDbService _storeDbService;

        public GetStoreByIdQueryHandler(IStoreDbService storeDbService)
        {
            _storeDbService = storeDbService;
        }

        public async Task<ResponseModel> Handle(GetStoreByIdQuery query, CancellationToken cancellationToken)
        {
            if (query.Id == Guid.Empty)
                throw new CustomException("StoreId là bắt buộc");

            var store = await _storeDbService.GetStoreByIdAsync(query.Id);
            if (store == null)
                throw new CustomException("Cửa hàng không tồn tại");

            return ResponseModel.SuccessResponse(store); 
        }
    }
} 