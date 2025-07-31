namespace ResiBuy.Server.Application.Queries.StoreQueries
{
    public record TopSaleDetailQuery(int ProductId) : IRequest<ResponseModel>;
    public class TopSaleDetailQueryHandler : IRequestHandler<TopSaleDetailQuery, ResponseModel>
    {
        private readonly IStoreDbService _storeDbService;

        public TopSaleDetailQueryHandler(IStoreDbService storeDbService)
        {
            _storeDbService = storeDbService;
        }

        public async Task<ResponseModel> Handle(TopSaleDetailQuery query, CancellationToken cancellationToken)
        {
            if (query.ProductId <= 0)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "ID sản phẩm không hợp lệ");

            var result = await _storeDbService.TopSaleDetail(query.ProductId);
            if (result == null || !result.Any())
                throw new CustomException(ExceptionErrorCode.NotFound, "Không tìm thấy dữ liệu chi tiết bán chạy");

            return ResponseModel.SuccessResponse(result);
        }
    }
}
