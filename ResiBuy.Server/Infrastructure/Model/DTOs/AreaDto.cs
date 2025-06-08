namespace ResiBuy.Server.Infrastructure.Model.Dtos
{
    public class AreaDto
    {
        public Guid                  Id        { get; set; }
        public string                Name      { get; set; }
        public bool                  IsActive  { get; set; }
        public IEnumerable<Building> Buildings { get; set; }
        public IEnumerable<Shipper>  Shippers  { get; set; }

        public AreaDto()
        {
            
        }

        public AreaDto(Area area)
        {
            Id = area.Id;
            Name = area.Name;
            IsActive = area.IsActive;
            Buildings = area.Buildings ?? new List<Building>();
            Shippers = area.Shippers ?? new List<Shipper>();
        }
    }
}
