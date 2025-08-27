using ResiBuy.Server.Infrastructure.Model.DTOs.OrderDtos;
using ResiBuy.Server.Infrastructure.Model.DTOs.StoreDtos;

namespace ResiBuy.Server.Infrastructure.DbServices.StoreDbServices
{
    public class StoreDbService : BaseDbService<Store>, IStoreDbService
    {
        private readonly ResiBuyContext _context;

        public StoreDbService(ResiBuyContext context) : base(context)
        {
            _context = context;
        }

        public async Task<PagedResult<Store>> GetAllStoresAsync(int pageNumber = 1, int pageSize = 5)
        {
            try
            {
                var query = _context.Stores.AsQueryable();

                var totalCount = await query.CountAsync();
                var items = await query
                    .OrderBy(s => s.Id)
                    .Include(s => s.Room)
                    .ThenInclude(r => r.Building)
                    .ThenInclude(b => b.Area)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
                return new PagedResult<Store>
                {
                    Items = items,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<Store> GetStoreByIdAsync(Guid id)
        {
            try
            {
                var store = await _context.Stores.Include(s => s.Room)
                        .ThenInclude(r => r.Building)
                        .ThenInclude(b => b.Area)
                        .Include(s => s.Owner)
                    .FirstOrDefaultAsync(s => s.Id == id);
                return store;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<PagedResult<Store>> GetStoreByOwnerIdAsync(string ownerId, int pageNumber = 1, int pageSize = 5)
        {
            try
            {
                var query = _context.Stores
                    .Where(s => s.OwnerId == ownerId)
                    .Include(s => s.Room)
                        .ThenInclude(r => r.Building)
                        .ThenInclude(b => b.Area);

                var totalCount = await query.CountAsync();

                var items = await query
                    .OrderBy(s => s.Id)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return new PagedResult<Store>
                {
                    Items = items,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<Store> UpdateStoreStatusAsync(Guid storeId, bool? isLocked, bool isOpen)
        {
            try
            {
                var store = await _context.Stores.FindAsync(storeId);
                if (store == null)
                    throw new CustomException(ExceptionErrorCode.NotFound, "Cửa hàng không tồn tại");
                if(isLocked.HasValue)
                {
                    if(!isLocked.Value && store.ReportCount == 3) store.ReportCount = 0;
                    store.IsLocked = isLocked.Value;
                }
                store.IsOpen = isOpen;
                await _context.SaveChangesAsync();
                return store;
            }
            catch (CustomException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.UpdateFailed, ex.Message);
            }
        }

        public async Task<bool> CheckRoomIsAvailable(Guid roomId)
        {
            try
            {
                return await _context.Stores
                    .AnyAsync(s => s.RoomId == roomId && !s.IsLocked);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<bool> CheckStoreIsAvailable(string name)
        {
            try
            {
                return await _context.Stores
                    .AnyAsync(s => s.Name == name);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<bool> CheckStorePhoneIsAvailable(string phone)
        {
            try
            {
                return await _context.Stores
                    .AnyAsync(s => s.PhoneNumber == phone);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<int> CountAllStoresAsync()
        {
            try
            {
                return await _context.Stores.CountAsync();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<int> CountStoresByIsOpenAsync(bool isOpen)
        {
            try
            {
                return await _context.Stores.CountAsync(s => s.IsOpen == isOpen);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<int> CountStoresByIsLockedAsync(bool isLocked)
        {
            try
            {
                return await _context.Stores.CountAsync(s => s.IsLocked == isLocked);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<StatisticalStoreDto> StatisticalStore(Guid storeid)
        {
            try
            {
                var statistical = new StatisticalStoreDto();
                var store = await _context.Stores.Include(s => s.Products).Include(s => s.Vouchers).FirstOrDefaultAsync(s => s.Id == storeid);
                if (store == null)
                {
                    throw new CustomException(ExceptionErrorCode.NotFound);
                }
                statistical.ProductQuantity = store.Products.Count();
                statistical.OutOfStockProductQuantity = store.Products.Where(p => p.IsOutOfStock == true).Count();
                statistical.VoucherQuantity = store.Vouchers.Count();
                statistical.ReportCount = store.ReportCount;
                return statistical;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<SalesAnalysisDto> SalesAnalysis(Guid storeId, DateTime startDate, DateTime endDate)
        {
            var salesAnalysis = new SalesAnalysisDto();
            var store = await _context.Stores.Include(s => s.Products).Include(s => s.Vouchers).Include(s => s.Orders).ThenInclude(o => o.Items).FirstOrDefaultAsync(s => s.Id == storeId);
            var orderSuccess = store.Orders.Where(o => o.Status == OrderStatus.Delivered && o.CreateAt >= startDate && o.CreateAt <= endDate.AddDays(1));
            var orderCanceled = store.Orders.Where(o => o.Status == OrderStatus.Cancelled && o.CreateAt >= startDate && o.CreateAt <= endDate.AddDays(1));
            decimal sales = 0;
            int productQuantity = 0;
            foreach (var order in orderSuccess)
            {
                foreach (var item in order.Items)
                {
                    productQuantity += item.Quantity;
                }
                sales += order.TotalPrice - (order.ShippingFee ?? 0m); ;
            }
            salesAnalysis.NumberOfProductsSold = productQuantity;
            salesAnalysis.SuccessedOrderQuantity = orderSuccess.Count();
            salesAnalysis.Sales = sales;
            salesAnalysis.CancelledOrderQuantity = orderCanceled.Count();
            return salesAnalysis;
        }

        public async Task<Dictionary<int, ProductAndSale>> TopSaleProduct(Guid storeId, DateTime startDate, DateTime endDate)
        {
            var store = await _context.Stores.Include(s => s.Orders).ThenInclude(o => o.Items).ThenInclude(i => i.ProductDetail).ThenInclude(p => p.Product)
                .ThenInclude(p => p.ProductDetails).ThenInclude(pd => pd.Image).FirstOrDefaultAsync(s => s.Id == storeId);
            Dictionary<int, ProductAndSale> productAndSales = new Dictionary<int, ProductAndSale>();
            var successedOrder = store.Orders.Where(o => o.Status == OrderStatus.Delivered && o.UpdateAt >= startDate && o.UpdateAt <= endDate.AddDays(1));
            foreach (var order in successedOrder)
            {
                foreach (var item in order.Items)
                {
                    var product = item.ProductDetail.Product;
                    if (productAndSales.ContainsKey(product.Id))
                    {
                        productAndSales[product.Id].Sale += item.Quantity;
                    }
                    else
                    {
                        productAndSales[product.Id] = new ProductAndSale
                        {
                            Product = new ProductDto(product),
                            Sale = item.Quantity
                        };
                    }
                }
            }

            var top10ProductAndSales = productAndSales.OrderByDescending(pair => pair.Value.Sale).Take(10).ToDictionary(pair => pair.Key, pair => pair.Value);
            return top10ProductAndSales;
        }

        public async Task<List<ProductDetailAndSale>> TopSaleDetail(int productId)
        {
            var product = await _context.Products
                .Include(p => p.ProductDetails)
                .ThenInclude(pd => pd.OrderItems)
                .FirstOrDefaultAsync(p => p.Id == productId);
            var productDetailSales = new List<ProductDetailAndSale>();
            int orderCount = 0;
            decimal totalSale = 0;
            int saleCount = 0;
            foreach (var detail in product.ProductDetails)
            {
                saleCount = detail.OrderItems.Sum(oi => oi.Quantity);
                if (saleCount > 0)
                {
                    orderCount++;
                    totalSale += saleCount * detail.Price;
                }
                orderCount = detail.OrderItems.Count();
                var productDetailDto = new ProductDetailDto(detail.Id, detail.IsOutOfStock, detail.ProductId, detail.Sold, detail.Price, detail.Weight, detail.Image, detail.Quantity, detail.AdditionalData, detail.Reviews);
                productDetailSales.Add(new ProductDetailAndSale(productDetailDto, orderCount, totalSale, saleCount));
            }
            return productDetailSales;
        }

        public async Task<List<Dictionary<string, decimal>>> GetChartData(Guid storeId, DateTime startDate, DateTime endDate)
        {
            var result = new List<Dictionary<string, decimal>>();

            startDate = startDate.Date;
            endDate = endDate.Date;

            int totalDays = (endDate - startDate).Days + 1;

            if (totalDays <= 30)
            {
                var orders = await _context.Orders
                    .Where(o => o.StoreId == storeId
                        && o.Status == OrderStatus.Delivered
                        && o.UpdateAt >= startDate
                        && o.UpdateAt < endDate.AddDays(1))
                    .ToListAsync();

                for (var date = startDate; date <= endDate; date = date.AddDays(1))
                {
                    var orderInDay = orders.Where(o => o.UpdateAt.Date == date).ToList();
                    decimal totalRevenue = orderInDay.Sum(o => o.TotalPrice - o.ShippingFee ?? 0m);
                    result.Add(new Dictionary<string, decimal>
            {
                { date.ToString("dd-MM"), totalRevenue }
            });
                }
            }
            else
            {
                // Chỉ tính từ tháng đầu tiên của năm hiện tại
                DateTime firstMonthOfCurrentYear = new DateTime(DateTime.Now.Year, 1, 1);

                // Nếu startDate nhỏ hơn mốc đầu năm thì nâng lên thành đầu năm
                if (startDate < firstMonthOfCurrentYear)
                    startDate = firstMonthOfCurrentYear;

                DateTime currentMonth = new DateTime(startDate.Year, startDate.Month, 1);
                DateTime endMonth = new DateTime(endDate.Year, endDate.Month, 1);

                while (currentMonth <= endMonth)
                {
                    var nextMonth = currentMonth.AddMonths(1);
                    var ordersInMonth = await _context.Orders
                        .Where(o => o.StoreId == storeId
                            && o.Status == OrderStatus.Delivered
                            && o.UpdateAt >= currentMonth
                            && o.UpdateAt < nextMonth)
                        .ToListAsync();

                    decimal totalRevenue = ordersInMonth.Sum(o => o.TotalPrice - o.ShippingFee ?? 0m);

                    result.Add(new Dictionary<string, decimal> { { currentMonth.ToString("MM-yyyy"), totalRevenue } });

                    currentMonth = nextMonth;
                }
            }


            return result;
        }
        public async Task<PagedResult<Store>> SearchStoresAsync(
            string keyword,
            bool? isOpen,
            bool? isLocked,
            bool? isPayFee,
            int pageNumber = 1,
            int pageSize = 5)
        {
            try
            {
                var query = _context.Stores
                    .Include(s => s.Room)
                        .ThenInclude(r => r.Building)
                        .ThenInclude(b => b.Area)
                    .AsQueryable();

                // Search theo tên
                if (!string.IsNullOrWhiteSpace(keyword))
                {
                    query = query.Where(s => s.Name.Contains(keyword));
                }

                // Filter theo trạng thái mở cửa
                if (isOpen.HasValue)
                {
                    query = query.Where(s => s.IsOpen == isOpen.Value);
                }

                // Filter theo trạng thái khóa
                if (isLocked.HasValue)
                {
                    query = query.Where(s => s.IsLocked == isLocked.Value);
                }

                // Filter theo trạng thái đóng phí
                if (isPayFee.HasValue)
                {
                    query = query.Where(s => s.IsPayFee == isPayFee.Value);
                }

                var totalCount = await query.CountAsync();

                var items = await query
                    .OrderBy(s => s.Id)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return new PagedResult<Store>
                {
                    Items = items,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }

        }
        public async Task<bool> CheckStorePhoneIsAvailable(string phone, string ownerId)
        {
            try
            {
                return await _context.Stores
                    .AnyAsync(s => s.PhoneNumber == phone && s.OwnerId != ownerId);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<bool> CheckStorePhoneWithIdAsync(string phone, Guid excludeId, string ownerId)
        {
            try
            {
                return await _context.Stores
                    .AnyAsync(s => s.PhoneNumber == phone && s.Id != excludeId && s.OwnerId != ownerId);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<bool> CheckStoreNameWithIdAsync(string name, Guid excludeId)
        {
            try
            {
                return await _context.Stores
                    .AnyAsync(s => s.Name == name && s.Id != excludeId);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

    }
}