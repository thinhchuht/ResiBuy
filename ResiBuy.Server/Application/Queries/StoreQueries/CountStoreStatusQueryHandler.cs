namespace ResiBuy.Server.Application.Queries.StoreQueries
{
    public record CountStoreStatusQuery() : IRequest<ResponseModel>;

    public class CountStoreStatusQueryHandler(IStoreDbService storeDbService)
        : IRequestHandler<CountStoreStatusQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CountStoreStatusQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var openTrue = await storeDbService.CountStoresByIsOpenAsync(true);
                var openFalse = await storeDbService.CountStoresByIsOpenAsync(false);
                var lockedTrue = await storeDbService.CountStoresByIsLockedAsync(true);
                var lockedFalse = await storeDbService.CountStoresByIsLockedAsync(false);

                var result = new
                {
                    IsOpen = new { True = openTrue, False = openFalse },
                    IsLocked = new { True = lockedTrue, False = lockedFalse }
                };

                return ResponseModel.SuccessResponse(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}