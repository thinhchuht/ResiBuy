using System.Linq;
using OfficeOpenXml;
using ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Create;
using ResiBuy.Server.Infrastructure.DbServices.BarcodeDbServices;

namespace ResiBuy.Server.Infrastructure.DbServices.ProductDbServices
{
    public class ProductDbService : BaseDbService<Product>, IProductDbService
    {
        private readonly ResiBuyContext _context;
        private readonly IBarcodeDbService _barcodeService;
        private readonly IImageDbService imageDbService;
        public ProductDbService(ResiBuyContext context, BarcodeDbServices.IBarcodeDbService barcodeService, IImageDbService imageDbService) : base(context)
        {
            this._context = context;
            this._barcodeService = barcodeService;
            this.imageDbService = imageDbService;
        }

        public IQueryable<Product> GetAllProductsQuery()
        {
            try
            {
                return _context.Products
                    .Include(p => p.Store)
                    .Include(p => p.Promotion)
                    .Include(p => p.ProductDetails)
                        .ThenInclude(pd => pd.Image)
                    .Include(p => p.ProductDetails)
                        .ThenInclude(pd => pd.Reviews)
                    .Include(p => p.ProductDetails)
                        .ThenInclude(pd => pd.AdditionalData)
                    .AsQueryable();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }


        public async Task<Product> GetByIdAsync(int id)
        {
            try
            {
                var product = await _context.Products
                    .Include(p => p.Store)
                    .Include(p => p.Promotion)
                    .Include(p => p.Category)
                    .Include(p => p.ProductDetails)
                        .ThenInclude(pd => pd.Image)
                    .Include(p => p.ProductDetails)
                        .ThenInclude(pd => pd.AdditionalData)
                    .Include(p => p.ProductDetails)
                        .ThenInclude(pd => pd.Reviews)
                    .Include(p => p.ProductDetails)
                        .ThenInclude(pd => pd.Barcodes) // Thêm Include cho Barcodes
                    .Include(p => p.Category)
                    .FirstOrDefaultAsync(p => p.Id == id);

                return product;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<Product> GetByNameAsync(Guid storeId, string name)
        {
            try
            {
                var product = await _context.Products.Include(p => p.ProductDetails)
                                .ThenInclude(d => d.AdditionalData)
                                .FirstOrDefaultAsync(p => p.StoreId == storeId && p.Name.ToLower() == name.ToLower());
                return product;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<bool> ExistsByNameAsync(Guid storeId, string name, int excludeProductId)
        {
            return await _context.Products
                .AnyAsync(p => p.StoreId == storeId
                            && p.Name.ToLower() == name.ToLower()
                            && p.Id != excludeProductId);
        }

        public async Task<ImportResult> ImportProductsFromExcel(Stream fileStream)
        {
            var result = new ImportResult();
            ExcelPackage.License.SetNonCommercialPersonal("ResiBuy Developer");

            using var package = new ExcelPackage(fileStream);
            var worksheet = package.Workbook.Worksheets[0];
            int rowCount = worksheet.Dimension.Rows;

            // Gom dữ liệu Excel theo ProductName
            var groupedProducts = new Dictionary<string, List<ExcelRowData>>();

            for (int row = 2; row <= rowCount; row++)
            {
                try
                {
                    var productName = worksheet.Cells[row, 1].Text.Trim();
                    var describe = worksheet.Cells[row, 2].Text.Trim();
                    var promotionId = int.Parse(worksheet.Cells[row, 3].Text);
                    var storeId = Guid.Parse(worksheet.Cells[row, 4].Text);
                    var categoryId = Guid.Parse(worksheet.Cells[row, 5].Text);
                    var price = decimal.Parse(worksheet.Cells[row, 6].Text);
                    var weight = float.Parse(worksheet.Cells[row, 7].Text);
                    var quantity = int.Parse(worksheet.Cells[row, 8].Text);
                    var outOfStock = bool.Parse(worksheet.Cells[row, 9].Text);
                    var imageId = worksheet.Cells[row, 10].Text.Trim();
                    var additionalDataRaw = worksheet.Cells[row, 11].Text.Trim();

                    // Parse ExpiryDate an toàn
                    DateTime expiryDate;
                    if (!DateTime.TryParse(worksheet.Cells[row, 12].Text, out expiryDate))
                    {
                        expiryDate = DateTime.MinValue; // hoặc null nếu bạn dùng DateTime?
                    }

                    // WarrantyMonths
                    var warrantyMonths = string.IsNullOrEmpty(worksheet.Cells[row, 13].Text)
                                            ? 0
                                            : int.Parse(worksheet.Cells[row, 13].Text);

                    var additionalData = additionalDataRaw.Split(';', StringSplitOptions.RemoveEmptyEntries)
                        .Select(ad =>
                        {
                            var kv = ad.Split('=');
                            return new AdditionalData(kv[0].Trim(), kv[1].Trim());
                        }).ToList();

                    if (!groupedProducts.ContainsKey(productName))
                        groupedProducts[productName] = new List<ExcelRowData>();

                    var promotion = _context.Promotions.Find(promotionId);
                    if (promotion == null)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không có mã khuyễn mãi này");
                    if (!promotion.IsActive || promotion.StartDate > DateTime.Now || promotion.EndDate < DateTime.Now)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Khuyến mãi không hoạt động");

                    var category = _context.Categories.Find(categoryId);
                    if (category == null)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không có mã danh mục này");
                    if (!category.Status)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Danh mục không hoạt động");

                    var img = _context.Images.Find(imageId);
                    if (img == null)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không có mã ảnh này");
                    if (img.ProductDetailId != null)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Ảnh đã được sử dụng");

                    groupedProducts[productName].Add(new ExcelRowData
                    {
                        Describe = describe,
                        PromotionId = promotionId,
                        StoreId = storeId,
                        CategoryId = categoryId,
                        Price = price,
                        Weight = weight,
                        Quantity = quantity,
                        OutOfStock = outOfStock,
                        ImageId = imageId,
                        AdditionalData = additionalData,
                        ExpiryDate = expiryDate,
                        WarrantyMonths = warrantyMonths
                    });

                    result.Total++;
                }
                catch (Exception ex)
                {
                    result.Errors.Add($"Row {row}: {ex.Message}");
                }
            }

            foreach (var group in groupedProducts)
            {
                string productName = group.Key;
                var rows = group.Value;

                if (!rows.Any())
                {
                    result.Errors.Add($"Sản phẩm {productName} không có dữ liệu hợp lệ");
                    continue;
                }

                // Kiểm tra Product đã có chưa
                var product = await _context.Products
                    .Include(p => p.ProductDetails)
                        .ThenInclude(pd => pd.AdditionalData)
                    .Include(p => p.ProductDetails)
                        .ThenInclude(pd => pd.Image)
                    .Include(p => p.ProductDetails)
                        .ThenInclude(pd => pd.Barcodes)
                    .FirstOrDefaultAsync(p => p.Name == productName);

                if (product == null)
                {
                    var first = rows.First();
                    product = new Product(productName, first.Describe, first.PromotionId, first.StoreId, first.CategoryId);
                    _context.Products.Add(product);
                }

                // Gom tất cả AdditionalData để sinh tổ hợp
                var allKeys = rows.SelectMany(r => r.AdditionalData.Select(ad => ad.Key)).Distinct();
                var adDict = new Dictionary<string, HashSet<string>>();
                foreach (var key in allKeys)
                {
                    adDict[key] = new HashSet<string>(rows.SelectMany(r => r.AdditionalData.Where(ad => ad.Key == key).Select(ad => ad.Value)));
                }

                var combinations = GetAllCombinations(adDict);

                foreach (var row in rows)
                {
                    var detail = product.ProductDetails.FirstOrDefault(pd =>
                        pd.AdditionalData.Count == row.AdditionalData.Count &&
                        !pd.AdditionalData.Except(row.AdditionalData, new AdditionalDataComparer()).Any());

                    if (detail != null)
                    {
                        // cập nhật
                        detail.Price = row.Price;
                        detail.Weight = row.Weight;
                        detail.Quantity += row.Quantity;
                        detail.IsOutOfStock = row.OutOfStock;
                        product.ExpiryDate = row.ExpiryDate;
                        product.WarrantyMonths = row.WarrantyMonths;

                        // thêm barcode
                        for (int i = 0; i < row.Quantity; i++)
                        {
                            detail.Barcodes.Add(new Barcode
                            {
                                Code = Guid.NewGuid().ToString(),
                                ProductDetail = detail
                            });
                        }
                    }
                    else
                    {
                        // tạo mới
                        var newDetail = new ProductDetail(row.Price, row.Weight, row.Quantity)
                        {
                            Product = product,
                            Image = await imageDbService.GetImageByIdAsync(row.ImageId),
                            AdditionalData = row.AdditionalData,
                            Barcodes = new List<Barcode>()
                        };

                        for (int i = 0; i < row.Quantity; i++)
                        {
                            newDetail.Barcodes.Add(new Barcode
                            {
                                Code = Guid.NewGuid().ToString(),
                                ProductDetail = newDetail
                            });
                        }

                        product.ProductDetails.Add(newDetail);
                    }
                }

                // Tạo các combination thiếu (Quantity = 0, dùng ảnh sản phẩm)
                foreach (var combo in combinations)
                {
                    if (!product.ProductDetails.Any(pd =>
                        pd.AdditionalData.Count == combo.Count &&
                        !pd.AdditionalData.Except(combo, new AdditionalDataComparer()).Any()))
                    {
                        var placeholder = new ProductDetail(0, 0, 0, true)
                        {
                            Product = product,
                            Image = product.ProductDetails.FirstOrDefault()?.Image,
                            AdditionalData = combo,
                            Barcodes = new List<Barcode>()
                        };
                        product.ProductDetails.Add(placeholder);
                    }
                }

                result.Successful++;
            }

            await _context.SaveChangesAsync();
            result.Success = result.Errors.Count == 0;
            return result;
        }


        /// Sinh tất cả tổ hợp AdditionalData
        private List<List<AdditionalData>> GetAllCombinations(Dictionary<string, HashSet<string>> adDict)
        {
            var keys = adDict.Keys.ToList();
            var result = new List<List<AdditionalData>>();

            void Recurse(int depth, List<AdditionalData> current)
            {
                if (depth == keys.Count)
                {
                    result.Add(new List<AdditionalData>(current));
                    return;
                }
                foreach (var val in adDict[keys[depth]])
                {
                    current.Add(new AdditionalData(keys[depth], val));
                    Recurse(depth + 1, current);
                    current.RemoveAt(current.Count - 1);
                }
            }

            Recurse(0, new List<AdditionalData>());
            return result;
        }

        public async Task<List<string>> QueryBarcodesAsync(List<string> codes)
        {
            return await _context.Barcodes
                .Where(b => codes.Contains(b.Code))
                .Select(b => b.Code)
                .ToListAsync();
        }

        public async Task<ProductDetail?> GetProductDetailByBarcodeAsync(string barcode)
        {
            try
            {
                var productDetail = await _context.ProductDetails
                    .Include(pd => pd.Product)
                    .Include(pd => pd.Image)
                    .Include(pd => pd.AdditionalData)
                    .Include(pd => pd.Barcodes)
                        .ThenInclude(b => b.OrderItem)
                    .FirstOrDefaultAsync(pd => pd.Barcodes.Any(b => b.Code == barcode));

                return productDetail;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError,
                    $"Lỗi khi tìm kiếm ProductDetail theo barcode: {ex.Message}");
            }
        }
    }
}
