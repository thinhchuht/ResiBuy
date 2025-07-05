using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;

namespace ResiBuy.Server.Application.Queries.OrderQueries
{
    public record GetByIdOrdersQuery(Guid Id) : IRequest<ResponseModel>;

    public class GetByIdOrdersQueryHandler(IOrderDbService orderDbService) : IRequestHandler<GetByIdOrdersQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetByIdOrdersQuery request, CancellationToken cancellationToken)
        {
            var order = await orderDbService.GetById(request.Id) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Không tồn tại đơn hàng");

            var orderRs = new OrderQueryResult(
                order.Id,
                order.UserId,
                order.CreateAt,
                order.UpdateAt,
                order.Status,
                order.PaymentStatus,
                order.PaymentMethod,
                order.TotalPrice,
                order.Note,
                new RoomQueryResult(
                    order.ShippingAddress.Id,
                    order.ShippingAddress.Name,
                    order.ShippingAddress.Building.Name,
                    order.ShippingAddress.Building.Area.Name),
                new
                {
                    Id = order.StoreId,
                    Name = order.Store.Name,
                },
                order.Voucher == null ? null : new { order.Voucher.Id, order.Voucher.DiscountAmount, order.Voucher.Type, order.Voucher.MinOrderPrice, order.Voucher.MaxDiscountPrice },
                order.Items.Select(oi => new OrderItemQueryResult(
                    oi.ID,
                    oi.ProductDetail.ProductId,
                    oi.ProductDetailId,
                    oi.ProductDetail.Product.Name,
                    oi.Quantity,
                    oi.Price,
                   new
                   {
                       oi.ProductDetail.Image.Id,
                       oi.ProductDetail.Image.Url,
                       oi.ProductDetail.Image.ThumbUrl,
                       oi.ProductDetail.Image.Name
                   }
                )).ToList()
            );
            return ResponseModel.SuccessResponse(orderRs);
        }
    }
}
