namespace ResiBuy.Server.Infrastructure.Model
{
    public class Area
    {
        public Guid                  Id        { get; set; }
        public string                Name      { get; set; }
        public string                Status    { get; set; }
        public IEnumerable<Building> Buildings { get; set; }
        public IEnumerable<Shipper>  Shippers  { get; set; }
    }
}
