namespace ResiBuy.Server.Application.Commands.BuildingCommands.DTOs
{
    public class UpdateBuildingDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
   
        public bool IsActive { get; set; }
    }
}
