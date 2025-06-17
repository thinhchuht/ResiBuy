namespace ResiBuy.Server.Infrastructure.Model.DTOs.CartDtos
{
    public class AddToCartDto
    {
        public int Quantity { get; set; }
        public Guid ProductId { get; set; }
        public Guid CostDataId { get; set; } 
        public List<Guid> UncostDataIds { get; set; }
        public bool IsAdd { get; set; }
    }
}
