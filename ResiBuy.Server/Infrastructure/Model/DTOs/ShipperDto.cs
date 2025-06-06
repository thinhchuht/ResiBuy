namespace ResiBuy.Server.Infrastructure.Model.DTOs
{
    public class ShipperDto
    {
        public Guid               Id             { get; set; }
        public string             UserId         { get; set; }
        public bool               IsOnline       { get; set; }
        public int                ReportCount    { get; set; }
        public DateTime           StartWorkTime  { get; set; }
        public DateTime           EndWorkTime    { get; set; }
        public Guid               LastLocationId { get; set; } //Area Id
        public IEnumerable<Order> Orders         { get; set; }
    }
}
