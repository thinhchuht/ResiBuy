namespace ResiBuy.Server.Infrastructure.Model.DTOs.CartDtos
{
    public class DeleteCartItemsDto
    {
        public List<Guid> CartItemIds { get; set; } = new List<Guid>();
    }
}
