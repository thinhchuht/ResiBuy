using ResiBuy.Server.Infrastructure.DbServices.CartItemDbService;

namespace ResiBuy.Server.Application.Queries.CartQueries
{

    public record GetCartItemsCountQuery(Guid CartId) : IRequest<ResponseModel>;
    public class  GetCartItemsCountQueryHandler(ICartItemDbService cartItemDbService) : IRequestHandler< GetCartItemsCountQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle( GetCartItemsCountQuery query, CancellationToken cancellationToken)
        {
            try
            {
                if (query.CartId == Guid.Empty) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu Id giỏ hàng");
                var itemsCount = await cartItemDbService.GetCartItemsCountAsync(query.CartId);
                return ResponseModel.SuccessResponse(itemsCount);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }
        }
    }
}
