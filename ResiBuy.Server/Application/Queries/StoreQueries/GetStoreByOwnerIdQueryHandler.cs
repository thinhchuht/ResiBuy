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
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id người dùng là bắt buộc");

            var pagedResult = await _storeDbService.GetStoreByOwnerIdAsync(query.OwnerId, query.pageSize, query.pageNumber);
            if (pagedResult == null)
                throw new CustomException(ExceptionErrorCode.ValidationFailed,"Cửa hàng không tồn tại");
            var items = pagedResult.Items.Select(s => new StoreQueryResult(s.Id, s.Name, s.Description, s.IsLocked, s.IsOpen, s.ReportCount, s.CreatedAt, s.OwnerId,s.PhoneNumber,s.IsPayFee, new
            {
                Id = s.RoomId,
                Name = s.Room.Name,
                BuildingName = s.Room.Building.Name,
                AreaName = s.Room.Building.Area.Name,
            })).ToList();
            return ResponseModel.SuccessResponse(new PagedResult<StoreQueryResult>(items, pagedResult.TotalCount, pagedResult.PageNumber, pagedResult.PageSize));
        }
    }
} 