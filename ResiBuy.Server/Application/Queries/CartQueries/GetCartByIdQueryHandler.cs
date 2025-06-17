using ResiBuy.Server.Infrastructure.DbServices.CartItemDbService;

namespace ResiBuy.Server.Application.Queries.CartQueries
{
    public record GetCartByIdQuery(Guid Id, int PageNumber = 1, int PageSize = 10) : IRequest<ResponseModel>;
    public class GetCartByIdQueryHandler(ICartItemDbService cartItemDbService) : IRequestHandler<GetCartByIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetCartByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                if (query.PageNumber < 1 || query.PageSize < 1)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số trang và số phần tử phải lớn hơn 0");
                if (query.Id == Guid.Empty) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu Id giỏ hàng");
                var paginatedCart = await cartItemDbService.GetCartItemsByCartIdAsync(query.Id, query.PageNumber, query.PageSize) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Giỏ hàng không tồn tại");
                return ResponseModel.SuccessResponse(paginatedCart);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }
        }
    }
}

