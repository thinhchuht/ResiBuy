namespace ResiBuy.Server.Application.Queries.StoreQueries
{
    public record CountAllStoresQuery() : IRequest<ResponseModel>;

    public class CountAllStoresQueryHandler(IStoreDbService storeDbService)
        : IRequestHandler<CountAllStoresQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CountAllStoresQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var count = await storeDbService.CountAllStoresAsync();
                return ResponseModel.SuccessResponse(new { Count = count });
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
