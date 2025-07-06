using System.ComponentModel.DataAnnotations;

namespace ResiBuy.Server.Application.Commands.AreaCommands.DTOs
{
    public class CommanAreaDto
    {
        public string Name { get; set; }
        public bool IsActive { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}
