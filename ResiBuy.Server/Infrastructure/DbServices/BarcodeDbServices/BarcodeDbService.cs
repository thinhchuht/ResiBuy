

using System;

namespace ResiBuy.Server.Infrastructure.DbServices.BarcodeDbServices
{
    public class BarcodeDbService : BaseDbService<Barcode>, IBarcodeDbService
    {
        private readonly ResiBuyContext _context;
        private readonly Random _random;
        public BarcodeDbService(ResiBuyContext context) : base(context)
        {
            _context = context;
            _random = new Random();
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
        public async Task<List<string>> GenerateUniqueBarcodesAsync(int count)
        {
            if (count <= 0)
                return new List<string>();

            var generatedBarcodes = new HashSet<string>();
            var batchSize = Math.Max(count * 3, 200); // Tạo nhiều hơn để tránh collision
            var maxRetries = 10;
            var retryCount = 0;

            while (generatedBarcodes.Count < count && retryCount < maxRetries)
            {
                // Tạo batch barcodes mới
                var candidateBarcodes = new HashSet<string>();
                while (candidateBarcodes.Count < batchSize)
                {
                    var barcode = GenerateBarcode13();
                    candidateBarcodes.Add(barcode);
                }

                // Loại bỏ những barcode đã được tạo trước đó trong lần này
                candidateBarcodes.ExceptWith(generatedBarcodes);

                if (!candidateBarcodes.Any())
                {
                    retryCount++;
                    batchSize *= 2; // Tăng batch size nếu gặp quá nhiều collision
                    continue;
                }

                // Kiểm tra trong database một lần cho toàn bộ batch
                var existingBarcodes = await _context.Barcodes
                    .Where(b => candidateBarcodes.Contains(b.Code))
                    .Select(b => b.Code)
                    .ToListAsync();

                // Lấy những barcode chưa tồn tại trong DB
                var availableBarcodes = candidateBarcodes.Except(existingBarcodes).ToList();

                // Thêm vào kết quả cho đến khi đủ số lượng cần thiết
                foreach (var barcode in availableBarcodes)
                {
                    generatedBarcodes.Add(barcode);
                    if (generatedBarcodes.Count >= count)
                        break;
                }

                retryCount++;
            }

            if (generatedBarcodes.Count < count)
            {
                throw new InvalidOperationException($"Không thể tạo đủ {count} barcode duy nhất sau {maxRetries} lần thử. Chỉ tạo được {generatedBarcodes.Count} barcode.");
            }

            return generatedBarcodes.Take(count).ToList();
        }

        private string GenerateBarcode13()
        {
            var digits = new int[12];
            for (int i = 0; i < 12; i++)
            {
                digits[i] = _random.Next(0, 10);
            }

            int oddSum = 0;
            int evenSum = 0;

            for (int i = 0; i < 12; i++)
            {
                if (i % 2 == 0)
                {
                    oddSum += digits[i];
                }
                else
                {
                    evenSum += digits[i];
                }
            }

            int total = oddSum + (evenSum * 3);
            int checkDigit = (10 - (total % 10)) % 10;

            return string.Join("", digits) + checkDigit.ToString();
        }
    }
}
