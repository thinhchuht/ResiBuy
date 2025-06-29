namespace ResiBuy.Server.Infrastructure.Model.DTOs.UserDtos
{
    public class ChangeRoomDto
    {
        public Guid NewRoomId { get; set; }
        public Guid BuildingId { get; set; }
        public Guid AreaId { get; set; }
    }
}
