using ResiBuy.Server.Infrastructure.DbServices.BarcodeDbServices;
using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;

namespace ResiBuy.Server.Application.Commands.OrderCommands
{
    public record UpdateBarcodeToOrderCommand( OrderDto request) : IRequest<ResponseModel>;
    public class UpdateBarcodeToOrderCommandHandle(IOrderDbService orderDbService, IBarcodeDbService barcodeDbService) : IRequestHandler<UpdateBarcodeToOrderCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateBarcodeToOrderCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var orderDto = request.request;

                // Validate order exists
                var existingOrder = await orderDbService.GetById(orderDto.Id);
                if (existingOrder == null)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Đơn hàng với ID {orderDto.Id} không tồn tại");

                // Validate all order items have barcodes
                foreach (var item in orderDto.Items)
                {
                    // Validate barcode is required for all order items
                    if (item.Barcodes == null || !item.Barcodes.Any())
                        throw new CustomException(ExceptionErrorCode.ValidationFailed,
                            $"OrderItem với ProductDetailId {item.ProductDetailId} bắt buộc phải có barcode");

                    // Validate barcode count matches quantity
                    if (item.Barcodes.Count != item.Quantity)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed,
                            $"Số lượng mã vạch ({item.Barcodes.Count}) không khớp với số lượng sản phẩm ({item.Quantity}) của ProductDetailId {item.ProductDetailId}");

                    // Validate all barcodes in the item
                    await checkListBarCode(item.Barcodes, item.ProductDetailId);
                }

                // Update barcodes with OrderItemId
                await UpdateBarcodesWithOrderItemId(new List<OrderDto> { orderDto }, new List<Order> { existingOrder });

                return ResponseModel.SuccessResponse(existingOrder);
            }
            catch (CustomException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        private async Task UpdateBarcodesWithOrderItemId(List<OrderDto> orderDtos, List<Order> createdOrders)
        {
            foreach (var orderDto in orderDtos)
            {
                var createdOrder = createdOrders.FirstOrDefault(o => o.Id == orderDto.Id);
                if (createdOrder == null) continue;

                foreach (var itemDto in orderDto.Items)
                {
                    var orderItem = createdOrder.Items.FirstOrDefault(oi => oi.ProductDetailId == itemDto.ProductDetailId);
                    if (orderItem == null) continue;

                    // Cập nhật OrderItemId cho từng barcode
                    await barcodeDbService.UpdateOrderItemIdForBarcodesAsync(itemDto.Barcodes, orderItem.ID);
                }
            }
        }

        private async Task checkListBarCode(List<string> barcodes, int productDetailId)
        {
            if (barcodes.Count == 0)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Danh sách mã vạch rỗng");

            var seen = new HashSet<string>();

            foreach (var barcode in barcodes)
            {
                if (String.IsNullOrEmpty(barcode))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Mã vạch rỗng");
                else if (seen.Add(barcode)) // chỉ trả về true nếu chưa tồn tại
                {
                    await checkBarCode(barcode, productDetailId);
                }
                else
                {
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Mã vạch {barcode} Bị lặp");
                }
            }
        }

        private async Task checkBarCode(string barcode, int productDetailId)
        {
            var bar = await barcodeDbService.GetBarcodeByBarcodeValueAsync(barcode);
            if (bar == null)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Mã vạch {barcode} không tồn tại trong hệ thống");
            else if(productDetailId != bar.ProductDetailId)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Mã vạch {barcode} không thuộc về sản phẩm có ProductDetailId {productDetailId}");
        }
    }
}
