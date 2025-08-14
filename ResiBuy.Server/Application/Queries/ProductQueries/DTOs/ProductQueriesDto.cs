namespace ResiBuy.Server.Application.Queries.ProductQueries.DTOs
{
    public class ProductQueriesDto
    {   
        public int Id { get; set; }
        public string Name { get; set; }
        public string Describe { get; set; }
        public bool IsOutOfStock { get; set; }
        public int Discount { get; set; }
        public int Sold { get; set; }
        public Guid StoreId { get; set; }
        public Guid CategoryId { get; set; }    
        public object Category { get; set; }
        public List<ProductDetailQueriesDto> ProductDetails { get; set; }
    }
}
