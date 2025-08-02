namespace ResiBuy.Server.Infrastructure.Model.DTOs
{
    public class ProductDto
    {
        public int                   Id           { get; set; }
        public string                 Name         { get; set; }
        public string                 ImageUrl     { get; set; }
        public int                    Quantity     { get; set; }
        public string                 Describe     { get; set; }
        public decimal                Price        { get; set; }
        public float                  Weight       { get; set; }
        public bool                   IsOutOfStock { get; set; }
        public int                    Discount     { get; set; }
        public DateTime               CreatedAt    { get; set; }
        public DateTime               UpdatedAt    { get; set; }
        public Guid                   StoreId      { get; set; }
        public Guid                   CategoryId   { get; set; }

        public ProductDto()
        {
            
        }
        public ProductDto(Product product)
        {
            if (product == null)
                throw new ArgumentNullException(nameof(product));

            Id = product.Id;
            Name = product.Name;
            Describe = product.Describe;
            IsOutOfStock = product.IsOutOfStock;
            Discount = product.Discount;
            CreatedAt = product.CreatedAt;
            UpdatedAt = product.UpdatedAt;
            StoreId = product.StoreId;
            CategoryId = product.CategoryId;

            // Nếu có ít nhất 1 ProductDetail thì lấy bản đầu tiên (giả sử là bản chính)
            var detail = product.ProductDetails?.FirstOrDefault();
            if (detail != null)
            {
                Quantity = detail.Quantity;
                Price = detail.Price;
                Weight = detail.Weight;
                ImageUrl = detail.Image?.Url ?? "";
                IsOutOfStock = detail.IsOutOfStock; // Ưu tiên trạng thái ở ProductDetail
            }
            else
            {
                Quantity = 0;
                Price = 0;
                Weight = 0;
                ImageUrl = "";
            }
        }
    }
}
