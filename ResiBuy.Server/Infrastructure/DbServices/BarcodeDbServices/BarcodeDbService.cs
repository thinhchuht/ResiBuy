

namespace ResiBuy.Server.Infrastructure.DbServices.BarcodeDbServices
{
    public class BarcodeDbService : BaseDbService<Barcode>, IBarcodeDbService
    {
        private readonly ResiBuyContext _context;
        public BarcodeDbService(ResiBuyContext context) : base(context)
        {
            _context = context;
        }

        public Task<Barcode> GetBarcodeByBarcodeValueAsync(string barcodeValue)
        {
            return _context.Barcodes.Include(b=>b.OrderItem).Include(b => b.ProductDetail).FirstOrDefaultAsync(b => b.Code == barcodeValue);
        }

        public async Task UpdateOrderItemIdForBarcodesAsync(List<string> barcodeCodes, Guid orderItemId)
        {
            var barcodes = await _context.Barcodes
                .Where(b => barcodeCodes.Contains(b.Code))
                .ToListAsync();

            foreach (var barcode in barcodes)
            {
                barcode.OrderItemId = orderItemId;
            }

            await _context.SaveChangesAsync();
        }
    }
}
