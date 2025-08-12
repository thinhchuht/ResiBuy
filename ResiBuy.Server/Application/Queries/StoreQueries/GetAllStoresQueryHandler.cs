using ResiBuy.Server.Infrastructure.Model;

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
            var pagedResult = await _storeDbService.GetAllStoresAsync(query.pageSize,query.pageNumber);
            var items = pagedResult.Items.Select(s => new StoreQueryResult(s.Id, s.Name, s.Description, s.IsLocked, s.IsOpen, s.ReportCount, s.CreatedAt, s.OwnerId, s.PhoneNumber,s.IsPayFee, new
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