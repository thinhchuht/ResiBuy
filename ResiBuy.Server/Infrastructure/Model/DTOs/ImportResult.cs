namespace ResiBuy.Server.Infrastructure.Model.DTOs
{
    public class ImportResult
    {
        public int Total { get; set; }
        public bool Success { get; set; }
        public List<string> Errors { get; set; } = new();
    }
}
