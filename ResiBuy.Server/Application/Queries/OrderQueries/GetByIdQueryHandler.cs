using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;

namespace ResiBuy.Server.Application.Queries.OrderQueries
{
    public record GetByIdOrdersQuery(Guid Id, string UserId) : IRequest<ResponseModel>;

    public class GetByIdOrdersQueryHandler(IOrderDbService orderDbService) : IRequestHandler<GetByIdOrdersQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetByIdOrdersQuery request, CancellationToken cancellationToken)
        {
            var order = await orderDbService.GetById(request.Id) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Không tồn tại đơn hàng");

            var orderRs = new OrderQueryResult(
                order.Id,
                order.UserId,
                order.User == null ? null : new
                {
                   Id = order.User.Id,
                   FullName = order.User.FullName,
                   PhoneNumber =  order.User.PhoneNumber
                },
                order.Shipper == null ? null : new
                {
                    Id = order.ShipperId,
                    PhoneNumber = order.Shipper.User.PhoneNumber
                },
                order.CreateAt,
                order.UpdateAt,
                order.Status,
                order.PaymentStatus,
                order.PaymentMethod,
                order.TotalPrice,
                order.ShippingFee,
                order.Note,
                order.CancelReason,
                order.Report == null ? null : new ReportQueryResult(
                    order.Report.Id,
                    order.Report.IsResolved,
                    order.Report.Title,
                    order.Report.Description,
                    order.Report.CreatedAt,
                    order.Report.CreatedById,
                    order.Report.ReportTarget,
                    order.Report.TargetId,
                    order.Id
                ),
                new RoomQueryResult(
                    order.ShippingAddress.Id,
                    order.ShippingAddress.Name,
                    order.ShippingAddress.Building.Name,
                    order.ShippingAddress.Building.Area.Name,
                    order.ShippingAddress.Building.Area.Id),
                new
                {
                    Id = order.StoreId,
                    Name = order.Store.Name,
                    PhoneNumber = order.Store.PhoneNumber,
                },
                order.Voucher == null ? null : new { order.Voucher.Id, order.Voucher.DiscountAmount, order.Voucher.Type, order.Voucher.MinOrderPrice, order.Voucher.MaxDiscountPrice },
                order.Items.Select(oi => new OrderItemQueryResult(
                    oi.ID,
                    oi.ProductDetail.ProductId,
                    oi.ProductDetailId,
                    string.IsNullOrEmpty(request.UserId) ? null : oi.ProductDetail.Reviews.Where(r => r.UserId == request.UserId).FirstOrDefault().Id,
                    oi.ProductDetail.Product.Name,
                    oi.Quantity,
                    oi.Price,
                   new
                   {
                       oi.ProductDetail.Image.Id,
                       oi.ProductDetail.Image.Url,
                       oi.ProductDetail.Image.ThumbUrl,
                       oi.ProductDetail.Image.Name
                   }, 
                   oi.ProductDetail.AdditionalData.Select(ad => new AddtionalDataQueryResult(ad.Id, ad.Key, ad.Value)).ToList()
                )).ToList()
            );
            return ResponseModel.SuccessResponse(orderRs);
        }
    }
}
