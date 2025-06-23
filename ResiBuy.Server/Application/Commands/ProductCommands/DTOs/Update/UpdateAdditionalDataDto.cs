namespace ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Update
{
    public class UpdateAdditionalDataDto
    {
        public int Id { get; set; }
        public int ProductDetailId { get; set; }
        public string Key { get; set; }
        public string Value { get; set; }
    }
}
