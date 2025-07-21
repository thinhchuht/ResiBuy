namespace ResiBuy.Server.Application.Queries.CategoryQueries
{
    public record CountProductsByCategoryIdQuery(Guid CategoryId) : IRequest<ResponseModel>;
    public class CountProductsByCategoryIdQueryHandler(ICategoryDbService categoryDbService)
     : IRequestHandler<CountProductsByCategoryIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CountProductsByCategoryIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                if (query.CategoryId == Guid.Empty)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id danh mục không hợp lệ");

                var count = await categoryDbService.CountProductsByCategoryIdAsync(query.CategoryId);
                return ResponseModel.SuccessResponse(new
                {
                  
                    count = count
                });
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}