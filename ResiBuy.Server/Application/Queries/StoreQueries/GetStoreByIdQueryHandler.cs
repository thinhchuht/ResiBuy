namespace ResiBuy.Server.Application.Queriestore.StoreQueries
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
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id cửa hàng là bắt buộc");

            var store = await _storeDbService.GetStoreByIdAsync(query.Id);
            if (store == null)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Cửa hàng không tồn tại");

            return ResponseModel.SuccessResponse(new StoreQueryResult(store.Id, store.Name, store.Description, store.IsLocked, store.IsOpen, store.ReportCount, store.CreatedAt, store.OwnerId, new
            {
                Id = store.RoomId,
                Name = store.Room.Name,
                BuildingName = store.Room.Building.Name,
                AreaName = store.Room.Building.Area.Name,
            })); 
        }
    }
} 