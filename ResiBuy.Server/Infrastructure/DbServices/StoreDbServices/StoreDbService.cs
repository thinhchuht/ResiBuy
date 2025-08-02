using ResiBuy.Server.Infrastructure.Model;
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

        public async Task<Store> UpdateStoreStatusAsync(Guid storeId, bool isLocked, bool isOpen)
        {
            try
            {
                var store = await _context.Stores.FindAsync(storeId);
                if (store == null)
                    throw new CustomException(ExceptionErrorCode.NotFound, "Cửa hàng không tồn tại");

                store.IsLocked = isLocked;
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
                    .AnyAsync(s => s.RoomId == roomId);
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
                var store = await _context.Stores.Include(s=>s.Products).Include(s => s.Vouchers).FirstOrDefaultAsync(s => s.Id == storeid);
                if(store == null)
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
            var orderSuccess = store.Orders.Where(o => o.Status == OrderStatus.Delivered && o.CreateAt >= startDate && o.CreateAt <= endDate);
            var orderCanceled = store.Orders.Where(o => o.Status == OrderStatus.Cancelled && o.CreateAt >= startDate && o.CreateAt <= endDate);
            decimal sales = 0;
            int productQuantity = 0;
            foreach (var order in orderSuccess)
            {
                foreach (var item in order.Items)
                {
                    productQuantity += item.Quantity;
                    sales += item.Quantity * item.ProductDetail.Price;
                }
            }
            salesAnalysis.NumberOfProductsSold = productQuantity;
            salesAnalysis.SuccessedOrderQuantity = orderSuccess.Count();
            salesAnalysis.Sales = sales;
            salesAnalysis.CancelledOrderQuantity = orderCanceled.Count();
            return salesAnalysis;
        }

        public async Task<Dictionary<int, ProductAndSale>> TopSaleProduct(Guid storeId, DateTime startDate, DateTime endDate)
        {
            var store = await _context.Stores.Include(s => s.Orders).ThenInclude(o => o.Items).ThenInclude(i => i.ProductDetail).ThenInclude(p => p.Product).FirstOrDefaultAsync(s => s.Id == storeId);
            Dictionary<int, ProductAndSale> productAndSales = new Dictionary<int, ProductAndSale>();
            var successedOrder = store.Orders.Where(o => o.Status == OrderStatus.Delivered && o.CreateAt >= startDate && o.CreateAt <= endDate);
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
            foreach ( var detail in product.ProductDetails)
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
    }
}