namespace ResiBuy.Server.Application.Queries.StoreQueries
{
    public record GetChartDataQuery(Guid StoreId, DateTime StartDate, DateTime EndDate) : IRequest<ResponseModel>;
    public class GetChartDataQueryHandler : IRequestHandler<GetChartDataQuery, ResponseModel>
    {
        private readonly IStoreDbService _storeDbService;

        public GetChartDataQueryHandler(IStoreDbService storeDbService)
        {
            _storeDbService = storeDbService;
        }

        public async Task<ResponseModel> Handle(GetChartDataQuery query, CancellationToken cancellationToken)
        {
            if (query.StoreId == Guid.Empty)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id cửa hàng là bắt buộc");

            if (query.StartDate > query.EndDate)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thời gian bắt đầu không được lớn hơn thời gian kết thúc");

            var result = await _storeDbService.GetChartData(query.StoreId, query.StartDate, query.EndDate);

            if (result == null || !result.Any())
                throw new CustomException(ExceptionErrorCode.NotFound, "Không tìm thấy dữ liệu biểu đồ trong khoảng thời gian này");

            return ResponseModel.SuccessResponse(result);
        }
    }
}
