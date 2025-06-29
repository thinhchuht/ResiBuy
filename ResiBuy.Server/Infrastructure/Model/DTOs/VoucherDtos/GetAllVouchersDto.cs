namespace ResiBuy.Server.Infrastructure.Model.DTOs.VoucherDtos
{
    public class GetAllVouchersDto
    {
        public Guid? StoreId { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string UserId { get; set; }
    }
} 