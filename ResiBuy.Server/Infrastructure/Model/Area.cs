namespace ResiBuy.Server.Infrastructure.Model
{
    public class Area
    {
        public Guid                  Id        { get; set; }
        public string                Name      { get; set; }
        public bool                  IsActive  { get; set; }
        public IEnumerable<Building> Buildings { get; set; } 
        public IEnumerable<Shipper>  Shippers  { get; set; }
        public Area()
        {
            
        }
        public Area(string name)
        {
            Name = name;
            IsActive = true;
        }
        public void UpdateArea(string name, bool? isActive = null)
        {
            if (!string.IsNullOrWhiteSpace(name))
                Name = name;
            if (isActive.HasValue)
                IsActive = isActive.Value;
        }
        public Area UpdateAreaStatus()
        {
            IsActive = !IsActive;
            return this;
        }
    }

}
