namespace ResiBuy.Server.Application.Commands.AreaCommands.DTOs
{
    public class UpdateAreaDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public bool? IsActive { get; set; }
    }
}
