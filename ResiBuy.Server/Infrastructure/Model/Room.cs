namespace ResiBuy.Server.Infrastructure.Model
{
    public class Room
    {
        public Guid                  Id         { get; set; } 
        public Guid                  BuildingId { get; set; }
        public Building              Building   { get; set; }
        public IEnumerable<UserRoom> UserRooms  { get; set; }
    }
}
