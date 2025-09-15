namespace ResiBuy.Server.Application.Commands.CartCommands.Dtos
{
    public class DeleteCartItemsByCartCommandDto
    {
        public Guid CartId { get; set; }
        public List<Guid> CartItemIds { get; set; } = new();
    }
}
