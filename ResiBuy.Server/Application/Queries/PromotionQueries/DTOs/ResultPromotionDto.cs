namespace ResiBuy.Server.Application.Queries.PromotionQueries.DTOs
{
    public class ResultPromotionDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Discount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
    }
}
