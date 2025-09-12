using ResiBuy.Server.Infrastructure.DbServices.CartItemDbService;

namespace ResiBuy.Server.Application.Queries.CartQueries
{
    public record GetCartInShopQuery() : IRequest<ResponseModel>;
    public class GetCartInShopQueryHandler(ICartDbService cartDbService) : IRequestHandler<GetCartInShopQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetCartInShopQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var paginatedCart = await cartDbService.GetCartsInShoppingAsync();
                return ResponseModel.SuccessResponse(paginatedCart);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }
        }
    }
}
