namespace ResiBuy.Server.Infrastructure.Model
{
    public class Shipper
    {
        public Guid               Id             { get; set; }
        public string             UserId         { get; set; }
        public bool IsLocked { get; set; } = false;
        public bool               IsOnline       { get; set; }
        public bool               IsShipping     { get; set; } = false;
        public int                ReportCount    { get; set; }
        public float              StartWorkTime  { get; set; }
        public float              EndWorkTime    { get; set; }
        public Guid               LastLocationId { get; set; }
        public DateTime? LastDelivered { get; set; } // Last delivered time
        public User               User           { get; set; }
        public Area               LastLocation   { get; set; } //Area Id
        public IEnumerable<Order> Orders         { get; set; }
    }
}
