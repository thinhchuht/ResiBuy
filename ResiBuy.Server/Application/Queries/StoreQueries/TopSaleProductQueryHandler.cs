namespace ResiBuy.Server.Application.Queries.StoreQueries
{
    public record TopSaleProductQuery(Guid StoreId, DateTime StartDate, DateTime EndDate) : IRequest<ResponseModel>;
    public class TopSaleProductQueryHandler
    {
        private readonly IStoreDbService _storeDbService;

        public TopSaleProductQueryHandler(IStoreDbService storeDbService)
        {
            _storeDbService = storeDbService;
        }

        public async Task<ResponseModel> Handle(TopSaleProductQuery query, CancellationToken cancellationToken)
        {
            if (query.StoreId == Guid.Empty)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id cửa hàng là bắt buộc");

            if (query.StartDate > query.EndDate)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thời gian bắt đầu không được lớn hơn thời gian kết thúc");

            var result = await _storeDbService.TopSaleProduct(query.StoreId, query.StartDate, query.EndDate);
            if (result == null || !result.Any())
                throw new CustomException(ExceptionErrorCode.NotFound, "Không tìm thấy sản phẩm bán chạy trong khoảng thời gian này");

            return ResponseModel.SuccessResponse(result);
        }
    }
}
