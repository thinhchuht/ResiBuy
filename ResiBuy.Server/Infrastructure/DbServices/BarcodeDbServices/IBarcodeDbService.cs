namespace ResiBuy.Server.Infrastructure.DbServices.BarcodeDbServices
{
    public interface IBarcodeDbService : IBaseDbService<Barcode>
    {
        Task<Barcode> GetBarcodeByBarcodeValueAsync(string barcodeValue);

        Task UpdateOrderItemIdForBarcodesAsync(List<string> barcodeCodes, Guid orderItemId);
        Task<List<string>> GenerateUniqueBarcodesAsync(int count);
        Task<ResponseModel> RemoveBarcode(List<string> barcodes);
    }
}
