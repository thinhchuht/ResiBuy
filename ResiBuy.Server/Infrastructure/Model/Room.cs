namespace ResiBuy.Server.Infrastructure.Model
{
    public class Room
    {
        public Guid                  Id         { get; set; } 
        public bool IsActive { get; set; }
        public Guid                  BuildingId { get; set; }
        public Building              Building   { get; set; }
        public IEnumerable<UserRoom> UserRooms  { get; set; }

        public Room(Guid buildingId)
        {
            BuildingId = buildingId;
            IsActive = true;
            UserRooms = new List<UserRoom>();
        }

        public Room UpdateStatus()
        {
            IsActive = !IsActive;
            return this;
        }
    }
}
