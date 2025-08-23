namespace ResiBuy.Server.Application.Commands.ImportCommands.DTOs
{
    public class ImportAreaBuildingRoomDto
    {
        public string AreaName { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string BuildingName { get; set; }
        public List<string> RoomNames { get; set; }
    }
}
