namespace ResiBuy.Server.Infrastructure.Model.DTOs
{
    public class BuildingDto
    {
        public Guid   Id       { get; set; }
        public string Name     { get; set; }
        public bool   IsActive { get; set; }
        public Guid   AreaId   { get; set; }
        public BuildingDto()
        {
            
        }
        public BuildingDto(Building building)
        {
            Id = building.Id;
            Name = building.Name;
            IsActive = building.IsActive;
            AreaId = building.AreaId;
        }
    }
}
