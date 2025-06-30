namespace ResiBuy.Server.Infrastructure.DbServices.VoucherDbServices
{
    public interface IVoucherDbService : IBaseDbService<Voucher>
    {
        Task<PagedResult<Voucher>> GetAllVouchersAsync(Guid? storeId = null, bool? isActive = null, DateTime? startDate = null, DateTime? endDate = null, int pageNumber = 1, int pageSize = 10,string userId = null);
        Task<ResponseModel> UpdateBatchAsync(IEnumerable<Guid?> voucherIds);
        Task<ResponseModel> CheckIsActiveVouchers(IEnumerable<Guid?> voucherIds);
    }
}