namespace ResiBuy.Server.Application.Queries.CartQueries
{
    public record GetChekingOutCartsQuery : IRequest<ResponseModel>;
    public class GetChekingOutCartsQueryHandler(ICartDbService cartDbService) : IRequestHandler< GetChekingOutCartsQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle( GetChekingOutCartsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var carts = await cartDbService.GetCheckingOutCartsAsync();
                return ResponseModel.SuccessResponse(carts);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }
        }
    }
}

