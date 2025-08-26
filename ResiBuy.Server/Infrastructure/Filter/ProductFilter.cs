namespace ResiBuy.Server.Infrastructure.Filter
{
    public class ProductFilter
    {
        public string? Search { get; set; }
        public Guid? StoreId { get; set; }
        public Guid? CategoryId { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? SortBy { get; set; } = "sold"; // "price", "sold", "name", "createdAt"
        public string? SortDirection { get; set; } = "desc"; // "asc" or "desc"
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public bool? IsGettingCategory { get; set; } = false;
        public bool? IsNotGetOutOfStock { get; set; } = false;
        public bool? IsGetStoreOpen { get; set; } = false;
    }

}
