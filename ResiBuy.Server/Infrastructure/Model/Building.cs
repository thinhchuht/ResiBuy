namespace ResiBuy.Server.Infrastructure.Model
{
    public class Building
    {
        public Guid              Id     { get; set; }
        public string            Name   { get; set; }
        public bool              IsActive { get; set; }
        public Guid              AreaId { get; set; }
        public Area              Area   { get; set; }
        public IEnumerable<Room> Rooms  { get; set; }
        public Building()
        {
            
        }

        public Building(string name, Guid areaId)
        {
            Name = name;
            AreaId = areaId;
            IsActive = true;
        }

        public Building UpdateStatus()
        {
            IsActive = !IsActive;
            return this;
        }
    }

}
