namespace ResiBuy.Server.Application.Queries.CategoryQueries
{
    public record CountAllCategoriesQuery() : IRequest<ResponseModel>;
    public class CountAllCategoriesQueryHandler(ICategoryDbService categoryDbService)
      : IRequestHandler<CountAllCategoriesQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CountAllCategoriesQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var count = await categoryDbService.CountAllCategoriesAsync();
                return ResponseModel.SuccessResponse(new { Count=  count });
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
