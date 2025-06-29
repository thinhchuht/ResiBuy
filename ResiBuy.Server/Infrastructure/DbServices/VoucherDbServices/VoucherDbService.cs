namespace ResiBuy.Server.Infrastructure.DbServices.VoucherDbServices
{
    public class VoucherDbService : BaseDbService<Voucher>, IVoucherDbService
    {
        private readonly ResiBuyContext context;
        public VoucherDbService(ResiBuyContext context) : base(context)
        {
            this.context = context;
        }

        public async Task<ResponseModel> CheckIsActiveVouchers(IEnumerable<Guid?> voucherIds)
        {
            var now = DateTime.Now;
            var vouchers = await context.Vouchers
                .Where(v => voucherIds.Contains(v.Id))
                .ToListAsync();

            var invalidVouchers = vouchers
                .Where(v => !v.IsActive || v.EndDate < now)
                .ToList();

            if (invalidVouchers.Any())
            {
                return ResponseModel.FailureResponse($"Có {invalidVouchers.Count} voucher không còn hiệu lực hoặc đã hết hạn.");
            }

            return ResponseModel.SuccessResponse("Tất cả voucher còn hiệu lực.");
        }

        public async Task<PagedResult<Voucher>> GetAllVouchersAsync(Guid? storeId = null, bool? isActive = null, DateTime? startDate = null, DateTime? endDate = null, int pageNumber = 1, int pageSize = 10, string userId = null)
        {
            var query = context.Vouchers.AsQueryable();

            if (storeId.HasValue)
                query = query.Where(v => v.StoreId == storeId.Value);

            if (isActive.HasValue)
                query = query.Where(v => v.IsActive == isActive.Value);

            if (startDate.HasValue)
                query = query.Where(v => v.StartDate >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(v => v.EndDate <= endDate.Value);

            if (!string.IsNullOrEmpty(userId))
                query = query.Where(v => v.UserVouchers.Any(uv => uv.UserId == userId));

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(v => v.StartDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<Voucher>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<ResponseModel> UpdateBatchAsync(IEnumerable<Guid?> voucherIds)
        {
            try
            {

                if (!voucherIds.Any())
                    return ResponseModel.FailureResponse("Không có Voucher nào.");

                var vouchers = await context.Vouchers
                    .Where(v => voucherIds.Contains(v.Id))
                    .ToListAsync();

                if (!vouchers.Any())
                    return ResponseModel.FailureResponse("Không có Voucher nào.");

                foreach (var voucher in vouchers)
                {
                    if (voucher == null)
                        voucher.UpdateQuantity(voucher.Quantity - 1);
                }

                context.Vouchers.UpdateRange(vouchers);
                context.SaveChanges();

                return ResponseModel.SuccessResponse("Update voucher thành công.");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                return ResponseModel.FailureResponse("Cập nhật voucher thất bại.");
            }

        }
    }
}
