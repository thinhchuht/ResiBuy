using System.ComponentModel.DataAnnotations;

namespace ResiBuy.Server.Infrastructure.Model.DTOs
{
    public class ImportProductExcelRequest
    {
        [Required]
        public IFormFile File { get; set; }
    }
}
