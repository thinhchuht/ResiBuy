namespace ResiBuy.Server.Infrastructure.Model.Dtos
{
    public class AreaDto
    {
        public Guid                  Id        { get; set; }
        public string                Name      { get; set; }
        public bool                  IsActive  { get; set; }
        public IEnumerable<Building> Buildings { get; set; }
        public IEnumerable<Shipper>  Shippers  { get; set; }
    }
}
