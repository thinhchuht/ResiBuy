using Microsoft.EntityFrameworkCore.Storage;
using ResiBuy.Server.Application.Commands.OrderCommands.Dtos;
using ResiBuy.Server.Infrastructure.DbServices.BarcodeDbServices;
using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;
using ResiBuy.Server.Infrastructure.DbServices.ProductDetailDbServices;

namespace ResiBuy.Server.Application.Commands.OrderCommands
{
    public record RemoveBarcodeFromOrderCommand(RemoveBarcodeFromOrderDto dto) : IRequest<ResponseModel>;

    public class RemoveBarcodeFromOrderCommandHandler(
        IBarcodeDbService barcodeDbService,
        ResiBuyContext dbContext
        ) : IRequestHandler<RemoveBarcodeFromOrderCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(RemoveBarcodeFromOrderCommand request, CancellationToken cancellationToken)
        {
            if (String.IsNullOrEmpty(request.dto.BarcodeToRemove))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Barcode trống");

            // Lấy thông tin barcode
            var barcode = await barcodeDbService.GetBarcodeByBarcodeValueAsync(request.dto.BarcodeToRemove);
            if (barcode == null)
                throw new CustomException(ExceptionErrorCode.NotFound, $"Không tìm thấy mã vạch: {request.dto.BarcodeToRemove}");
            else if (barcode.OrderItemId == null)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Mã vạch {request.dto.BarcodeToRemove} không có trong order nào");
            else if (barcode.OrderItem.Order.Status != OrderStatus.Delivered)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Mã vạch {request.dto.BarcodeToRemove} chỉ có thể xóa khỏi đơn hàng đã giao");

            barcode.OrderItem.Quantity -= 1;
            barcode.OrderItem.Order.IsReport = true;
            barcode.OrderItemId = null;
            if (request.dto.IsRemoveFromStore)
                dbContext.Barcodes.Remove(barcode);
            else
                barcode.ProductDetail.Quantity += 1;

            try
            {
                await dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.UpdateFailed, ex.Message);
            }
            return ResponseModel.SuccessResponse($"Đã xóa {barcode.Code} mã vạch khỏi order .Giá trị sản phẩm: {barcode.OrderItem.Price}");
        }
    }
}

