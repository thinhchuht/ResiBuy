namespace ResiBuy.Server.Infrastructure.Model
{
    public class Shipper
    {
        public Guid               Id             { get; set; }
        public string             UserId         { get; set; }
        public bool               IsOnline       { get; set; }
        public int                ReportCount    { get; set; }
        public DateTime           StartWorkTime  { get; set; }
        public DateTime           EndWorkTime    { get; set; }
        public Guid               LastLocationId { get; set; }
        public User               User           { get; set; }
        public Area               LastLocation   { get; set; } //Area Id
        public IEnumerable<Order> Orders         { get; set; }
    }
}
