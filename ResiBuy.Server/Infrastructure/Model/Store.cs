namespace ResiBuy.Server.Infrastructure.Model
{
    public class Store
    {
        public Guid                 Id          { get; set; }
        public string               Name        { get; set; }
        public string               Description { get; set; }
        public string               PhoneNumber { get; set; }
        public bool                 IsLocked    { get; set; }
        public bool                 IsOpen      { get; set; }
        public int                  ReportCount { get; set; }
        public DateTime             CreatedAt   { get; set; }
        public string               OwnerId     { get; set; }
        public Guid                 RoomId      { get; set; }
        public User                 Owner       { get; set; }
        public Room                 Room        { get; set; }
        public IEnumerable<Product> Products    { get; set; }
        public IEnumerable<Voucher> Vouchers    { get; set; }
        public IEnumerable<Order>   Orders      { get; set; }
        public IEnumerable<Event>   Events      { get; set; }
    }
}
