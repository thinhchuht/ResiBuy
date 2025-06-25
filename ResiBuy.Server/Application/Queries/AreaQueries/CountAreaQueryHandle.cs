namespace ResiBuy.Server.Application.Queries.AreaQueries
{
    public record CountAreaQuery() : IRequest<ResponseModel>;

    public class CountAreaQueryHandler(IAreaDbService areaDbService)
        : IRequestHandler<CountAreaQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CountAreaQuery request, CancellationToken cancellationToken)
        {
            try
            {
                int count = await areaDbService.CountAsync();
                return ResponseModel.SuccessResponse(new { Count = count });
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        }
    }

