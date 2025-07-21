namespace ResiBuy.Server.Application.Queries.ProductQueries.DTOs
{
    public class ProductDetailQueriesDto
    {
        public int Id { get; set; }
        public bool IsOutOfStock { get; set; }
        public int Sold { get; set; }
        public decimal Price { get; set; }
        public float Weight { get; set; }
        public int Quantity { get; set; } 
        public ImageQueriesDto Image { get; set; }
        public List<AdditionalDataQueriesDto> AdditionalData { get; set; }
    }
}
