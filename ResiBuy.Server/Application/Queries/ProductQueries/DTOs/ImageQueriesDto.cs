namespace ResiBuy.Server.Application.Queries.ProductQueries.DTOs
{
    public class ImageQueriesDto
    {
        public string Id { get; set; }
        public string Url { get; set; } = null!;
        public string ThumbUrl { get; set; }
        public string Name { get; set; }
    }
}
