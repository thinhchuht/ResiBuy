namespace ResiBuy.Server.Infrastructure.DbServices.VoucherDbServices
{
    public interface IVoucherDbService : IBaseDbService<Voucher>
    {
        Task<PagedResult<Voucher>> GetAllVouchersAsync(Guid? storeId = null, bool? isActive = null, bool isGettingNow = false, DateTime? startDate = null, DateTime? endDate = null, int pageNumber = 1, int pageSize = 10, string userId = null, decimal? minOrderPrice = null, VoucherType? type = null);
        Task<IEnumerable<Voucher>> GetAllActiveVouchersAsync();
        Task<ResponseModel> UpdateQuantityBatchAsync(IEnumerable<Guid?> voucherIds);
        Task<ResponseModel> CheckIsActiveVouchers(IEnumerable<Guid?> voucherIds);
    }
}