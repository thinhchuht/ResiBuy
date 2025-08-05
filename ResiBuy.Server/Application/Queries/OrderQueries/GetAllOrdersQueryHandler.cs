using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;

namespace ResiBuy.Server.Application.Queries.OrderQueries
{
    public record GetAllOrdersQuery(
       OrderStatus OrderStatus,
       PaymentMethod PaymentMethod,
       PaymentStatus PaymentStatus,
       Guid StoreId,
       Guid ShipperId,
       string UserId = null,
       int PageNumber = 1,
       int PageSize = 10,
       DateTime? StartDate = null,
       DateTime? EndDate = null
   ) : IRequest<ResponseModel>;


    public class GetAllOrdersQueryHandler(IOrderDbService orderDbService) : IRequestHandler<GetAllOrdersQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAllOrdersQuery request, CancellationToken cancellationToken)
        {
            var result = await orderDbService.GetAllAsync(
                request.OrderStatus,
                request.PaymentMethod,
                request.PaymentStatus,
                request.StoreId,
                request.ShipperId,
                request.UserId,
                request.PageNumber,
                request.PageSize,
                request.StartDate,
                request.EndDate
            );
            if (result.Items == null || !result.Items.Any())
                return ResponseModel.SuccessResponse(new PagedResult<OrderQueryResult>(new List<OrderQueryResult>(), 0, 1, 0));
            var items = result.Items.Select(item => new OrderQueryResult(
                item.Id,
                item.UserId,
                item.User == null ? null : new
                {
                    Id = item.User.Id,
                    FullName = item.User.FullName,
                    PhoneNumber = item.User.PhoneNumber
                },
                item.Shipper == null ? null : new
                {
                    Id = item.ShipperId,
                    PhoneNumber = item.Shipper.User.PhoneNumber
                },
                item.CreateAt,
                item.UpdateAt,
                item.Status,
                item.PaymentStatus,
                item.PaymentMethod,
                item.TotalPrice,
                item.ShippingFee,
                item.Note,
                item.CancelReason,
                item.Report == null ? null : new ReportQueryResult(
                    item.Report.Id,
                    item.Report.IsResolved,
                    item.Report.Title,
                    item.Report.Description,
                    item.Report.CreatedAt,
                    item.Report.CreatedById,
                    item.Report.ReportTarget,
                    item.Report.TargetId,
                    item.Id
                ),
                new RoomQueryResult(
                    item.ShippingAddress.Id,
                    item.ShippingAddress.Name,
                    item.ShippingAddress.Building.Name,
                    item.ShippingAddress.Building.Area.Name,
                    item.ShippingAddress.Building.Area.Id),
                new
                {
                    Id = item.StoreId,
                    Name = item.Store.Name,
                    PhoneNumber = item.Store.PhoneNumber
                },
                item.Voucher == null ? null : new { item.Voucher.Id, item.Voucher.DiscountAmount, item.Voucher.Type, item.Voucher.MinOrderPrice, item.Voucher.MaxDiscountPrice },
                item.Items.Select(oi => new OrderItemQueryResult(
                    oi.ID,
                    oi.ProductDetail.ProductId,
                    oi.ProductDetailId,
                    oi.ProductDetail.Reviews.Where(r => r.UserId == request.UserId).FirstOrDefault() == null ? null : oi.ProductDetail.Reviews.Where(r => r.UserId == request.UserId).FirstOrDefault().Id,
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
            )).ToList();
            return ResponseModel.SuccessResponse(new PagedResult<OrderQueryResult>(items, result.TotalCount, result.PageNumber, result.PageSize));
        }
    }
}
