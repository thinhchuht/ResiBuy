namespace ResiBuy.Server.Application.Commands.OrderCommands.Dtos
{
    public class RemoveBarcodeFromOrderDto
    {
        public string BarcodeToRemove { get; set; }
        public bool IsRemoveFromStore { get; set; } = false;
    }
}
