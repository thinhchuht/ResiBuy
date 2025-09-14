
using System.Linq;
using OfficeOpenXml;
using ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Create;

namespace ResiBuy.Server.Infrastructure.DbServices.ProductDbServices
{
    public class ProductDbService : BaseDbService<Product>, IProductDbService
    {
        private readonly ResiBuyContext _context;
        public ProductDbService(ResiBuyContext context) : base(context)
        {
            this._context = context;
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
                    .Include(p => p.ProductDetails)
                        .ThenInclude(pd => pd.Image)
                    .Include(p => p.ProductDetails)
                        .ThenInclude(pd => pd.AdditionalData)
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
            ExcelPackage.License.SetNonCommercialPersonal("ResiBuy Developer");

            using var package = new ExcelPackage(fileStream);
            var sheet = package.Workbook.Worksheets[0];

            var products = new Dictionary<string, CreateProductDto>();
            var result = new ImportResult();
            var detailDataSetsByProduct = new Dictionary<string, List<HashSet<string>>>();
            var validRows = new List<int>(); // Danh sách các dòng hợp lệ

            // Validate storeId và categoryId có tồn tại không
            // storeId
            var storeIdsInFile = new HashSet<Guid>();
            for (int row = 2; row <= sheet.Dimension.End.Row; row++)
            {
                if (Guid.TryParse(sheet.Cells[row, 4].Text, out Guid storeId))
                {
                    storeIdsInFile.Add(storeId);
                }
            }

            var existingStoreIds = await _context.Stores
                .Where(s => storeIdsInFile.Contains(s.Id))
                .Select(s => s.Id)
                .ToListAsync();

            var invalidStoreIds = storeIdsInFile.Except(existingStoreIds).ToHashSet();

            // Validate categoryId
            var categoryIdsInFile = new HashSet<Guid>();
            for (int row = 2; row <= sheet.Dimension.End.Row; row++)
            {
                if (Guid.TryParse(sheet.Cells[row, 5].Text, out Guid categoryId))
                {
                    categoryIdsInFile.Add(categoryId);
                }
            }

            var existingCategoryIds = await _context.Categories
                .Where(c => categoryIdsInFile.Contains(c.Id))
                .Select(c => c.Id)
                .ToListAsync();

            var invalidCategoryIds = categoryIdsInFile.Except(existingCategoryIds).ToHashSet();

            //promotionId
            var promotionIdsInFile = new HashSet<int>();
            for (int row = 2; row <= sheet.Dimension.End.Row; row++)
            {
                if (int.TryParse(sheet.Cells[row, 3].Text, out int promotionId))
                {
                    promotionIdsInFile.Add(promotionId);
                }
            }

            var existingPromotionIds = await _context.Promotions
                .Where(p => promotionIdsInFile.Contains(p.Id))
                .Select(p => p.Id)
                .ToListAsync();

            var invalidPromotionIds = promotionIdsInFile.Except(existingPromotionIds).ToHashSet();

            // Duyệt từng dòng trong file excel để validate
            for (int row = 2; row <= sheet.Dimension.End.Row; row++)
            {
                result.Total++;
                bool rowIsValid = true;

                try
                {
                    string name = sheet.Cells[row, 1].Text?.Trim();
                    if (string.IsNullOrEmpty(name))
                    {
                        result.Errors.Add($"Lỗi tại dòng {row}: Tên sản phẩm không được để trống");
                        rowIsValid = false;
                    }

                    string describe = sheet.Cells[row, 2].Text;

                    if (!int.TryParse(sheet.Cells[row, 3].Text, out int promotionId))
                    {
                        result.Errors.Add($"Lỗi tại dòng {row}: Discount không hợp lệ");
                        rowIsValid = false;
                    }
                    else if (invalidPromotionIds.Contains(promotionId))
                    {
                        result.Errors.Add($"Lỗi tại dòng {row}: PromotionId không tồn tại trong hệ thống");
                        rowIsValid = false;
                    }

                    if (!Guid.TryParse(sheet.Cells[row, 4].Text, out Guid storeId))
                    {
                        result.Errors.Add($"Lỗi tại dòng {row}: StoreId không hợp lệ");
                        rowIsValid = false;
                    }
                    else if (invalidStoreIds.Contains(storeId))
                    {
                        result.Errors.Add($"Lỗi tại dòng {row}: StoreId không tồn tại trong hệ thống");
                        rowIsValid = false;
                    }

                    if (!Guid.TryParse(sheet.Cells[row, 5].Text, out Guid categoryId))
                    {
                        result.Errors.Add($"Lỗi tại dòng {row}: CategoryId không hợp lệ");
                        rowIsValid = false;
                    }
                    else if (invalidCategoryIds.Contains(categoryId))
                    {
                        result.Errors.Add($"Lỗi tại dòng {row}: CategoryId không tồn tại trong hệ thống");
                        rowIsValid = false;
                    }

                    if (!decimal.TryParse(sheet.Cells[row, 6].Text, out decimal price) || price <= 0)
                    {
                        result.Errors.Add($"Lỗi tại dòng {row}: Price không hợp lệ");
                        rowIsValid = false;
                    }

                    if (!float.TryParse(sheet.Cells[row, 7].Text, out float weight))
                    {
                        result.Errors.Add($"Lỗi tại dòng {row}: Weight không hợp lệ");
                        rowIsValid = false;
                    }

                    if (!int.TryParse(sheet.Cells[row, 8].Text, out int quantity))
                    {
                        result.Errors.Add($"Lỗi tại dòng {row}: Quantity không hợp lệ");
                        rowIsValid = false;
                    }

                    if (!bool.TryParse(sheet.Cells[row, 9].Text, out bool isOutOfStock))
                    {
                        result.Errors.Add($"Lỗi tại dòng {row}: IsOutOfStock không hợp lệ");
                        rowIsValid = false;
                    }

                    // ExpiryDate
                    DateTime? expiryDate = null;
                    var expiryStr = sheet.Cells[row, 16].Text?.Trim();
                    if (!string.IsNullOrEmpty(expiryStr))
                    {
                        if (DateTime.TryParse(expiryStr, out var exp))
                        {
                            if (exp <= DateTime.Now)
                            {
                                result.Errors.Add($"Lỗi tại dòng {row}: ExpiryDate phải sau ngày hiện tại");
                                rowIsValid = false;
                            }
                            else
                            {
                                expiryDate = exp;
                            }
                        }
                        else
                        {
                            result.Errors.Add($"Lỗi tại dòng {row}: ExpiryDate không hợp lệ");
                            rowIsValid = false;
                        }
                    }

                    // WarrantyMonths
                    int? warrantyMonths = null;
                    var warrantyStr = sheet.Cells[row, 17].Text?.Trim();
                    if (!string.IsNullOrEmpty(warrantyStr))
                    {
                        if (int.TryParse(warrantyStr, out var wm) && wm > 0)
                            warrantyMonths = wm;
                        else
                        {
                            result.Errors.Add($"Lỗi tại dòng {row}: WarrantyMonths không hợp lệ (phải là số nguyên > 0)");
                            rowIsValid = false;
                        }
                    }

                    // Đọc cột image từ excel
                    var image = new CreateImageForProductDetailDto
                    {
                        Id = sheet.Cells[row, 10].Text,
                        Url = sheet.Cells[row, 11].Text,
                        ThumbUrl = sheet.Cells[row, 12].Text,
                        Name = sheet.Cells[row, 13].Text
                    };

                    // Đọc cột barcode và tách thành list
                    var barcodeStr = sheet.Cells[row, 15].Text;
                    var barcodes = !string.IsNullOrEmpty(barcodeStr)
                        ? barcodeStr.Split(';').Select(b => b.Trim()).Where(b => !string.IsNullOrEmpty(b)).ToList()
                        : new List<string>();

                    if (barcodes.Count != quantity)
                    {
                        result.Errors.Add($"Lỗi tại dòng {row}: Số lượng Barcode ({barcodes.Count}) không khớp với Quantity ({quantity})");
                        rowIsValid = false;
                    }

                    var duplicateInRow = barcodes.GroupBy(b => b).Where(g => g.Count() > 1).Select(g => g.Key).ToList();
                    if (duplicateInRow.Any())
                    {
                        result.Errors.Add($"Lỗi tại dòng {row}: Barcode bị trùng trong cùng dòng ({string.Join(", ", duplicateInRow)})");
                        rowIsValid = false;
                    }

                    // Kiểm tra barcode đã tồn tại trong hệ thống
                    if (barcodes.Any())
                    {
                        var existedBarcodes = await QueryBarcodesAsync(barcodes);
                        if (existedBarcodes.Any())
                        {
                            result.Errors.Add($"Lỗi tại dòng {row}: Barcode đã tồn tại trong hệ thống ({string.Join(", ", existedBarcodes)})");
                            rowIsValid = false;
                        }
                    }

                    // Đọc và tách cột AdditionalData
                    var additionalData = new List<AdditionalDataDto>();
                    var additionalStr = sheet.Cells[row, 14].Text;
                    if (!string.IsNullOrEmpty(additionalStr))
                    {
                        foreach (var pair in additionalStr.Split(';'))
                        {
                            var kv = pair.Split('=');
                            if (kv.Length == 2)
                            {
                                additionalData.Add(new AdditionalDataDto
                                {
                                    Key = kv[0].Trim(),
                                    Value = kv[1].Trim()
                                });
                            }
                        }
                    }

                    // Validate: không có cặp trùng trong 1 detail
                    var duplicatesInSame = additionalData
                        .GroupBy(a => $"{a.Key}|{a.Value}")
                        .Where(g => g.Count() > 1)
                        .Select(g => g.Key)
                        .ToList();

                    if (duplicatesInSame.Any())
                    {
                        result.Errors.Add($"Lỗi tại dòng {row}: AdditionalData trùng trong cùng ProductDetail ({string.Join(", ", duplicatesInSame)})");
                        rowIsValid = false;
                    }

                    // Nếu dòng này hợp lệ, tiếp tục xử lý logic group và validate duplicate
                    if (rowIsValid && !string.IsNullOrEmpty(name))
                    {
                        // Gom nhóm theo Product
                        if (!products.ContainsKey(name))
                        {
                            products[name] = new CreateProductDto
                            {
                                Name = name,
                                Describe = describe,
                                PromotionId = promotionId,
                                StoreId = storeId,
                                CategoryId = categoryId,
                                ExpiryDate = expiryDate,
                                WarrantyMonths = warrantyMonths,
                                ProductDetails = new List<CreateProductDetailDto>()
                            };
                            detailDataSetsByProduct[name] = new List<HashSet<string>>();
                        }

                        // Validate: không có 2 ProductDetail trùng bộ AdditionalData
                        var dataSet = additionalData.Select(a => $"{a.Key}|{a.Value}").ToHashSet();
                        if (detailDataSetsByProduct[name].Any(existing => existing.SetEquals(dataSet)))
                        {
                            result.Errors.Add($"Lỗi tại dòng {row}: AdditionalData bị trùng với 1 ProductDetail khác của {name}");
                            rowIsValid = false;
                        }
                        else
                        {
                            detailDataSetsByProduct[name].Add(dataSet);

                            products[name].ProductDetails.Add(new CreateProductDetailDto
                            {
                                Price = price,
                                Weight = weight,
                                Quantity = quantity,
                                IsOutOfStock = isOutOfStock,
                                Image = image,
                                AdditionalData = additionalData,
                                Barcodes = barcodes // Thêm barcodes vào DTO
                            });
                        }
                    }

                    if (rowIsValid)
                    {
                        validRows.Add(row);
                    }
                }
                catch (Exception ex)
                {
                    result.Errors.Add($"Lỗi tại dòng {row}: {ex.Message}");
                    rowIsValid = false;
                }
            }

            // Kiểm tra nếu có lỗi thì trả về kết quả với Success = false
            if (result.Errors.Any())
            {
                result.Success = false;
                return result;
            }

            // Nếu không có lỗi, tiến hành lưu xuống DB
            try
            {
                foreach (var product in products.Values)
                {
                    var existingProduct = await this.GetByNameAsync(product.StoreId, product.Name);
                    if (existingProduct == null)
                    {
                        // Tạo mới product
                        await this.CreateAsync(new Product(
                            product.Name, product.Describe, product.PromotionId, product.StoreId, product.CategoryId
                        )
                        {
                            ExpiryDate = product.ExpiryDate,
                            WarrantyMonths = product.WarrantyMonths,
                            ProductDetails = product.ProductDetails.Select(d => new ProductDetail(d.Price, d.Weight, d.Quantity, d.IsOutOfStock)
                            {
                                Image = d.Image != null ? new Image
                                {
                                    Id = d.Image.Id,
                                    Url = d.Image.Url,
                                    ThumbUrl = d.Image.ThumbUrl,
                                    Name = d.Image.Name
                                } : null,
                                AdditionalData = d.AdditionalData.Select(a => new AdditionalData(a.Key, a.Value)).ToList(),
                                Barcodes = d.Barcodes?.Select(b => new Barcode { Code = b }).ToList() ?? new List<Barcode>()
                            }).ToList()
                        });
                    }
                    else
                    {
                        // Thêm productDetail mới hoặc cập nhật số lượng
                        foreach (var detailDto in product.ProductDetails)
                        {
                            var newDataSet = detailDto.AdditionalData.Select(a => $"{a.Key}|{a.Value}").ToHashSet();

                            var existingDetail = existingProduct.ProductDetails
                                .FirstOrDefault(ed => ed.AdditionalData
                                    .Select(a => $"{a.Key}|{a.Value}")
                                    .ToHashSet()
                                    .SetEquals(newDataSet));

                            if (existingDetail != null)
                            {
                                // Nếu đã có detail này → cộng số lượng và thêm barcodes mới
                                existingDetail.Quantity += detailDto.Quantity;
                                existingDetail.IsOutOfStock = existingDetail.Quantity <= 0;

                                // Thêm barcodes mới (nếu có)
                                if (detailDto.Barcodes != null && detailDto.Barcodes.Any())
                                {
                                    var newBarcodes = detailDto.Barcodes.Select(b => new Barcode { Code = b }).ToList();
                                    existingDetail.Barcodes.AddRange(newBarcodes);
                                }
                            }
                            else
                            {
                                // Nếu chưa có → thêm detail mới
                                var newDetail = new ProductDetail(detailDto.Price, detailDto.Weight, detailDto.Quantity, detailDto.IsOutOfStock)
                                {
                                    Image = detailDto.Image != null ? new Image
                                    {
                                        Id = detailDto.Image.Id,
                                        Url = detailDto.Image.Url,
                                        ThumbUrl = detailDto.Image.ThumbUrl,
                                        Name = detailDto.Image.Name
                                    } : null,
                                    AdditionalData = detailDto.AdditionalData.Select(a => new AdditionalData(a.Key, a.Value)).ToList(),
                                    Barcodes = detailDto.Barcodes?.Select(b => new Barcode { Code = b }).ToList() ?? new List<Barcode>()
                                };
                                existingProduct.ProductDetails.Add(newDetail);
                            }
                        }

                        await this.UpdateAsync(existingProduct);
                    }
                }

                result.Success = true;
                result.Successful = validRows.Count;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Errors.Add($"Lỗi khi lưu vào database: {ex.Message}");
            }

            return result;
        }

        public async Task<List<string>> QueryBarcodesAsync(List<string> codes)
        {
            return await _context.Barcodes
                .Where(b => codes.Contains(b.Code))
                .Select(b => b.Code)
                .ToListAsync();
        }
    }
}
