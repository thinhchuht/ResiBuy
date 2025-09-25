namespace ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Update
{
    public class UpdateProduct2Dto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Describe { get; set; }
        public int PromotionId { get; set; }
        public Guid StoreId { get; set; }
        public Guid CategoryId { get; set; }
        public bool IsOutOfStock { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public int WarrantyMonths { get; set; } = 0;
        public List<UpdateProductDetail2Dto> ProductDetails { get; set; }
    }

    public class UpdateProductDetail2Dto
    {
        public int Id { get; set; }
        public int Price { get; set; }
        public float Weight { get; set; }
        public int Quantity { get; set; }
        public bool IsOutOfStock { get; set; }
        public UpdateImageDto? Image { get; set; }
        public List<UpdateAdditionalDataDto> AdditionalData { get; set; }
        public List<string> ListBarcode { get; set; } 
    }

    public class UpdateImageDto
    {
        public string Id { get; set; }
        public string Url { get; set; }
        public string ThumbUrl { get; set; }
        public string Name { get; set; }
    }

    
}