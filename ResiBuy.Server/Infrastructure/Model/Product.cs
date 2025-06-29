namespace ResiBuy.Server.Infrastructure.Model
{
    public class Product
    {
        public int                   Id           { get; set; }
        public string                 Name         { get; set; }
        public string                 Describe     { get; set; }
        public bool                   IsOutOfStock { get; set; }
        public int                    Discount     { get; set; }
        public DateTime               CreatedAt    { get; set; }
        public DateTime               UpdatedAt    { get; set; }
        public Guid                   StoreId      { get; set; }
        public Guid                 CategoryId   { get; set; }
        public Store                  Store        { get; set; }
        public Category               Category     { get; set; }
        public List<ProductDetail> ProductDetails { get; set; }

        public Product(
           string name,
           string describe,
           int discount,
           Guid storeId,
           Guid categoryId,
           bool isOutOfStock = false)

        {
            Name = name;
            Describe = describe;
            Discount = discount;
            StoreId = storeId;
            CategoryId = categoryId;
            IsOutOfStock = isOutOfStock;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
            ProductDetails = new List<ProductDetail>();
           
        }

        public void UpdateProduct(
              string name,
              string describe,
              int discount,
              Guid categoryId,
              bool isOutOfStock)
        {
            Name = name;
            Describe = describe;
            Discount = discount;
            CategoryId = categoryId;
            IsOutOfStock = isOutOfStock;
            UpdatedAt = DateTime.UtcNow;

        }

        public void UpdateStatusProduct(
              bool isOutOfStock)
        {
            IsOutOfStock = isOutOfStock;
        }




    }


}
