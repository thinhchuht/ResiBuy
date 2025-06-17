
namespace ResiBuy.Server.Application.Queries.CartQueries
{
    public record GetCartByIdQuery(Guid Id) : IRequest<ResponseModel>;
    public class GetCartByIdQueryHandler(ICartDbService cartDbService, IUserDbService userDbService) : IRequestHandler<GetCartByIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetCartByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                if(query.Id == Guid.Empty) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu Id giỏ hàng");
                var cart = await cartDbService.GetByIdAsync(query.Id) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Giỏ hàng không tồn tại");
                return ResponseModel.SuccessResponse(cart);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }
        }
    }
}

