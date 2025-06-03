namespace ResiBuy.Server.Infrastructure.Model
{
    public class Building
    {
        public Guid              Id     { get; set; }
        public string            Name   { get; set; }
        public string            Status { get; set; }
        public Guid              AreaId { get; set; }
        public Area              Area   { get; set; }
        public IEnumerable<Room> Rooms  { get; set; }
    }
}
