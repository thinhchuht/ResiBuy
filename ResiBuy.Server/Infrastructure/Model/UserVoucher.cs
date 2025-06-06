namespace ResiBuy.Server.Infrastructure.Model
{
    public class UserVoucher
    {
        public string    UserId    { get; set; }
        public Guid      VoucherId { get; set; }
        public User      User      { get; set; }
        public Voucher   Voucher   { get; set; }
    }
}
