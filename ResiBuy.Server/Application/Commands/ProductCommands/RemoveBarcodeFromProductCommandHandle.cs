using ResiBuy.Server.Infrastructure.DbServices.BarcodeDbServices;

namespace ResiBuy.Server.Application.Commands.ProductCommands
{
    public record RemoveBarcodeFromProductCommand(List<string> request) : IRequest<ResponseModel>;
    public class RemoveBarcodeFromProductCommandHandle(IBarcodeDbService barcodeDbService) : IRequestHandler<RemoveBarcodeFromProductCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(RemoveBarcodeFromProductCommand command, CancellationToken cancellationToken)
        {
            if (command.request == null || command.request.Count == 0)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Danh sách barcode trống");
            var removedBarcodes = await barcodeDbService.RemoveBarcode(command.request);
            return ResponseModel.SuccessResponse(removedBarcodes);
        }
    }
}
