using ResiBuy.Server.Infrastructure.DbServices.CartItemDbService;

namespace ResiBuy.Server.Application.Queries.CartQueries
{
    public record GetCartStatusByIdQuery(Guid Id) : IRequest<ResponseModel>;
    public class GetCartStatusByIdQueryHandler(ICartItemDbService cartItemDbService) : IRequestHandler<GetCartStatusByIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetCartStatusByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                if (query.Id == Guid.Empty) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu Id giỏ hàng");
                var paginatedCart = await cartItemDbService.GetByIdBaseAsync(query.Id) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Giỏ hàng không tồn tại");
                return ResponseModel.SuccessResponse(paginatedCart);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }
        }
    }
}
