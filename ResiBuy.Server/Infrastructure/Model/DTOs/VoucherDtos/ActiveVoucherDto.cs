namespace ResiBuy.Server.Infrastructure.Model.DTOs.VoucherDtos
{
    public class ActiveVoucherDto
    {
        public Guid Id { get; set; }
        public bool IsActive { get; set; }
        public Guid StoreId { get; set; }
    }
}
