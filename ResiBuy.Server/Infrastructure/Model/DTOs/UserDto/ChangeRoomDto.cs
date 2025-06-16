namespace ResiBuy.Server.Infrastructure.Model.DTOs.UserDto
{
    public class ChangeRoomDto
    {
        public Guid NewRoomId { get; set; }
        public Guid BuildingId { get; set; }
        public Guid AreaId { get; set; }
    }
}
