namespace ResiBuy.Server.Infrastructure.Model.DTOs
{
    public class RoomDto
    {
        public Guid   Id         { get; set; }
        public string Name       { get; set; }
        public bool   IsActive   { get; set; }
        public Guid   BuildingId { get; set; }
    }
}
