namespace ResiBuy.Server.Infrastructure.Model.DTOs
{
    public class BuildingDto
    {
        public Guid   Id       { get; set; }
        public string Name     { get; set; }
        public bool   IsActive { get; set; }
        public Guid   AreaId   { get; set; }
    }
}
