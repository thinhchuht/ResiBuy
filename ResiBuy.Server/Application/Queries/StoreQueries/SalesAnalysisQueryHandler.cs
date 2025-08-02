namespace ResiBuy.Server.Application.Queries.StoreQueries
{
    public record SalesAnalysisQuery(Guid StoreId, DateTime StartDate, DateTime EndDate) : IRequest<ResponseModel>;
    public class SalesAnalysisQueryHandler : IRequestHandler<SalesAnalysisQuery, ResponseModel>
    {
        private readonly IStoreDbService _storeDbService;

        public SalesAnalysisQueryHandler(IStoreDbService storeDbService)
        {
            _storeDbService = storeDbService;
        }

        public async Task<ResponseModel> Handle(SalesAnalysisQuery query, CancellationToken cancellationToken)
        {
            if (query.StoreId == Guid.Empty)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id cửa hàng là bắt buộc");

            if (query.StartDate > query.EndDate)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thời gian bắt đầu không được lớn hơn thời gian kết thúc");

            var result = await _storeDbService.SalesAnalysis(query.StoreId, query.StartDate, query.EndDate);
            if (result == null)
                throw new CustomException(ExceptionErrorCode.NotFound, "Không tìm thấy dữ liệu phân tích");

            return ResponseModel.SuccessResponse(result);
        }
    }
}
