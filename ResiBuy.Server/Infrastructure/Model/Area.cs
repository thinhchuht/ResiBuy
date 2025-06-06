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

        public Area UpdateAreaStatus()
        {
            IsActive = !IsActive;
            return this;
        }
    }

}
