namespace ResiBuy.Server.Application.Commands.RoomCommands.DTOs
{
    public class UpdateRoomDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; }
    }
}
