namespace ResiBuy.Server.Application.Commands.PromotionCommands.DTOs
{
    public class CreatePromotionDto
    {
        public string Name { get; set; }
        public int Discount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
    }
}
