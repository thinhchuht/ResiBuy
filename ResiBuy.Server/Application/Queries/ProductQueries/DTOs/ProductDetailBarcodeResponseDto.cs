namespace ResiBuy.Server.Application.Queries.ProductQueries.DTOs
{
    public class ProductDetailBarcodeResponseDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public decimal Price { get; set; }
        public double Weight { get; set; }
        public int Quantity { get; set; }
        public bool IsOutOfStock { get; set; }
        public string Barcode { get; set; } = string.Empty;
        public ImageDto? Image { get; set; }
        public List<AdditionalDataDto> AdditionalData { get; set; } = new();
        public ProductBasicInfoDto? Product { get; set; }
    }

    public class ProductBasicInfoDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Describe { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public int? WarrantyMonths { get; set; }
        public Guid CategoryId { get; set; }
        public Guid StoreId { get; set; }
        public bool IsActive { get; set; }
    }

    public class ImageDto
    {
        public string Id { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string? ThumbUrl { get; set; }
        public string? Name { get; set; }
    }

    public class AdditionalDataDto
    {
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }
}